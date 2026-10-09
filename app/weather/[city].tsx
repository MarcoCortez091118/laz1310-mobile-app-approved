import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../src/api/client';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { WeatherScene } from '../../src/components/weather/WeatherScene';
import {
  getWeatherDetail,
  WeatherResponse,
} from '../../src/features/weather/api';
import {
  conditionIcon,
  conditionLabel,
  dailyLabel,
  displayPrecipitation,
  displayTemperature,
  displayWind,
  hourlyLabel,
} from '../../src/features/weather/presentation';
import { useWeatherUnit } from '../../src/features/weather/WeatherUnitProvider';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

export default function WeatherDetailScreen() {
  const { city: cityParam } = useLocalSearchParams<{ city?: string }>();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const { unit } = useWeatherUnit();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const errorCopy = useCallback(
    (requestError: unknown) => {
      if (requestError instanceof ApiError && requestError.status === 404) {
        return english
          ? 'This city is no longer configured in LA Z.'
          : 'Esta ciudad ya no está configurada en LA Z.';
      }
      if (requestError instanceof ApiError && requestError.status === 503) {
        return english
          ? 'The weather provider is temporarily unavailable.'
          : 'El proveedor meteorológico no está disponible temporalmente.';
      }
      return english ? 'We could not load this forecast.' : 'No pudimos cargar este pronóstico.';
    },
    [english],
  );

  const load = useCallback(async () => {
    if (!cityParam) {
      setError(english ? 'The requested city is missing.' : 'Falta la ciudad solicitada.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setWeather(await getWeatherDetail(cityParam));
    } catch (requestError) {
      setWeather(null);
      setError(errorCopy(requestError));
    } finally {
      setLoading(false);
    }
  }, [cityParam, english, errorCopy]);

  useEffect(() => {
    void load();
  }, [load]);

  const sceneCondition = weather?.current.conditionCode ?? 'unknown';
  const sceneIsDay = weather?.current.isDay ?? true;
  const glassBackground = sceneIsDay
    ? 'rgba(9,20,29,0.52)'
    : 'rgba(5,8,13,0.62)';
  const glassBorder = 'rgba(254,254,254,0.14)';
  const sceneMuted = 'rgba(254,254,254,0.72)';

  return (
    <WeatherScene
      conditionCode={sceneCondition}
      isDay={sceneIsDay}
      precipitationMm={weather?.current.precipitationMm}
      windKph={weather?.current.windKph}
    >
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={english ? 'Weather' : 'Clima'} />

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: sceneMuted }]}>
              {english ? 'Updating forecast…' : 'Actualizando pronóstico…'}
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="cloud-offline-outline" size={32} />
            <Text style={[styles.errorText, { color: '#FEFEFE' }]}>{error}</Text>
            <PrimaryButton label={english ? 'Retry' : 'Reintentar'} onPress={() => void load()} secondary />
          </View>
        ) : null}

        {!loading && weather ? (
          <>
            <View style={styles.hero}>
              <Text style={[styles.market, { color: colors.red }]}>LA Z WEATHER</Text>
              <Text style={[styles.city, { color: '#FEFEFE' }]}>{weather.location.city}</Text>
              <Text style={[styles.temperature, { color: '#FEFEFE' }]}>
                {displayTemperature(weather.current.temperatureC, unit)}°
              </Text>
              <Text style={[styles.condition, { color: '#FEFEFE' }]}>
                {conditionLabel(weather.current.conditionCode, language)}
              </Text>
              <Text style={[styles.highLow, { color: '#FEFEFE' }]}>
                H:{displayTemperature(weather.current.highC, unit)}°  L:{displayTemperature(weather.current.lowC, unit)}°
              </Text>
              {weather.stale ? (
                <Text style={[styles.stale, { color: colors.red }]}>
                  {english
                    ? 'CACHED DATA · UPDATES TEMPORARILY LIMITED'
                    : 'DATOS EN CACHÉ · ACTUALIZACIÓN TEMPORALMENTE LIMITADA'}
                </Text>
              ) : null}
            </View>

            <View style={[styles.glassCard, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
              <Text style={[styles.summary, { color: '#FEFEFE' }]}>{weather.current.conditionText}</Text>
              <Text style={[styles.observed, { color: sceneMuted }]}>
                {english ? 'Observed ' : 'Observado '}
                {new Date(weather.observedAt).toLocaleString(english ? 'en-US' : 'es-US')}
              </Text>
            </View>

            <View style={[styles.glassCard, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
              <Text style={[styles.eyebrow, { color: sceneMuted }]}>
                {english ? 'NEXT 24 HOURS' : 'PRÓXIMAS 24 HORAS'}
              </Text>
              <ScrollView horizontal contentContainerStyle={styles.hourly} showsHorizontalScrollIndicator={false}>
                {weather.hourly.map((hour, index) => (
                  <View key={hour.at} style={styles.hour}>
                    <Text style={[styles.hourLabel, { color: '#FEFEFE' }]}>
                      {hourlyLabel(hour.at, weather.location.timezone, index, language)}
                    </Text>
                    <Ionicons color={hour.isDay ? colors.red : colors.white} name={conditionIcon(hour.conditionCode, hour.isDay)} size={28} />
                    <Text style={[styles.hourTemp, { color: '#FEFEFE' }]}>
                      {displayTemperature(hour.temperatureC, unit)}°
                    </Text>
                    <Text style={[styles.hourRain, { color: sceneMuted }]}>
                      {Math.round(hour.precipitationProbabilityPercent)}%
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.glassCard, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
              <Text style={[styles.eyebrow, { color: sceneMuted }]}>
                {english ? 'FORECAST · 5 DAYS' : 'PRONÓSTICO · 5 DÍAS'}
              </Text>
              {weather.daily.map((day, index) => (
                <View key={day.date} style={[styles.dayRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.day, { color: '#FEFEFE' }]}>{dailyLabel(day.date, index, language)}</Text>
                  <Ionicons color={colors.white} name={conditionIcon(day.conditionCode)} size={26} />
                  <Text style={[styles.low, { color: sceneMuted }]}>{displayTemperature(day.lowC, unit)}°</Text>
                  <View style={styles.range}><View style={[styles.rangeFill, { backgroundColor: colors.red }]} /></View>
                  <Text style={[styles.high, { color: '#FEFEFE' }]}>{displayTemperature(day.highC, unit)}°</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: '#FEFEFE' }]}>
              {english ? 'Conditions' : 'Condiciones'}
            </Text>

            <View style={styles.metrics}>
              {[
                [english ? 'HUMIDITY' : 'HUMEDAD', Math.round(weather.current.humidityPercent) + '%'],
                [english ? 'WIND' : 'VIENTO', displayWind(weather.current.windKph, unit)],
                [english ? 'PRECIP.' : 'PRECIP.', displayPrecipitation(weather.current.precipitationMm, unit)],
              ].map(([label, value]) => (
                <View key={label} style={[styles.metric, { backgroundColor: glassBackground, borderColor: glassBorder }]}>
                  <Text style={[styles.metricLabel, { color: sceneMuted }]}>{label}</Text>
                  <Text style={[styles.metricValue, { color: '#FEFEFE' }]}>{value}</Text>
                </View>
              ))}
            </View>

            {weather.attribution.map((item) => (
              <Pressable key={item.url} onPress={() => void Linking.openURL(item.url)} style={styles.attribution}>
                <Text style={[styles.attributionText, { color: sceneMuted }]}>{item.text}</Text>
              </Pressable>
            ))}
          </>
        ) : null}
        </ScrollView>
      </SafeAreaView>
    </WeatherScene>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { gap: 14, paddingBottom: 140, paddingHorizontal: spacing.md },
  state: { alignItems: 'center', gap: 12, paddingVertical: 100 },
  stateText: { fontFamily: fonts.body, fontSize: 12 },
  errorCard: { borderRadius: radii.lg, borderWidth: 1, gap: 14, marginTop: spacing.lg, padding: spacing.lg },
  errorText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  hero: { alignItems: 'center', minHeight: 250, paddingTop: spacing.md },
  market: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.4 },
  city: { fontFamily: fonts.displayBold, fontSize: 38, marginTop: 16 },
  temperature: { fontFamily: fonts.displayBold, fontSize: 100, lineHeight: 104 },
  condition: { fontFamily: fonts.bodySemiBold, fontSize: 18 },
  highLow: { fontFamily: fonts.bodyMedium, fontSize: 14, marginTop: 4 },
  stale: { fontFamily: fonts.bodyBold, fontSize: 8, letterSpacing: 0.8, marginTop: 12, textAlign: 'center' },
  glassCard: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.md },
  summary: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  observed: { fontFamily: fonts.body, fontSize: 10, marginTop: 6 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1 },
  hourly: { gap: 18, paddingTop: spacing.md },
  hour: { alignItems: 'center', gap: 8, minWidth: 50 },
  hourLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
  hourTemp: { fontFamily: fonts.bodyMedium, fontSize: 16 },
  hourRain: { fontFamily: fonts.body, fontSize: 9 },
  dayRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 50 },
  day: { fontFamily: fonts.bodySemiBold, fontSize: 15, width: 54 },
  low: { fontFamily: fonts.bodyMedium, fontSize: 15, textAlign: 'right', width: 42 },
  range: { backgroundColor: 'rgba(127,127,127,0.24)', borderRadius: 999, flex: 1, height: 5 },
  rangeFill: { borderRadius: 999, height: 5, width: '72%' },
  high: { fontFamily: fonts.bodySemiBold, fontSize: 15, textAlign: 'right', width: 42 },
  sectionTitle: { fontFamily: fonts.displayExtraBold, fontSize: 26 },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { borderRadius: radii.md, borderWidth: 1, flex: 1, minHeight: 90, padding: 12 },
  metricLabel: { fontFamily: fonts.bodyBold, fontSize: 9 },
  metricValue: { fontFamily: fonts.displayBold, fontSize: 20, marginTop: 14 },
  attribution: { alignItems: 'center', paddingVertical: 5 },
  attributionText: { fontFamily: fonts.body, fontSize: 9, textAlign: 'center' },
});
