import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORT_EMAIL, openSupportEmail } from '../config/support';
import { useLanguage } from '../i18n/LanguageProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

export function SupportContactRow() {
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  return (
    <Pressable
      accessibilityLabel={
        english
          ? `Contact NeuroMarket support at ${SUPPORT_EMAIL}`
          : `Contactar soporte de NeuroMarket en ${SUPPORT_EMAIL}`
      }
      accessibilityRole="button"
      onPress={() => void openSupportEmail(english)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Ionicons color={colors.red} name="mail-outline" size={24} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.white }]}>
          {english ? 'NeuroMarket support' : 'Soporte NeuroMarket'}
        </Text>
        <Text selectable style={[styles.subtitle, { color: colors.muted }]}>
          {SUPPORT_EMAIL}
        </Text>
      </View>
      <Ionicons color={colors.gray} name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  copy: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  subtitle: { fontFamily: fonts.body, fontSize: 13 },
});
