import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { useLanguage } from '../../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../../src/theme/ThemeProvider';
import { fonts, radii, spacing, ThemePreference } from '../../../src/theme/tokens';

export default function AppearanceScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const options: Array<{ value: ThemePreference; title: string; subtitle: string }> = [
    {
      value: 'light',
      title: english ? 'Light' : 'Claro',
      subtitle: english ? 'Light background and high contrast.' : 'Fondo claro y alto contraste.',
    },
    {
      value: 'dark',
      title: english ? 'Dark' : 'Oscuro',
      subtitle: english ? 'The original LA Z editorial experience.' : 'La experiencia editorial original de LA Z.',
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.content}>
        <ScreenHeader title={english ? 'Appearance' : 'Apariencia'} />

        <Text style={[styles.title, { color: colors.white }]}>{english ? 'Choose your theme' : 'Elige tu tema'}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'The change applies across the app and is saved on this device.'
            : 'El cambio se aplica a toda la app y se conserva en este dispositivo.'}
        </Text>

        <View style={styles.options}>
          {options.map((option) => {
            const selected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: selected ? colors.red : colors.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.preview, { backgroundColor: option.value === 'dark' ? '#050101' : '#F8F7F7' }]}>
                  <View style={[styles.previewRed, { backgroundColor: '#D30A12' }]} />
                  <View style={[styles.previewCard, { backgroundColor: option.value === 'dark' ? '#210808' : '#F1ECEC' }]} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.optionTitle, { color: colors.white }]}>{option.title}</Text>
                  <Text style={[styles.optionSubtitle, { color: colors.muted }]}>{option.subtitle}</Text>
                </View>
                <Ionicons color={selected ? colors.red : colors.gray} name={selected ? 'radio-button-on' : 'radio-button-off'} size={24} />
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
  title: { fontFamily: fonts.displayExtraBold, fontSize: 30, marginTop: spacing.lg },
  subtitle: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  options: { gap: 14, marginTop: spacing.xl },
  option: { alignItems: 'center', borderRadius: radii.md, flexDirection: 'row', minHeight: 110, padding: spacing.md },
  preview: { borderRadius: 12, height: 72, overflow: 'hidden', padding: 12, width: 76 },
  previewRed: { borderRadius: 3, height: 8, width: 46 },
  previewCard: { borderRadius: 5, height: 12, marginTop: 10, width: 46 },
  copy: { flex: 1, marginLeft: 14 },
  optionTitle: { fontFamily: fonts.bodyBold, fontSize: 15 },
  optionSubtitle: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 4 },
});
