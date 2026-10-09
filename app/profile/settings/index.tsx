import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { SupportContactRow } from '../../../src/components/SupportContactRow';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, preference } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  const rows = [
    {
      id: 'account',
      title: english ? 'Account' : 'Cuenta',
      subtitle: english ? 'Email, session and security' : 'Correo, sesión y seguridad',
      route: '/profile/settings/account' as const,
    },
    {
      id: 'appearance',
      title: english ? 'Appearance' : 'Apariencia',
      subtitle: english ? 'Choose light or dark theme' : 'Selecciona tema claro u oscuro',
      route: '/profile/settings/appearance' as const,
    },
    {
      id: 'language',
      title: english ? 'Language' : 'Idioma',
      subtitle: english ? 'English or Spanish' : 'Español o English',
      route: '/profile/settings/language' as const,
    },
    {
      id: 'notifications',
      title: english ? 'Notifications' : 'Notificaciones',
      subtitle: english
        ? 'Push, general, radio, programs and dynamics'
        : 'Push, general, radio, programas y dinámicas',
      route: '/profile/settings/notifications' as const,
    },
    {
      id: 'privacy',
      title: english ? 'Privacy & about' : 'Privacidad y acerca de',
      subtitle: english ? 'Legal, support and information' : 'Legal, soporte e información',
      route: '/profile/settings/privacy' as const,
    },
  ];

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safe}
    >
      <View style={styles.content}>
        <ScreenHeader title={english ? 'Settings' : 'Configuración'} />
        <Text style={[styles.title, { color: colors.white }]}>
          {english ? 'App preferences' : 'Preferencias de la app'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Customize how LA Z looks and behaves on this device.'
            : 'Personaliza cómo se ve y cómo se comporta LA Z en este dispositivo.'}
        </Text>

        <View style={styles.rows}>
          {rows.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => router.push(row.route)}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: colors.white }]}>
                  {row.title}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                  {row.subtitle}
                </Text>
              </View>
              {row.id === 'appearance' ? (
                <Text style={[styles.value, { color: colors.red }]}>
                  {preference === 'dark'
                    ? english
                      ? 'Dark'
                      : 'Oscuro'
                    : english
                      ? 'Light'
                      : 'Claro'}
                </Text>
              ) : null}
              {row.id === 'language' ? (
                <Text style={[styles.value, { color: colors.red }]}>
                  {language === 'en' ? 'English' : 'Español'}
                </Text>
              ) : null}
              <Ionicons color={colors.gray} name="chevron-forward" size={20} />
            </Pressable>
          ))}
        </View>
        <Text style={[styles.supportTitle, { color: colors.white }]}>
          {english ? 'Help & support' : 'Ayuda y soporte'}
        </Text>
        <SupportContactRow />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  title: {
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
  rows: {
    gap: 10,
    marginTop: spacing.lg,
  },
  row: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: spacing.md,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  rowSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  supportTitle: { fontFamily: fonts.displayExtraBold, fontSize: 23, marginTop: spacing.lg, marginBottom: 12 },
  value: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginRight: 8,
  },
});
