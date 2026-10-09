import { StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '../i18n/LanguageProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

interface LiveBadgeProps {
  live?: boolean;
  compact?: boolean;
}

export function LiveBadge({ live = true, compact = false }: LiveBadgeProps) {
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const stateColor = live ? colors.red : colors.gray;

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: colors.surfaceElevated },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: stateColor }]} />
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          { color: stateColor },
        ]}
      >
        {live
          ? english
            ? 'LIVE'
            : 'EN VIVO'
          : english
            ? 'OFF AIR'
            : 'FUERA DEL AIRE'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.round,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  containerCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    borderRadius: radii.round,
    height: 8,
    width: 8,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  labelCompact: {
    fontSize: 10,
  },
});
