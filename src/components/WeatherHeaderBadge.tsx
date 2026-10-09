import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  getWeatherDetail,
  getWeatherLocations,
  WeatherResponse,
} from '../features/weather/api';
import {
  conditionIcon,
  displayTemperature,
} from '../features/weather/presentation';
import { useWeatherUnit } from '../features/weather/WeatherUnitProvider';
import { useLanguage } from '../i18n/LanguageProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii } from '../theme/tokens';

export function WeatherHeaderBadge() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const { unit } = useWeatherUnit();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const locations = await getWeatherLocations();
        const primary = locations.find((item) => item.primary) ?? locations[0];

        if (!primary) {
          return;
        }

        const value = await getWeatherDetail(primary.id);
        if (active) {
          setWeather(value);
        }
      } catch {
        if (active) {
          setWeather(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Pressable
      accessibilityLabel={language === 'en' ? 'Open weather' : 'Abrir clima'}
      accessibilityRole="button"
      onPress={() => router.push('/weather')}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Ionicons
        color={weather?.stale ? colors.muted : colors.red}
        name={
          weather
            ? conditionIcon(
                weather.current.conditionCode,
                weather.current.isDay,
              )
            : 'cloud-outline'
        }
        size={16}
      />
      <Text style={[styles.temperature, { color: colors.white }]}>
        {weather
          ? displayTemperature(weather.current.temperatureC, unit) + '°'
          : '—'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  temperature: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
});
