import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, spacing } from '../../src/theme/tokens';

export default function DynamicsConfirmationScreen() {
  const router = useRouter();
  const { title, receiptId, submittedAt } = useLocalSearchParams<{
    title?: string;
    receiptId?: string;
    submittedAt?: string;
  }>();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: colors.red }]}>
          <Ionicons color="#FEFEFE" name="checkmark" size={42} />
        </View>

        <Text style={[styles.title, { color: colors.white }]}>
          {english ? 'Entry received' : 'Participación recibida'}
        </Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          {title
            ? english
              ? `Your entry for “${title}” was accepted by LA Z API.`
              : `Tu participación para “${title}” fue aceptada por LA Z API.`
            : english
              ? 'Your entry was accepted by LA Z API.'
              : 'Tu participación fue aceptada por LA Z API.'}
        </Text>
        {submittedAt ? (
          <Text style={[styles.note, { color: colors.muted }]}>
            {english ? 'Received ' : 'Recibida '}
            {new Date(submittedAt).toLocaleString(english ? 'en-US' : 'es-US')}
          </Text>
        ) : null}
        {receiptId ? (
          <Text numberOfLines={1} style={[styles.receipt, { color: colors.muted }]}>
            {english ? 'Receipt' : 'Recibo'}: {receiptId}
          </Text>
        ) : null}

        <Text style={[styles.guidance, { color: colors.muted }]}>
          {english
            ? 'Keep access to the email registered on your LA Z account and enable app notifications to receive campaign updates.'
            : 'Mantén acceso al correo registrado en tu cuenta LA Z y habilita las notificaciones de la app para recibir avisos de la campaña.'}
        </Text>

        <View style={styles.actions}>
          <PrimaryButton label={english ? 'My participations' : 'Mis participaciones'} onPress={() => router.replace('/dynamics/participations')} />
          <PrimaryButton label={english ? 'Back to Dynamics' : 'Volver a Dinámicas'} onPress={() => router.replace('/dynamics')} secondary />
          <PrimaryButton label={english ? 'Back to Home' : 'Volver a Inicio'} onPress={() => router.replace('/home')} secondary />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  icon: { alignItems: 'center', borderRadius: 48, height: 88, justifyContent: 'center', width: 88 },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 34, marginTop: 28, textAlign: 'center' },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 10, textAlign: 'center' },
  note: { fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 14, textAlign: 'center' },
  receipt: { fontFamily: fonts.body, fontSize: 9, marginTop: 6, maxWidth: '90%' },
  guidance: { fontFamily: fonts.body, fontSize: 10, lineHeight: 16, marginTop: 18, textAlign: 'center' },
  actions: { gap: 10, marginTop: 26, width: '100%' },
});
