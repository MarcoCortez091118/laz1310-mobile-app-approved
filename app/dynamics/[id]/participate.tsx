import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../../src/api/client';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { getFirebaseSecurityTokens } from '../../../src/features/auth/firebase';
import {
  DynamicCampaign,
  DynamicFormField,
  ParticipationStatusResponse,
  getDynamic,
  getParticipationStatus,
  submitParticipation,
} from '../../../src/features/dynamics/api';
import {
  createIdempotencyKey,
  validateDynamicField,
} from '../../../src/features/dynamics/presentation';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

function keyboardType(field: DynamicFormField) {
  if (field.type === 'email') return 'email-address' as const;
  if (field.type === 'phone') return 'phone-pad' as const;
  return 'default' as const;
}

function placeholder(field: DynamicFormField, english: boolean) {
  if (field.type === 'email') return english ? 'you@email.com' : 'tu@correo.com';
  if (field.type === 'phone') return '+13135550123';
  return field.label;
}

function isAccountBackedField(field: DynamicFormField) {
  return field.key === 'name' || field.key === 'email';
}

function submissionError(error: unknown, english: boolean) {
  if (!(error instanceof ApiError)) {
    return english
      ? 'We could not submit your entry. Check your connection.'
      : 'No pudimos enviar tu participación. Revisa tu conexión.';
  }

  switch (error.status) {
    case 401:
      return english
        ? 'Sign in to your LA Z account before participating.'
        : 'Inicia sesión con tu cuenta LA Z antes de participar.';
    case 404:
      return english
        ? 'This dynamic is no longer available. Go back and refresh the list.'
        : 'La dinámica ya no está disponible. Regresa y actualiza la lista.';
    case 409:
      return english
        ? 'This dynamic changed, closed, or your account already has an entry.'
        : 'Esta dinámica cambió, cerró o tu cuenta ya tiene una participación registrada.';
    case 422:
      return english
        ? 'Review the additional fields and consent.'
        : 'Revisa los campos adicionales y el consentimiento.';
    case 429:
      return error.retryAfterSeconds
        ? english
          ? `Too many attempts. Try again in ${error.retryAfterSeconds} seconds.`
          : `Demasiados intentos. Intenta nuevamente en ${error.retryAfterSeconds} segundos.`
        : english
          ? 'Too many attempts. Wait a moment before submitting again.'
          : 'Demasiados intentos. Espera un momento antes de volver a enviar.';
    case 503:
      return english
        ? 'Participation is temporarily disabled or unavailable.'
        : 'Las participaciones están temporalmente deshabilitadas o no disponibles.';
    default:
      return english
        ? 'We could not register your participation.'
        : 'No pudimos registrar tu participación.';
  }
}

