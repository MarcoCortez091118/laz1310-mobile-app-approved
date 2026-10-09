import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SupportContactRow } from '../../src/components/SupportContactRow';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { PRIVACY_POLICY_VERSION } from '../../src/features/privacy/policy';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

function initials(name: string | null, email: string | null) {
  const source = (name || email || 'LA Z').trim();
  const words = source.split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { status, isAuthenticated, profile, error, refreshProfile } = useAuth();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  if (status === 'initializing' || status === 'syncing') {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.red} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            {english ? 'Syncing your profile…' : 'Sincronizando tu perfil…'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error' && !isAuthenticated) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.loading}>
          <Ionicons color={colors.red} name="cloud-offline-outline" size={36} />
          <Text style={[styles.errorTitle, { color: colors.white }]}>
            {english ? 'We could not validate your session' : 'No pudimos validar tu sesión'}
          </Text>
          <Text style={[styles.errorBody, { color: colors.muted }]}>
            {error ??
              (english
                ? 'Please check your connection and try again.'
                : 'Revisa tu conexión e inténtalo de nuevo.')}
          </Text>
          <View style={styles.retry}>
            <PrimaryButton label={english ? 'Retry' : 'Reintentar'} onPress={() => void refreshProfile()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'signedOut') {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.white }]}>
            {english ? 'Profile' : 'Perfil'}
          </Text>
          <View style={[styles.guestCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="person-circle-outline" size={52} />
            <Text style={[styles.guestTitle, { color: colors.white }]}>
              {english ? 'Your LA Z experience' : 'Tu experiencia LA Z'}
            </Text>
            <Text style={[styles.guestBody, { color: colors.muted }]}>
              {english
                ? 'Listen freely. Sign in only when you want to join promotions or manage your account.'
                : 'Escucha libremente. Inicia sesión cuando quieras participar en dinámicas o administrar tu cuenta.'}
            </Text>
            <PrimaryButton label={english ? 'Sign in or register' : 'Iniciar sesión o registrarse'} onPress={() => router.push('/auth')} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            {english ? 'App preferences' : 'Preferencias de la app'}
          </Text>
          <View style={styles.rows}>
            {[
              {
                id: 'appearance',
                label: english ? 'Appearance' : 'Apariencia',
                route: '/profile/settings/appearance' as const,
                icon: 'color-palette-outline' as const,
              },
              {
                id: 'language',
                label: english ? 'Language' : 'Idioma',
                route: '/profile/settings/language' as const,
                icon: 'language-outline' as const,
              },
              {
                id: 'privacy',
                label: english ? 'Privacy policy' : 'Política de privacidad',
                route: '/profile/settings/privacy-policy' as const,
                icon: 'shield-checkmark-outline' as const,
              },
            ].map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => router.push(item.route)}
                style={[styles.row, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              >
                <Ionicons color={colors.red} name={item.icon} size={22} />
                <Text style={[styles.guestRowLabel, { color: colors.white }]}>{item.label}</Text>
                <Ionicons color={colors.gray} name="chevron-forward" size={20} />
              </Pressable>
            ))}
          </View>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            {english ? 'Support' : 'Soporte'}
          </Text>
          <SupportContactRow />
        </ScrollView>
        <BottomNavigation />
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.white }]}>{english ? 'Profile' : 'Perfil'}</Text>

        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.red }]}>
            <Text style={styles.avatarText}>{initials(profile.displayName, profile.email)}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: colors.white }]}>
              {profile.displayName || (english ? 'Complete your profile' : 'Completa tu perfil')}
            </Text>
            <Text style={[styles.email, { color: colors.muted }]}>
              {profile.email || (english ? 'No email available' : 'Sin correo disponible')}
            </Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: profile.emailVerified ? 'rgba(36, 166, 91, 0.14)' : colors.surfaceElevated, borderColor: colors.border }]}>
                <Ionicons color={profile.emailVerified ? '#56C985' : colors.muted} name={profile.emailVerified ? 'checkmark-circle-outline' : 'mail-unread-outline'} size={13} />
                <Text style={[styles.badgeText, { color: profile.emailVerified ? '#56C985' : colors.muted }]}>
                  {profile.emailVerified
                    ? english ? 'EMAIL VERIFIED' : 'EMAIL VERIFICADO'
                    : english ? 'EMAIL PENDING' : 'EMAIL PENDIENTE'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label={english ? 'Edit profile' : 'Editar perfil'} onPress={() => router.push('/profile/edit')} secondary />
        </View>

        <View style={[styles.accountCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={styles.accountRow}>
            <Ionicons color={colors.red} name="location-outline" size={20} />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountLabel, { color: colors.muted }]}>{english ? 'TIME ZONE' : 'ZONA HORARIA'}</Text>
              <Text style={[styles.accountValue, { color: colors.white }]}>{profile.timezone || (english ? 'Pending' : 'Pendiente')}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.accountRow}>
            <Ionicons color={colors.red} name="language-outline" size={20} />
            <View style={styles.accountCopy}>
              <Text style={[styles.accountLabel, { color: colors.muted }]}>{english ? 'LOCALE' : 'IDIOMA'}</Text>
              <Text style={[styles.accountValue, { color: colors.white }]}>{profile.locale || (english ? 'Pending' : 'Pendiente')}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.white }]}>{english ? 'Account & app' : 'Cuenta y aplicación'}</Text>

        <View style={styles.rows}>
          <Pressable onPress={() => router.push('/profile/settings/account')} style={[styles.row, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="person-circle-outline" size={21} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>{english ? 'Account' : 'Cuenta'}</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{english ? 'Email, verification and session' : 'Correo, verificación y sesión'}</Text>
            </View>
            <Ionicons color={colors.gray} name="chevron-forward" size={20} />
          </Pressable>

          <Pressable onPress={() => router.push('/dynamics/participations')} style={[styles.row, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="ticket-outline" size={21} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>{english ? 'My participations' : 'Mis participaciones'}</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{english ? 'Dynamics registered with your LA Z account' : 'Dynamics registradas con tu cuenta LA Z'}</Text>
            </View>
            <Ionicons color={colors.gray} name="chevron-forward" size={20} />
          </Pressable>

          <Pressable onPress={() => router.push('/profile/settings')} style={[styles.row, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="settings-outline" size={21} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>{english ? 'Settings' : 'Configuración'}</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{english ? 'Appearance and available preferences' : 'Apariencia y preferencias disponibles'}</Text>
            </View>
            <Ionicons color={colors.gray} name="chevron-forward" size={20} />
          </Pressable>

          <Pressable onPress={() => router.push('/profile/settings/privacy')} style={[styles.row, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="shield-checkmark-outline" size={21} />
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: colors.white }]}>{english ? 'Privacy & data' : 'Privacidad y datos'}</Text>
              <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                {profile.privacyPolicyVersion === PRIVACY_POLICY_VERSION && profile.privacyPolicyAcceptedAt
                  ? english ? 'Current privacy policy accepted' : 'Política de privacidad vigente aceptada'
                  : english ? 'Review privacy policy and consent' : 'Revisa la política y el consentimiento'}
              </Text>
            </View>
            <Ionicons
              color={profile.privacyPolicyVersion === PRIVACY_POLICY_VERSION && profile.privacyPolicyAcceptedAt ? '#56C985' : colors.gray}
              name={profile.privacyPolicyVersion === PRIVACY_POLICY_VERSION && profile.privacyPolicyAcceptedAt ? 'checkmark-circle-outline' : 'chevron-forward'}
              size={20}
            />
          </Pressable>
        </View>

        <Text style={[styles.scopeNote, { color: colors.muted }]}>
          {english
            ? 'Thanks for being part of LA Z Detroit.'
            : 'Gracias por formar parte de LA Z Detroit.'}
        </Text>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  loadingText: { fontFamily: fonts.body, fontSize: 12, marginTop: 12 },
  errorTitle: { fontFamily: fonts.displayExtraBold, fontSize: 28, marginTop: 18, textAlign: 'center' },
  errorBody: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center' },
  retry: { marginTop: 24, width: '100%' },
  content: { paddingBottom: 180, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 36 },
  guestCard: { alignItems: 'center', borderRadius: radii.lg, borderWidth: 1, gap: 16, marginTop: spacing.lg, padding: spacing.lg },
  guestTitle: { fontFamily: fonts.displayExtraBold, fontSize: 26, textAlign: 'center' },
  guestBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  guestRowLabel: { flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 15, marginLeft: 12 },
  profileRow: { alignItems: 'center', flexDirection: 'row', marginTop: 24 },
  avatar: { alignItems: 'center', borderRadius: 48, height: 96, justifyContent: 'center', width: 96 },
  avatarText: { color: '#FEFEFE', fontFamily: fonts.displayExtraBold, fontSize: 34 },
  profileCopy: { flex: 1, marginLeft: spacing.md },
  name: { fontFamily: fonts.displayExtraBold, fontSize: 29 },
  email: { fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  badges: { flexDirection: 'row', marginTop: 9 },
  badge: { alignItems: 'center', borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.3 },
  actions: { marginTop: 18 },
  accountCard: { borderRadius: radii.md, borderWidth: 1, marginTop: 24, paddingHorizontal: spacing.md },
  accountRow: { alignItems: 'center', flexDirection: 'row', minHeight: 70 },
  accountCopy: { flex: 1, marginLeft: 12 },
  accountLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.5 },
  accountValue: { fontFamily: fonts.bodySemiBold, fontSize: 13, marginTop: 3 },
  divider: { height: 1 },
  sectionTitle: { fontFamily: fonts.displayExtraBold, fontSize: 26, marginTop: 26 },
  rows: { gap: 10, marginTop: 12 },
  row: { alignItems: 'center', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', minHeight: 66, paddingHorizontal: spacing.md },
  rowCopy: { flex: 1, marginLeft: 12 },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  scopeNote: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 22, textAlign: 'center' },
});
