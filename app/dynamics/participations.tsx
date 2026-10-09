import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { getFirebaseSecurityTokens } from '../../src/features/auth/firebase';
import {
  UserParticipationItem,
  getMyParticipations,
} from '../../src/features/dynamics/api';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

export default function MyDynamicsParticipationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const { isAuthenticated, status } = useAuth();
  const [items, setItems] = useState<UserParticipationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const security = await getFirebaseSecurityTokens(true);
      const page = await getMyParticipations(security, 20);
      setItems(page.items);
      setNextCursor(page.nextCursor);
    } catch (requestError) {
      setItems([]);
      setNextCursor(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : english
            ? 'We could not load your participations.'
            : 'No pudimos cargar tus participaciones.',
      );
    } finally {
      setLoading(false);
    }
  }, [english, isAuthenticated]);

  const loadMore = useCallback(async () => {
    if (!isAuthenticated || !nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const security = await getFirebaseSecurityTokens(true);
      const page = await getMyParticipations(
        security,
        20,
        nextCursor,
      );
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : english
            ? 'We could not load more participations.'
            : 'No pudimos cargar más participaciones.',
      );
    } finally {
      setLoadingMore(false);
    }
  }, [english, isAuthenticated, loadingMore, nextCursor]);

  useFocusEffect(
    useCallback(() => {
      if (status === 'signedOut') {
        router.replace('/auth');
        return undefined;
      }

      void load();
      return undefined;
    }, [load, router, status]),
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={english ? 'My participations' : 'Mis participaciones'}
        />

        <Text style={[styles.heading, { color: colors.white }]}>
          {english ? 'Your Dynamics history' : 'Tu historial de Dynamics'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Entries accepted with your LA Z account appear here while they remain within the campaign retention period.'
            : 'Aquí aparecen las participaciones aceptadas con tu cuenta LA Z mientras permanezcan dentro del periodo de retención de la campaña.'}
        </Text>

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              {english ? 'Loading history…' : 'Cargando historial…'}
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              color={colors.red}
              name="cloud-offline-outline"
              size={28}
            />
            <Text style={[styles.errorText, { color: colors.white }]}>
              {error}
            </Text>
            <PrimaryButton
              label={english ? 'Retry' : 'Reintentar'}
              onPress={() => void load()}
              secondary
            />
          </View>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="ticket-outline" size={34} />
            <Text style={[styles.emptyTitle, { color: colors.white }]}>
              {english
                ? 'No participations yet'
                : 'Aún no tienes participaciones'}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>
              {english
                ? 'When you register for an in-app Dynamic with your LA Z account, it will appear here.'
                : 'Cuando te registres en una Dynamic dentro de la app con tu cuenta LA Z, aparecerá aquí.'}
            </Text>
            <PrimaryButton
              label={english ? 'View Dynamics' : 'Ver Dynamics'}
              onPress={() => router.push('/dynamics')}
            />
          </View>
        ) : null}

        {!loading && !error && items.length ? (
          <View style={styles.list}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: '/dynamics/[id]',
                    params: { id: item.dynamicId },
                  })
                }
                style={[
                  styles.item,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: 'rgba(211,10,18,0.14)' },
                  ]}
                >
                  <Ionicons
                    color={colors.red}
                    name="checkmark-circle-outline"
                    size={24}
                  />
                </View>

                <View style={styles.itemCopy}>
                  <Text
                    numberOfLines={2}
                    style={[styles.itemTitle, { color: colors.white }]}
                  >
                    {item.dynamicTitle ||
                      (english ? 'LA Z Dynamic' : 'Dynamic de LA Z')}
                  </Text>
                  <Text style={[styles.itemStatus, { color: '#56C985' }]}>
                    {english ? 'ENTRY ACCEPTED' : 'PARTICIPACIÓN ACEPTADA'}
                  </Text>
                  <Text style={[styles.itemDate, { color: colors.muted }]}>
                    {new Date(item.submittedAt).toLocaleString(
                      english ? 'en-US' : 'es-MX',
                    )}
                  </Text>
                </View>

                <Ionicons
                  color={colors.gray}
                  name="chevron-forward"
                  size={20}
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        {!loading && !error && nextCursor ? (
          <View style={styles.loadMore}>
            <PrimaryButton
              disabled={loadingMore}
              label={
                loadingMore
                  ? english
                    ? 'Loading…'
                    : 'Cargando…'
                  : english
                    ? 'Load more'
                    : 'Cargar más'
              }
              onPress={() => void loadMore()}
              secondary
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 120,
    paddingHorizontal: spacing.md,
  },
  heading: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  state: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 80,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  errorCard: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 12,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 10,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  list: {
    gap: 10,
    marginTop: spacing.lg,
  },
  loadMore: {
    marginTop: spacing.lg,
  },
  item: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 94,
    padding: spacing.md,
  },
  itemIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  itemCopy: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  itemStatus: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.7,
    marginTop: 5,
  },
  itemDate: {
    fontFamily: fonts.body,
    fontSize: 9,
    marginTop: 4,
  },
});
