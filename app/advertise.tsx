import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../src/components/ScreenHeader';
import { ADVERTISING_EMAIL } from '../src/config/contact';
import { openAdvertisingEmail } from '../src/features/contact/links';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

export default function AdvertiseScreen() {
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={english ? 'Advertise with us' : 'Promociónate con nosotros'} />

        <View
          style={[styles.hero, { backgroundColor: colors.burgundy, borderColor: colors.border }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.red }]}>
            <Ionicons color="#FEFEFE" name="megaphone-outline" size={34} />
          </View>
          <Text style={[styles.title, { color: colors.white }]}>
            {english ? 'MAKE YOUR BRAND HEARD' : 'HAZ QUE TU MARCA SE ESCUCHE'}
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {english
              ? 'Interested in promoting your business with LA Z Detroit? Contact our sales team to discuss advertising opportunities.'
              : '¿Quieres promocionar tu negocio con LA Z Detroit? Escríbenos para conocer las oportunidades de publicidad.'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.white }]}>
          {english ? 'Let’s talk' : 'Hablemos'}
        </Text>
        <Text style={[styles.instructions, { color: colors.muted }]}>
          {english
            ? 'Tap the button to write to our advertising team. Your email app will open with the recipient and subject ready.'
            : 'Toca el botón para escribir a nuestro equipo comercial. Se abrirá tu correo con el destinatario y el asunto preparados.'}
        </Text>

        <Pressable
          accessibilityLabel={
            english
              ? `Email LA Z advertising at ${ADVERTISING_EMAIL}`
              : `Enviar correo de publicidad a ${ADVERTISING_EMAIL}`
          }
          accessibilityRole="button"
          onPress={() => void openAdvertisingEmail(language)}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: colors.red,
              opacity: pressed ? 0.78 : 1,
            },
          ]}
        >
          <Ionicons color="#FEFEFE" name="mail-outline" size={22} />
          <Text style={styles.ctaText}>
            {english ? 'CONTACT SALES' : 'CONTACTAR VENTAS'}
          </Text>
          <Ionicons color="#FEFEFE" name="arrow-forward" size={20} />
        </Pressable>

        <Text selectable style={[styles.email, { color: colors.muted }]}>
          {ADVERTISING_EMAIL}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 160,
    paddingHorizontal: spacing.md,
  },
  hero: {
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    lineHeight: 36,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 26,
    marginTop: spacing.xl,
  },
  instructions: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  cta: {
    alignItems: 'center',
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  ctaText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    flexShrink: 1,
  },
  email: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
