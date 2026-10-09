export const darkColors = {
  black: '#050101',
  red: '#D30A12',
  burgundy: '#2F0908',
  white: '#FEFEFE',
  gray: '#8A8A8A',
  surface: '#0F0505',
  surfaceElevated: '#210808',
  border: 'rgba(254,254,254,0.08)',
  muted: '#96929A',
} as const;

export const lightColors = {
  black: '#F8F7F7',
  red: '#D30A12',
  burgundy: '#FFFFFF',
  white: '#111012',
  gray: '#68636B',
  surface: '#FFFFFF',
  surfaceElevated: '#F1ECEC',
  border: 'rgba(17,16,18,0.10)',
  muted: '#77717A',
} as const;

export type ThemePreference = 'dark' | 'light';
export type ThemeColors = {
  [K in keyof typeof darkColors]: string;
};

export const themeColors: Record<ThemePreference, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

/**
 * Backward-compatible dark palette for components not yet migrated to
 * useAppTheme. New UI should consume the theme context instead.
 */
export const colors = darkColors;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  round: 999,
} as const;

export const fonts = {
  displayBold: 'BarlowCondensed_700Bold',
  displayExtraBold: 'BarlowCondensed_800ExtraBold',
  displayBlack: 'BarlowCondensed_900Black',
  body: 'Outfit_400Regular',
  bodyMedium: 'Outfit_500Medium',
  bodySemiBold: 'Outfit_600SemiBold',
  bodyBold: 'Outfit_700Bold',
} as const;
