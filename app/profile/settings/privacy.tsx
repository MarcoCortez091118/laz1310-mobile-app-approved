import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { SupportContactRow } from '../../../src/components/SupportContactRow';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { PRIVACY_POLICY_VERSION } from '../../../src/features/privacy/policy';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const {
    profile,
    acceptPrivacyPolicyConsent,
  } = useAuth();
  const english = language === 'en';
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptedCurrentPolicy =
    profile?.privacyPolicyVersion === PRIVACY_POLICY_VERSION &&
    Boolean(profile.privacyPolicyAcceptedAt);

  const acceptedAt = useMemo(() => {
    if (!profile?.privacyPolicyAcceptedAt) return null;

    try {
      return new Intl.DateTimeFormat(
        english ? 'en-US' : 'es-MX',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        },
      ).format(new Date(profile.privacyPolicyAcceptedAt));
    } catch {
      return profile.privacyPolicyAcceptedAt;
    }
  }, [english, profile?.privacyPolicyAcceptedAt]);

  const acceptPolicy = async () => {
    if (working) return;
    setWorking(true);
    setMessage(null);
    setError(null);

    try {
      await acceptPrivacyPolicyConsent();
      setMessage(
        english
          ? 'Your privacy consent was recorded.'
          : 'Tu consentimiento de privacidad fue registrado.',
      );
    } catch (consentError) {
      setError(
        consentError instanceof Error
          ? consentError.message
          : english
            ? 'We could not record your privacy consent.'
            : 'No pudimos registrar tu consentimiento de privacidad.',
      );
    } finally {
      setWorking(false);
    }
  };

  const rows = english
    ? [
        {
          id: 'policy',
          title: 'NeuroMarket privacy notice',
          subtitle: 'Read about how LA Z handles your information',
          route: '/profile/settings/privacy-policy' as const,
        },
        {
          id: 'version',
          title: 'App version',
          subtitle: '0.1.0',
        },
      ]
    : [
        {
          id: 'policy',
          title: 'Aviso de privacidad de NeuroMarket',
          subtitle: 'Conoce cómo LA Z trata tus datos personales',
          route: '/profile/settings/privacy-policy' as const,
        },
        {
          id: 'version',
          title: 'Versión de la app',
          subtitle: '0.1.0',
        },
      ];

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
          title={english ? 'Privacy & about' : 'Privacidad y acerca de'}
        />

        <Text style={[styles.title, { color: colors.white }]}>LA Z 1310</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Legal information, privacy consent, support and details about this installation.'
            : 'Información legal, consentimiento de privacidad, soporte y detalles de esta instalación.'}
        </Text>

        <View
          style={[
            styles.consentCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: acceptedCurrentPolicy ? '#56C985' : colors.border,
            },
          ]}
        >
          <View style={styles.consentHeader}>
            <Ionicons
              color={acceptedCurrentPolicy ? '#56C985' : colors.red}
              name={
                acceptedCurrentPolicy
                  ? 'checkmark-circle-outline'
                  : 'alert-circle-outline'
              }
              size={24}
            />
            <View style={styles.consentCopy}>
              <Text style={[styles.consentTitle, { color: colors.white }]}>
                {acceptedCurrentPolicy
                  ? english
                    ? 'Privacy policy accepted'
                    : 'Política de privacidad aceptada'
                  : english
                    ? 'Privacy consent required'
                    : 'Consentimiento de privacidad pendiente'}
              </Text>
              <Text style={[styles.consentSubtitle, { color: colors.muted }]}>
                {acceptedCurrentPolicy && acceptedAt
                  ? english
                    ? `Accepted ${acceptedAt}`
                    : `Aceptada el ${acceptedAt}`
                  : english
                    ? 'Review and accept the current policy version.'
                    : 'Revisa y acepta la versión vigente de la política.'}
              </Text>
            </View>
          </View>

          <Text style={[styles.policyVersion, { color: colors.gray }]}>
            {english ? 'CURRENT VERSION' : 'VERSIÓN VIGENTE'} ·{' '}
            {PRIVACY_POLICY_VERSION}
          </Text>

          {!acceptedCurrentPolicy ? (
            <View style={styles.acceptAction}>
              <PrimaryButton
                disabled={working}
                label={
                  working
                    ? english
                      ? 'Recording…'
                      : 'Registrando…'
                    : english
                      ? 'Accept current policy'
                      : 'Aceptar política vigente'
                }
                onPress={() => void acceptPolicy()}
              />
            </View>
          ) : null}
        </View>

        {message ? (
          <Text style={[styles.message, { color: '#56C985' }]}>{message}</Text>
        ) : null}
        {error ? (
          <Text style={[styles.message, { color: colors.red }]}>{error}</Text>
        ) : null}

        <Text style={[styles.supportHeading, { color: colors.white }]}>
          {english ? 'Need assistance?' : '¿Necesitas ayuda?'}
        </Text>
        <SupportContactRow />

        <View style={styles.rows}>
          {rows.map((row) => {
            const interactive = 'route' in row && Boolean(row.route);
            return (
              <Pressable
                accessibilityRole={interactive ? 'button' : 'text'}
                disabled={!interactive}
                key={row.id}
                onPress={() => {
                  if ('route' in row && row.route) router.push(row.route);
                }}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: interactive || row.id === 'version' ? 1 : 0.72,
                  },
                ]}
              >
                <View style={styles.copy}>
                  <Text style={[styles.rowTitle, { color: colors.white }]}>
                    {row.title}
                  </Text>
                  <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
                    {row.subtitle}
                  </Text>
                </View>
                {interactive ? (
                  <Ionicons
                    color={colors.gray}
                    name="chevron-forward"
                    size={20}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
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
  consentCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  consentHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  consentCopy: {
    flex: 1,
  },
  consentTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  consentSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 15,
    marginTop: 3,
  },
  policyVersion: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 12,
  },
  acceptAction: {
    marginTop: 14,
  },
  message: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 15,
    marginTop: 10,
  },
  supportHeading: { fontFamily: fonts.displayExtraBold, fontSize: 24, marginTop: spacing.lg, marginBottom: 12 },
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
  copy: {
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
});
