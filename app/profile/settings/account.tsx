import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

export default function AccountScreen() {
  const router = useRouter();
  const { profile, signOut, refreshProfile, sendVerificationEmail } = useAuth();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    if (working) return;
    setWorking(true);
    setMessage(null);
    setError(null);
    try {
      await sendVerificationEmail();
      setMessage(english ? 'Check your inbox for a verification link.' : 'Revisa tu correo para confirmar tu cuenta.');
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : english ? 'We could not send the email.' : 'No pudimos enviar el correo.');
    } finally {
      setWorking(false);
    }
  };

  const refresh = async () => {
    if (working) return;
    setWorking(true);
    setMessage(null);
    setError(null);
    try {
      await refreshProfile();
      setMessage(english ? 'Account status updated.' : 'Estado de la cuenta actualizado.');
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : english ? 'We could not update the account.' : 'No pudimos actualizar la cuenta.');
    } finally {
      setWorking(false);
    }
  };

  if (!profile) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.content}>
        <ScreenHeader title={english ? 'Account' : 'Cuenta'} />

        <Text style={[styles.title, { color: colors.white }]}>{english ? 'Your account' : 'Tu cuenta'}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Review your email, verification status and active session.'
            : 'Consulta tu correo, estado de verificación y sesión activa.'}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.muted }]}>{english ? 'EMAIL' : 'CORREO'}</Text>
          <Text style={[styles.value, { color: colors.white }]}>{profile.email || (english ? 'No email' : 'Sin correo')}</Text>
          <View style={styles.statusRow}>
            <Ionicons color={profile.emailVerified ? '#56C985' : colors.red} name={profile.emailVerified ? 'checkmark-circle-outline' : 'mail-unread-outline'} size={18} />
            <Text style={[styles.verified, { color: profile.emailVerified ? '#56C985' : colors.red }]}>
              {profile.emailVerified
                ? english ? 'VERIFIED' : 'VERIFICADO'
                : english ? 'VERIFICATION PENDING' : 'PENDIENTE DE VERIFICAR'}
            </Text>
          </View>
        </View>

        {message ? <Text style={[styles.message, { color: '#56C985' }]}>{message}</Text> : null}
        {error ? <Text style={[styles.message, { color: colors.red }]}>{error}</Text> : null}

        <View style={styles.actions}>
          {!profile.emailVerified ? (
            <>
              <PrimaryButton disabled={working} label={working ? (english ? 'Processing…' : 'Procesando…') : (english ? 'Send verification' : 'Enviar verificación')} onPress={() => void verify()} />
              <PrimaryButton disabled={working} label={english ? 'I verified · refresh' : 'Ya verifiqué · actualizar'} onPress={() => void refresh()} secondary />
            </>
          ) : null}

          <PrimaryButton label={english ? 'Sign out' : 'Cerrar sesión'} onPress={() => { void signOut().then(() => router.replace('/auth')); }} secondary />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.md },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 30, marginTop: spacing.lg },
  subtitle: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  card: { borderRadius: radii.md, borderWidth: 1, marginTop: spacing.lg, padding: spacing.md },
  label: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1 },
  value: { fontFamily: fonts.bodySemiBold, fontSize: 15, marginTop: 8 },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 10 },
  verified: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1 },
  message: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 16, marginTop: 14 },
  actions: { gap: 12, marginTop: spacing.lg },
});