export default function DynamicsParticipationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const { isAuthenticated, profile } = useAuth();
  const [campaign, setCampaign] = useState<DynamicCampaign | null>(null);
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [participationStatus, setParticipationStatus] =
    useState<ParticipationStatusResponse | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadAccountStatus = useCallback(
    async (dynamicId: string) => {
      if (!isAuthenticated) {
        setParticipationStatus(null);
        return null;
      }

      try {
        const security = await getFirebaseSecurityTokens(true);
        const status = await getParticipationStatus(dynamicId, security);
        setParticipationStatus(status);
        return status;
      } catch {
        setParticipationStatus(null);
        return null;
      }
    },
    [isAuthenticated],
  );

  const load = useCallback(async () => {
    if (!id) {
      setLoadError(
        english
          ? 'The dynamic identifier is missing.'
          : 'Falta el identificador de la dinámica.',
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const result = await getDynamic(id);
      setCampaign(result.item);
      setReleaseId(result.releaseId);

      const initialValues = Object.fromEntries(
        result.item.participation.fields.map((field) => {
          if (result.item.participation.requiresAuth && field.key === 'name') {
            return [field.key, profile?.displayName ?? ''];
          }
          if (result.item.participation.requiresAuth && field.key === 'email') {
            return [field.key, profile?.email ?? ''];
          }
          return [field.key, ''];
        }),
      );
      setValues(initialValues);

      if (
        result.item.participation.type === 'form' &&
        result.item.participation.requiresAuth &&
        isAuthenticated
      ) {
        await loadAccountStatus(result.item.id);
      } else {
        setParticipationStatus(null);
      }
    } catch {
      setCampaign(null);
      setReleaseId(null);
      setParticipationStatus(null);
      setLoadError(
        english
          ? 'We could not load the published participation.'
          : 'No pudimos cargar la participación publicada.',
      );
    } finally {
      setLoading(false);
    }
  }, [english, id, isAuthenticated, loadAccountStatus, profile?.displayName, profile?.email]);

  useEffect(() => {
    void load();
  }, [load]);

  const editableFields = useMemo(() => {
    if (!campaign || campaign.participation.type !== 'form') return [];
    return campaign.participation.fields.filter((field) => {
      if (!campaign.participation.requiresAuth || !isAccountBackedField(field)) {
        return true;
      }
      if (field.key === 'name') return !profile?.displayName;
      if (field.key === 'email') return !profile?.email;
      return true;
    });
  }, [campaign, profile?.displayName, profile?.email]);

  const validation = useMemo(() => {
    if (!campaign || campaign.participation.type !== 'form') return {};
    return Object.fromEntries(
      campaign.participation.fields.map((field) => [
        field.key,
        validateDynamicField(field, values[field.key] ?? '', language),
      ]),
    ) as Record<string, string | null>;
  }, [campaign, language, values]);

  const formValid =
    campaign?.participation.type === 'form' &&
    campaign.status === 'active' &&
    Boolean(releaseId) &&
    campaign.participation.fields.every((field) => !validation[field.key]) &&
    termsAccepted &&
    privacyAccepted &&
    (!campaign.participation.requiresAuth ||
      (isAuthenticated && Boolean(profile))) &&
    !participationStatus?.participated;

  const rotateIdempotencyIfNeeded = () => {
    if (attempted) {
      setIdempotencyKey(createIdempotencyKey());
      setAttempted(false);
    }
    setSubmitError(null);
  };

  const update = (field: string, value: string) => {
    rotateIdempotencyIfNeeded();
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    if (!campaign || !releaseId || !formValid || submitting) return;

    setSubmitting(true);
    setAttempted(true);
    setSubmitError(null);

    try {
      const normalizedValues = Object.fromEntries(
        campaign.participation.fields
          .map((field) => [field.key, (values[field.key] ?? '').trim()] as const)
          .filter(([, value]) => value.length > 0),
      );
      const security = await getFirebaseSecurityTokens(
        campaign.participation.requiresAuth,
      );
      const receipt = await submitParticipation({
        dynamicId: campaign.id,
        releaseId,
        values: normalizedValues,
        consentVersion: campaign.consentVersion,
        idempotencyKey,
        security,
      });

      router.replace({
        pathname: '/dynamics/confirmation',
        params: {
          title: campaign.title,
          receiptId: receipt.id,
          submittedAt: receipt.submittedAt,
        },
      });
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        campaign.participation.requiresAuth &&
        isAuthenticated
      ) {
        try {
          const latest = await loadAccountStatus(campaign.id);
          if (latest?.participated) {
            setSubmitError(null);
            return;
          }
        } catch {
          // Fall through to the original submission error.
        }
      }
      setSubmitError(submissionError(error, english));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={english ? 'Participate' : 'Participar'} />

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              {english ? 'Loading participation…' : 'Cargando participación…'}
            </Text>
          </View>
        ) : null}

        {!loading && loadError ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.white }]}>
              {loadError}
            </Text>
            <PrimaryButton
              label={english ? 'Retry' : 'Reintentar'}
              onPress={() => void load()}
              secondary
            />
          </View>
        ) : null}

        {!loading && campaign?.participation.type === 'external_url' ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons color={colors.red} name="open-outline" size={28} />
            <Text style={[styles.errorText, { color: colors.white }]}>
              {english
                ? 'This dynamic uses external participation.'
                : 'Esta dinámica utiliza participación externa.'}
            </Text>
            {campaign.participation.url ? (
              <PrimaryButton
                label={english ? 'Open link' : 'Abrir enlace'}
                onPress={() => void Linking.openURL(campaign.participation.url!)}
              />
            ) : null}
          </View>
        ) : null}

        {!loading &&
        campaign?.participation.type === 'form' &&
        campaign.participation.requiresAuth &&
        !isAuthenticated ? (
          <View
            style={[
              styles.accountRequired,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              color={colors.red}
              name="person-circle-outline"
              size={34}
            />
            <Text style={[styles.accountRequiredTitle, { color: colors.white }]}>
              {english ? 'LA Z account required' : 'Necesitas tu cuenta LA Z'}
            </Text>
            <Text style={[styles.accountRequiredBody, { color: colors.muted }]}>
              {english
                ? 'Sign in so your name, email and account identity can be attached securely to this entry.'
                : 'Inicia sesión para asociar de forma segura tu nombre, correo e identidad de cuenta a esta participación.'}
            </Text>
            <PrimaryButton
              label={english ? 'Sign in' : 'Iniciar sesión'}
              onPress={() => router.push('/auth')}
            />
          </View>
        ) : null}

        {!loading &&
        campaign?.participation.type === 'form' &&
        (!campaign.participation.requiresAuth || isAuthenticated) ? (
          <>
            <Text style={[styles.title, { color: colors.white }]}>
              {campaign.title}
            </Text>

            {participationStatus?.participated ? (
              <View
                style={[
                  styles.alreadyCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.acceptedIcon, { backgroundColor: colors.red }]}>
                  <Ionicons color="#FEFEFE" name="checkmark" size={28} />
                </View>
                <Text style={[styles.alreadyTitle, { color: colors.white }]}>
                  {english
                    ? 'You are already participating'
                    : 'Ya estás participando'}
                </Text>
                <Text style={[styles.alreadyBody, { color: colors.muted }]}>
                  {english
                    ? 'Your account already has an accepted entry for this dynamic. Keep access to your registered email and enable LA Z notifications to receive campaign updates.'
                    : 'Tu cuenta ya tiene una participación aceptada en esta dinámica. Mantén acceso a tu correo registrado y habilita las notificaciones de LA Z para recibir avisos de la campaña.'}
                </Text>
                {participationStatus.receipt?.submittedAt ? (
                  <Text style={[styles.receivedAt, { color: colors.muted }]}>
                    {english ? 'Registered ' : 'Registrada '}
                    {new Date(
                      participationStatus.receipt.submittedAt,
                    ).toLocaleString(english ? 'en-US' : 'es-MX')}
                  </Text>
                ) : null}
                <PrimaryButton
                  label={
                    english
                      ? 'My participations'
                      : 'Mis participaciones'
                  }
                  onPress={() => router.push('/dynamics/participations')}
                />
              </View>
            ) : (
              <>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  {campaign.participation.requiresAuth
                    ? english
                      ? 'Your LA Z account supplies your identity. Complete only any additional information requested below.'
                      : 'Tu cuenta LA Z proporciona tu identidad. Completa únicamente la información adicional solicitada.'
                    : english
                      ? 'Complete the information requested by this dynamic.'
                      : 'Completa la información solicitada por esta dinámica.'}
                </Text>

                {campaign.participation.requiresAuth && profile ? (
                  <View
                    style={[
                      styles.accountCard,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.accountHeader}>
                      <Ionicons
                        color={colors.red}
                        name="shield-checkmark-outline"
                        size={22}
                      />
                      <Text
                        style={[styles.accountTitle, { color: colors.white }]}
                      >
                        {english
                          ? 'Participating with your LA Z account'
                          : 'Participarás con tu cuenta LA Z'}
                      </Text>
                    </View>
                    <Text style={[styles.accountName, { color: colors.white }]}>
                      {profile.displayName ||
                        (english ? 'Name pending' : 'Nombre pendiente')}
                    </Text>
                    <Text style={[styles.accountEmail, { color: colors.muted }]}>
                      {profile.email ||
                        (english ? 'Email unavailable' : 'Correo no disponible')}
                    </Text>
                    <View style={styles.verifiedRow}>
                      <Ionicons
                        color={profile.emailVerified ? '#56C985' : colors.red}
                        name={
                          profile.emailVerified
                            ? 'checkmark-circle-outline'
                            : 'alert-circle-outline'
                        }
                        size={15}
                      />
                      <Text
                        style={[
                          styles.verifiedText,
                          {
                            color: profile.emailVerified
                              ? '#56C985'
                              : colors.red,
                          },
                        ]}
                      >
                        {profile.emailVerified
                          ? english
                            ? 'VERIFIED EMAIL'
                            : 'CORREO VERIFICADO'
                          : english
                            ? 'EMAIL NOT VERIFIED'
                            : 'CORREO NO VERIFICADO'}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {editableFields.length ? (
                  <>
                    <Text
                      style={[styles.additionalTitle, { color: colors.white }]}
                    >
                      {english
                        ? 'Additional information'
                        : 'Información adicional'}
                    </Text>
                    {editableFields.map((field) => (
                      <View key={field.key} style={styles.fieldGroup}>
                        <Text style={[styles.label, { color: colors.muted }]}>
                          {field.label.toUpperCase()}
                          {field.required ? ' *' : ''}
                        </Text>
                        <TextInput
                          autoCapitalize={
                            field.type === 'email' ? 'none' : 'sentences'
                          }
                          autoCorrect={field.type !== 'email'}
                          keyboardType={keyboardType(field)}
                          multiline={field.type === 'textarea'}
                          onChangeText={(value) => update(field.key, value)}
                          placeholder={placeholder(field, english)}
                          placeholderTextColor={colors.muted}
                          style={[
                            styles.input,
                            field.type === 'textarea' && styles.textarea,
                            {
                              backgroundColor: colors.surfaceElevated,
                              borderColor:
                                values[field.key] && validation[field.key]
                                  ? colors.red
                                  : colors.border,
                              color: colors.white,
                            },
                          ]}
                          value={values[field.key] ?? ''}
                        />
                        {values[field.key] && validation[field.key] ? (
                          <Text
                            style={[styles.fieldError, { color: colors.red }]}
                          >
                            {validation[field.key]}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </>
                ) : (
                  <View
                    style={[
                      styles.noExtraFields,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      color={colors.red}
                      name="flash-outline"
                      size={20}
                    />
                    <Text
                      style={[styles.noExtraText, { color: colors.muted }]}
                    >
                      {english
                        ? 'No additional information is required for this dynamic.'
                        : 'Esta dinámica no requiere información adicional.'}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.consentCard,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      rotateIdempotencyIfNeeded();
                      setTermsAccepted((value) => !value);
                    }}
                    style={styles.consentRow}
                  >
                    <Ionicons
                      color={termsAccepted ? colors.red : colors.muted}
                      name={termsAccepted ? 'checkbox' : 'square-outline'}
                      size={22}
                    />
                    <Text
                      style={[styles.consentText, { color: colors.white }]}
                    >
                      {english
                        ? 'I accept the terms and conditions.'
                        : 'Acepto las bases y condiciones.'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void Linking.openURL(campaign.termsUrl)}
                  >
                    <Text style={[styles.link, { color: colors.red }]}>
                      {english ? 'Read terms' : 'Leer bases'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      rotateIdempotencyIfNeeded();
                      setPrivacyAccepted((value) => !value);
                    }}
                    style={styles.consentRow}
                  >
                    <Ionicons
                      color={privacyAccepted ? colors.red : colors.muted}
                      name={privacyAccepted ? 'checkbox' : 'square-outline'}
                      size={22}
                    />
                    <Text
                      style={[styles.consentText, { color: colors.white }]}
                    >
                      {english
                        ? 'I accept the privacy policy.'
                        : 'Acepto la política de privacidad.'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void Linking.openURL(campaign.privacyUrl)}
                  >
                    <Text style={[styles.link, { color: colors.red }]}>
                      {english
                        ? 'Read privacy policy'
                        : 'Leer privacidad'}
                    </Text>
                  </Pressable>
                </View>

                {campaign.status !== 'active' ? (
                  <Text style={[styles.warningText, { color: colors.red }]}>
                    {english
                      ? 'This dynamic is not accepting entries right now.'
                      : 'Esta dinámica no acepta participaciones en este momento.'}
                  </Text>
                ) : null}

                {submitError ? (
                  <Text style={[styles.submitError, { color: colors.red }]}>
                    {submitError}
                  </Text>
                ) : null}

                <PrimaryButton
                  disabled={!formValid || submitting}
                  label={
                    submitting
                      ? english
                        ? 'Registering…'
                        : 'Registrando…'
                      : english
                        ? 'Register me'
                        : 'Registrarme'
                  }
                  onPress={() => void submit()}
                />

                <Text style={[styles.securityNote, { color: colors.muted }]}>
                  {english
                    ? 'LA Z API validates campaign availability, account identity, duplicates, consent and any additional answers before accepting the entry.'
                    : 'LA Z API valida vigencia, identidad de cuenta, duplicados, consentimiento y cualquier respuesta adicional antes de aceptar la participación.'}
                </Text>
              </>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 120, paddingHorizontal: spacing.md },
  state: { alignItems: 'center', gap: 12, paddingVertical: 100 },
  stateText: { fontFamily: fonts.body, fontSize: 12 },
  errorCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 14,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  errorText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 32,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  accountRequired: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 12,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  accountRequiredTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    textAlign: 'center',
  },
  accountRequiredBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  alreadyCard: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 10,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  acceptedIcon: {
    alignItems: 'center',
    borderRadius: 32,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  alreadyTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 27,
    textAlign: 'center',
  },
  alreadyBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  receivedAt: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    marginBottom: 4,
  },
  accountCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  accountHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  accountTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  accountName: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 22,
    marginTop: 14,
  },
  accountEmail: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
  verifiedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
  },
  verifiedText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.7,
  },
  additionalTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 22,
    marginBottom: 12,
  },
  fieldGroup: { marginBottom: 14 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    minHeight: 56,
    paddingHorizontal: spacing.md,
  },
  textarea: {
    minHeight: 120,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  fieldError: { fontFamily: fonts.body, fontSize: 10, marginTop: 5 },
  noExtraFields: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  noExtraText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
  consentCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
    padding: spacing.md,
  },
  consentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 36,
  },
  consentText: { flex: 1, fontFamily: fonts.body, fontSize: 12 },
  link: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    marginBottom: 4,
    marginLeft: 32,
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
  },
  submitError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  securityNote: {
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
