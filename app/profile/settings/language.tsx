import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useLanguage, type AppLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../../src/theme/tokens';

const options: Array<{ value: AppLanguage; label: string; detail: string }> = [
  { value: 'es', label: 'Español', detail: 'Interfaz en español' },
  { value: 'en', label: 'English', detail: 'English interface' },
];

export default function LanguageSettingsScreen() {
  const { colors } = useAppTheme();
  const { language, setLanguage } = useLanguage();
  const english = language === 'en';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.content}>
        <ScreenHeader title={english ? 'Language' : 'Idioma'} />
        <Text style={[styles.title, { color: colors.white }]}>
          {english ? 'App language' : 'Idioma de la app'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Choose the language used by LA Z on this device.'
            : 'Selecciona el idioma que LA Z usará en este dispositivo.'}
        </Text>

        <View style={styles.options}>
          {options.map((option) => {
            const selected = language === option.value;
            return (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() => setLanguage(option.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: selected ? colors.red : colors.border,
                  },
                ]}
              >
                <View style={styles.copy}>
                  <Text style={[styles.label, { color: colors.white }]}>{option.label}</Text>
                  <Text style={[styles.detail, { color: colors.muted }]}>{option.detail}</Text>
                </View>
                <Ionicons
                  color={selected ? colors.red : colors.gray}
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.md },
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
  options: {
    gap: 10,
    marginTop: spacing.lg,
  },
  option: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: spacing.md,
  },
  copy: { flex: 1 },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  detail: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
});
