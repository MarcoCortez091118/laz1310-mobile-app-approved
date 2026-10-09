import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

export default function EditProfileScreen() {
  const router = useRouter();
  const { status, profile, updateDisplayName } = useAuth();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'signedOut') router.replace('/auth');
  }, [router, status]);

  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName);
  }, [profile?.displayName]);

  const save = async () => {
    const normalized = displayName.trim();
    if (normalized.length < 2 || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateDisplayName(normalized);
      router.back();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : english
            ? 'We could not save the profile.'
            : 'No pudimos guardar el perfil.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.content}>
        <ScreenHeader title={english ? 'Edit profile' : 'Editar perfil'} />

        <Text style={[styles.title, { color: colors.white }]}>{english ? 'Your information' : 'Tu información'}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Your name is saved in Firebase and your LA Z profile.'
            : 'El nombre se guarda en Firebase y en tu perfil de LA Z.'}
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.muted }]}>{english ? 'NAME' : 'NOMBRE'}</Text>
          <TextInput
            autoCapitalize="words"
            autoComplete="name"
            maxLength={160}
            onChangeText={(value) => { setDisplayName(value); setError(null); }}
            placeholder={english ? 'Your name' : 'Tu nombre'}
            placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.white }]}
            value={displayName}
          />
        </View>

        <View style={[styles.readonlyCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.muted }]}>{english ? 'EMAIL' : 'CORREO'}</Text>
          <Text style={[styles.value, { color: colors.white }]}>{profile.email || (english ? 'No email' : 'Sin correo')}</Text>
          <Text style={[styles.readonlyNote, { color: colors.muted }]}>
            {english
              ? 'Changing email requires a separate reauthentication flow and is not part of this integration yet.'
              : 'El cambio de correo requiere un flujo de reautenticación separado y no forma parte de esta primera integración.'}
          </Text>
        </View>

        {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}

        <View style={styles.actions}>
          <PrimaryButton
            disabled={displayName.trim().length < 2 || saving}
            label={saving ? (english ? 'Saving…' : 'Guardando…') : (english ? 'Save changes' : 'Guardar cambios')}
            onPress={() => void save()}
          />
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
  field: { marginTop: spacing.lg },
  label: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 0.9 },
  input: { borderRadius: radii.md, borderWidth: 1, fontFamily: fonts.body, fontSize: 15, marginTop: 7, minHeight: 56, paddingHorizontal: spacing.md },
  readonlyCard: { borderRadius: radii.md, borderWidth: 1, marginTop: 16, padding: spacing.md },
  value: { fontFamily: fonts.bodySemiBold, fontSize: 14, marginTop: 8 },
  readonlyNote: { fontFamily: fonts.body, fontSize: 9, lineHeight: 14, marginTop: 9 },
  error: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 16, marginTop: 14 },
  actions: { marginTop: spacing.lg },
});
