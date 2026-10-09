import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

import { BrandLogo } from '../src/components/BrandLogo';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useAuth } from '../src/features/auth/AuthProvider';
import { authErrorMessage } from '../src/features/auth/errors';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

type Step =
  | 'welcome'
  | 'registerEmail'
  | 'registerPassword'
  | 'registerName'
  | 'loginEmail'
  | 'loginPassword';

export default function AuthScreen() {
  const router = useRouter();
  const { isAuthenticated, status, registerWithEmail, signInWithEmail } = useAuth();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace('/profile');
  }, [isAuthenticated, router]);

  const copy = useMemo(() => {
    if (english) {
      switch (step) {
        case 'registerEmail': return ['Create your account', 'Start with your email address.'];
        case 'registerPassword': return ['Protect your account', 'Use a password with at least 10 characters.'];
        case 'registerName': return ['What is your name?', 'This name will appear on your LA Z profile.'];
        case 'loginEmail': return ['Welcome back', 'Enter your account email.'];
        case 'loginPassword': return ['Enter your password', 'Enter your password to continue.'];
        default: return ['', ''];
      }
    }

    switch (step) {
      case 'registerEmail': return ['Crea tu cuenta', 'Empieza con tu correo electrónico.'];
      case 'registerPassword': return ['Protege tu cuenta', 'Usa una contraseña de al menos 10 caracteres.'];
      case 'registerName': return ['¿Cómo te llamas?', 'Este nombre aparecerá en tu perfil de LA Z.'];
      case 'loginEmail': return ['Bienvenido de vuelta', 'Ingresa el correo de tu cuenta.'];
      case 'loginPassword': return ['Ingresa tu contraseña', 'Escribe tu contraseña para continuar.'];
      default: return ['', ''];
    }
  }, [english, step]);

  const goBack = () => {
    const previous: Record<Exclude<Step, 'welcome'>, Step> = {
      registerEmail: 'welcome',
      registerPassword: 'registerEmail',
      registerName: 'registerPassword',
      loginEmail: 'welcome',
      loginPassword: 'loginEmail',
    };
    setFormError(null);
    if (step === 'welcome') {
      router.back();
      return;
    }
    setStep(previous[step]);
  };

  const createAccount = async () => {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await registerWithEmail(email, password, name);
      router.replace('/profile');
    } catch (error) {
      setFormError(authErrorMessage(error, language));
    } finally {
      setSubmitting(false);
    }
  };

  const login = async () => {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await signInWithEmail(email, password);
      router.replace('/profile');
    } catch (error) {
      setFormError(authErrorMessage(error, language));
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <Pressable accessibilityLabel={english ? 'Back' : 'Volver'} accessibilityRole="button" onPress={goBack} style={styles.back}>
          <Ionicons color={colors.white} name="chevron-back" size={26} />
        </Pressable>

        <View style={styles.welcome}>
          <BrandLogo width={118} />
          <Text style={[styles.welcomeTitle, { color: colors.white }]}>
            {english ? 'Your LA Z account' : 'Tu cuenta LA Z'}
          </Text>
          <Text style={[styles.welcomeBody, { color: colors.muted }]}>
            {english
              ? 'Sign in to join dynamics, manage your profile and receive personalized features.'
              : 'Inicia sesión para participar en dinámicas, administrar tu perfil y recibir funciones personalizadas.'}
          </Text>

          <View style={styles.actions}>
            <PrimaryButton label={english ? 'Create account' : 'Crear cuenta'} onPress={() => { setFormError(null); setStep('registerEmail'); }} />
            <PrimaryButton label={english ? 'I already have an account' : 'Ya tengo cuenta'} onPress={() => { setFormError(null); setStep('loginEmail'); }} secondary />
          </View>

          <Text style={[styles.securityNote, { color: colors.muted }]}>
            {english
              ? 'Your password stays private and is never shared with LA Z.'
              : 'Tu contraseña se mantiene privada y no se comparte con LA Z.'}
          </Text>

          {status === 'syncing' ? (
            <View style={styles.syncing}>
              <ActivityIndicator color={colors.red} size="small" />
              <Text style={[styles.syncingText, { color: colors.muted }]}>{english ? 'Validating session…' : 'Validando sesión…'}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  const isRegister = step.startsWith('register');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <Pressable accessibilityLabel={english ? 'Back' : 'Volver'} accessibilityRole="button" onPress={goBack} style={styles.back}>
        <Ionicons color={colors.white} name="chevron-back" size={26} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.step} keyboardShouldPersistTaps="handled">
        <Text style={[styles.stepEyebrow, { color: colors.red }]}>
          {isRegister ? (english ? 'SIGN UP' : 'REGISTRO') : (english ? 'SIGN IN' : 'INICIAR SESIÓN')}
        </Text>
        <Text style={[styles.stepTitle, { color: colors.white }]}>{copy[0]}</Text>
        <Text style={[styles.stepBody, { color: colors.muted }]}>{copy[1]}</Text>

        {step === 'registerEmail' || step === 'loginEmail' ? (
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={(value) => { setEmail(value); setFormError(null); }}
            placeholder={english ? 'you@email.com' : 'tu@correo.com'}
            placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.white }]}
            value={email}
          />
        ) : null}

        {step === 'registerPassword' || step === 'loginPassword' ? (
          <TextInput
            autoCapitalize="none"
            autoComplete={step === 'registerPassword' ? 'new-password' : 'current-password'}
            onChangeText={(value) => { setPassword(value); setFormError(null); }}
            placeholder="••••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.white }]}
            value={password}
          />
        ) : null}

        {step === 'registerName' ? (
          <>
            <TextInput
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={(value) => { setName(value); setFormError(null); }}
              placeholder={english ? 'Your name' : 'Tu nombre'}
              placeholderTextColor={colors.muted}
              style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.white }]}
              value={name}
            />

            <View
              style={[
                styles.consentCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: privacyAccepted ? colors.red : colors.border,
                },
              ]}
            >
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: privacyAccepted }}
                onPress={() => setPrivacyAccepted((current) => !current)}
                style={styles.consentRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: privacyAccepted ? colors.red : 'transparent',
                      borderColor: privacyAccepted ? colors.red : colors.gray,
                    },
                  ]}
                >
                  {privacyAccepted ? (
                    <Ionicons color="#FEFEFE" name="checkmark" size={15} />
                  ) : null}
                </View>
                <Text style={[styles.consentText, { color: colors.white }]}>
                  {english
                    ? 'I have read and accept the NeuroMarket privacy notice for LA Z 1310.'
                    : 'He leído y acepto el Aviso de privacidad de NeuroMarket para LA Z 1310.'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/profile/settings/privacy-policy')}
                style={styles.policyLink}
              >
                <Text style={[styles.policyLinkText, { color: colors.red }]}>
                  {english ? 'READ PRIVACY POLICY →' : 'LEER POLÍTICA DE PRIVACIDAD →'}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {formError ? (
          <View style={[styles.errorCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="alert-circle-outline" size={20} />
            <Text style={[styles.errorText, { color: colors.white }]}>{formError}</Text>
          </View>
        ) : null}

        <View style={styles.next}>
          {step === 'registerEmail' ? <PrimaryButton disabled={!email.trim().includes('@')} label={english ? 'Next' : 'Siguiente'} onPress={() => setStep('registerPassword')} /> : null}
          {step === 'registerPassword' ? <PrimaryButton disabled={password.length < 10} label={english ? 'Next' : 'Siguiente'} onPress={() => setStep('registerName')} /> : null}
          {step === 'registerName' ? <PrimaryButton disabled={name.trim().length < 2 || !privacyAccepted || submitting} label={submitting ? (english ? 'Creating account…' : 'Creando cuenta…') : (english ? 'Create account' : 'Crear cuenta')} onPress={() => void createAccount()} /> : null}
          {step === 'loginEmail' ? <PrimaryButton disabled={!email.trim().includes('@')} label={english ? 'Next' : 'Siguiente'} onPress={() => setStep('loginPassword')} /> : null}
          {step === 'loginPassword' ? <PrimaryButton disabled={password.length === 0 || submitting} label={submitting ? (english ? 'Validating…' : 'Validando…') : (english ? 'Sign in' : 'Iniciar sesión')} onPress={() => void login()} /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  back: { alignItems: 'center', height: 48, justifyContent: 'center', marginLeft: 8, marginTop: 4, width: 48 },
  welcome: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  welcomeTitle: { fontFamily: fonts.displayExtraBold, fontSize: 34, marginTop: 24, textAlign: 'center' },
  welcomeBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 10, textAlign: 'center' },
  actions: { gap: 10, marginTop: 34, width: '100%' },
  securityNote: { fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 20, textAlign: 'center' },
  syncing: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 16 },
  syncingText: { fontFamily: fonts.body, fontSize: 10 },
  step: { flexGrow: 1, paddingBottom: 80, paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  stepEyebrow: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.2 },
  stepTitle: { fontFamily: fonts.displayExtraBold, fontSize: 34, marginTop: 8 },
  stepBody: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  input: { borderRadius: radii.md, borderWidth: 1, fontFamily: fonts.body, fontSize: 15, marginTop: 18, minHeight: 56, paddingHorizontal: spacing.md },
  errorCard: { alignItems: 'center', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 16, padding: spacing.md },
  errorText: { flex: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  consentCard: { borderRadius: radii.md, borderWidth: 1, marginTop: 16, padding: spacing.md },
  consentRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  checkbox: { alignItems: 'center', borderRadius: 5, borderWidth: 1, height: 22, justifyContent: 'center', marginTop: 1, width: 22 },
  consentText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  policyLink: { alignSelf: 'flex-start', marginLeft: 32, marginTop: 10, paddingVertical: 4 },
  policyLinkText: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.3 },
  next: { gap: 10, marginTop: 34 },
});
