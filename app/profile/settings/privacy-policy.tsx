import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import {
  PRIVACY_POLICY_VERSION,
  NEUROMARKET_PRIVACY_POLICY_ES,
  NEUROMARKET_PRIVACY_POLICY_EN,
} from '../../../src/features/privacy/policy';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

export default function PrivacyPolicyScreen() {
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safe}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={
            english
              ? 'NeuroMarket privacy notice'
              : 'Aviso de privacidad de NeuroMarket'
          }
        />

        <View
          style={[
            styles.notice,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.noticeTitle, { color: colors.white }]}>
            {english ? 'Privacy and personal information' : 'Privacidad y datos personales'}
          </Text>
          <Text style={[styles.noticeBody, { color: colors.muted }]}>
            {english
              ? 'Read how NeuroMarket processes information when you use LA Z 1310. For questions, contact Support@neuromarket.io.'
              : 'Conoce cómo NeuroMarket trata la información al usar LA Z 1310. Para consultas, escribe a Support@neuromarket.io.'}
          </Text>
          <Text style={[styles.version, { color: colors.red }]}>
            VERSION · {PRIVACY_POLICY_VERSION}
          </Text>
        </View>

        {(english ? NEUROMARKET_PRIVACY_POLICY_EN : NEUROMARKET_PRIVACY_POLICY_ES).map((section) => (
          <View key={section.title ?? section.paragraphs[0]} style={styles.section}>
            {section.title ? (
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                {section.title}
              </Text>
            ) : null}

            {section.paragraphs.map((paragraph, index) => (
              <Text
                key={`${section.title ?? 'section'}-${index}`}
                style={[styles.paragraph, { color: colors.muted }]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
    paddingHorizontal: spacing.md,
  },
  notice: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  noticeTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  noticeBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  version: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 10,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 25,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
});
