import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { getFirebaseSecurityTokens } from '../../src/features/auth/firebase';
import {
  getNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationInboxItem,
} from '../../src/features/notifications/api';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function supportedTarget(value: string): Href | null {
  if (value === '/home' || value === '/radio' || value === '/dynamics') {
    return value;
  }
  if (/^\/dynamics\/[0-9a-f-]+$/i.test(value)) return value as Href;
  return null;
}

function categoryIcon(type: NotificationInboxItem['type']) {
  if (type === 'radio') return 'radio-outline' as const;
  if (type === 'programs') return 'mic-outline' as const;
  if (type === 'dynamics') return 'sparkles-outline' as const;
  return 'notifications-outline' as const;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotificationInboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unread = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tokens = await getFirebaseSecurityTokens(true);
      const page = await getNotificationInbox(tokens, { limit: 50 });
      setItems(page.items);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : english
            ? 'Could not load notifications.'
            : 'No pudimos cargar las notificaciones.',
      );
    } finally {
      setLoading(false);
    }
  }, [english, isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openItem = useCallback(
    async (item: NotificationInboxItem) => {
      try {
        if (!item.readAt) {
          const tokens = await getFirebaseSecurityTokens(true);
          const updated = await markNotificationRead(tokens, item.id);
          setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
        }
      } finally {
        const target = supportedTarget(item.target.value);
        if (target) router.push(target);
      }
    },
    [router],
  );

  const readAll = useCallback(async () => {
    const tokens = await getFirebaseSecurityTokens(true);
    const response = await markAllNotificationsRead(tokens);
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? response.readAt })));
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading && items.length > 0} onRefresh={() => void refresh()} tintColor={colors.red} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={english ? 'Back' : 'Regresar'}
            accessibilityRole="button"
            onPress={() => router.back()}
            style={[styles.back, { backgroundColor: colors.surfaceElevated }]}
          >
            <Ionicons color={colors.white} name="chevron-back" size={22} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.red }]}>
              {english ? 'YOUR LA Z INBOX' : 'TU BUZÓN DE LA Z'}
            </Text>
            <Text style={[styles.title, { color: colors.white }]}>
              {english ? 'Notifications' : 'Notificaciones'}
            </Text>
          </View>
        </View>

        {!isAuthenticated ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="person-circle-outline" size={38} />
            <Text style={[styles.stateTitle, { color: colors.white }]}>
              {english ? 'Sign in to see your notifications' : 'Inicia sesión para ver tus notificaciones'}
            </Text>
            <Pressable onPress={() => router.push('/auth')} style={[styles.primary, { backgroundColor: colors.red }]}>
              <Text style={styles.primaryText}>{english ? 'SIGN IN' : 'INICIAR SESIÓN'}</Text>
            </Pressable>
          </View>
        ) : loading && !items.length ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.red} size="large" />
          </View>
        ) : error && !items.length ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="alert-circle-outline" size={34} />
            <Text style={[styles.stateTitle, { color: colors.white }]}>{error}</Text>
            <Pressable onPress={() => void refresh()} style={[styles.primary, { backgroundColor: colors.red }]}>
              <Text style={styles.primaryText}>{english ? 'RETRY' : 'REINTENTAR'}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.toolbar}>
              <Text style={[styles.summary, { color: colors.muted }]}>
                {unread
                  ? english
                    ? `${unread} unread`
                    : `${unread} sin leer`
                  : english
                    ? 'All caught up'
                    : 'Todo al día'}
              </Text>
              {unread ? (
                <Pressable onPress={() => void readAll()}>
                  <Text style={[styles.readAll, { color: colors.red }]}>
                    {english ? 'Mark all read' : 'Marcar todas leídas'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {items.length ? (
              <View style={styles.list}>
                {items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => void openItem(item)}
                    style={({ pressed }) => [
                      styles.item,
                      {
                        backgroundColor: item.readAt ? colors.surface : colors.surfaceElevated,
                        borderColor: item.readAt ? colors.border : colors.red,
                        opacity: pressed ? 0.76 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: colors.burgundy }]}>
                      <Ionicons color={colors.red} name={categoryIcon(item.type)} size={22} />
                    </View>
                    <View style={styles.itemCopy}>
                      <View style={styles.itemTop}>
                        <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.white }]}>{item.title}</Text>
                        {!item.readAt ? <View style={[styles.unreadDot, { backgroundColor: colors.red }]} /> : null}
                      </View>
                      <Text numberOfLines={3} style={[styles.itemBody, { color: colors.muted }]}>{item.body}</Text>
                      <Text style={[styles.itemDate, { color: colors.gray }]}>
                        {new Intl.DateTimeFormat(english ? 'en-US' : 'es-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(item.createdAt))}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons color={colors.gray} name="notifications-off-outline" size={36} />
                <Text style={[styles.stateTitle, { color: colors.white }]}>
                  {english ? 'No notifications yet' : 'Aún no hay notificaciones'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 170,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  back: {
    alignItems: 'center',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerCopy: { flex: 1 },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 38,
    lineHeight: 40,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  summary: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  readAll: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  list: {
    gap: 10,
    marginTop: spacing.sm,
  },
  item: {
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  itemCopy: { flex: 1 },
  itemTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  unreadDot: {
    borderRadius: 99,
    height: 7,
    width: 7,
  },
  itemBody: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  itemDate: {
    fontFamily: fonts.body,
    fontSize: 9,
    marginTop: 8,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  stateCard: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  stateTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    textAlign: 'center',
  },
  primary: {
    borderRadius: 10,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  primaryText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.7,
  },
});
