import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandLogo } from '../src/components/BrandLogo';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts } from '../src/theme/tokens';

export default function SplashRoute() {
  const router = useRouter();
  const { colors } = useAppTheme();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/home');
    }, 1_100);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={[styles.ring, styles.ringLarge, { backgroundColor: colors.burgundy }]} />
      <View style={[styles.ring, styles.ringMedium, { backgroundColor: colors.burgundy }]} />
      <View style={[styles.ring, styles.ringSmall, { backgroundColor: colors.burgundy }]} />

      <View style={styles.center}>
        <BrandLogo width={188} />
        <Text style={[styles.city, { color: colors.white }]}>DETROIT, MI</Text>
        <Text style={[styles.slogan, { color: colors.red }]}>MARCANDO TERRITORIO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    zIndex: 2,
  },
  city: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 2.6,
    marginTop: 20,
    opacity: 0.78,
  },
  slogan: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 2.1,
    marginTop: 12,
    opacity: 0.72,
  },
  ring: {
    borderRadius: 999,
    position: 'absolute',
  },
  ringLarge: {
    height: 760,
    opacity: 0.18,
    width: 760,
  },
  ringMedium: {
    height: 560,
    opacity: 0.28,
    width: 560,
  },
  ringSmall: {
    height: 360,
    opacity: 0.46,
    width: 360,
  },
});
