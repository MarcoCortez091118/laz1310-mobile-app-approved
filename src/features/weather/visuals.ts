import type { WeatherConditionCode } from './api';

export type WeatherSceneKind =
  | 'clear'
  | 'clouds'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'neutral';

export interface WeatherVisualTheme {
  scene: WeatherSceneKind;
  topColor: string;
  middleColor: string;
  bottomColor: string;
  cardColor: string;
  cloudColor: string;
  cloudOpacity: number;
  precipitationIntensity: number;
  lightning: boolean;
  showCelestialBody: boolean;
  celestialColor: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rainIntensity(precipitationMm: number) {
  if (precipitationMm <= 0) return 0.35;
  return clamp(0.35 + precipitationMm / 8, 0.35, 1);
}

export function weatherVisualTheme(input: {
  conditionCode: WeatherConditionCode;
  isDay: boolean;
  precipitationMm?: number;
}): WeatherVisualTheme {
  const precipitationMm = input.precipitationMm ?? 0;
  const day = input.isDay;

  switch (input.conditionCode) {
    case 'clear':
      return day
        ? {
            scene: 'clear',
            topColor: '#2E78AA',
            middleColor: '#4B91BC',
            bottomColor: '#143A58',
            cardColor: '#245A7B',
            cloudColor: '#FFFFFF',
            cloudOpacity: 0,
            precipitationIntensity: 0,
            lightning: false,
            showCelestialBody: true,
            celestialColor: '#FFD56A',
          }
        : {
            scene: 'clear',
            topColor: '#07111F',
            middleColor: '#0C1D33',
            bottomColor: '#08101A',
            cardColor: '#111F31',
            cloudColor: '#B9C4D2',
            cloudOpacity: 0,
            precipitationIntensity: 0,
            lightning: false,
            showCelestialBody: true,
            celestialColor: '#E9EEF6',
          };

    case 'mostly_clear':
    case 'partly_cloudy':
      return {
        scene: 'clouds',
        topColor: day ? '#3C789A' : '#0B1624',
        middleColor: day ? '#6D91A7' : '#182637',
        bottomColor: day ? '#294D63' : '#0A121C',
        cardColor: day ? '#466F86' : '#172536',
        cloudColor: day ? '#E8EEF1' : '#9AA7B4',
        cloudOpacity: 0.48,
        precipitationIntensity: 0,
        lightning: false,
        showCelestialBody: true,
        celestialColor: day ? '#F6D98B' : '#DDE5EF',
      };

    case 'cloudy':
      return {
        scene: 'clouds',
        topColor: day ? '#586A77' : '#111820',
        middleColor: day ? '#7A8992' : '#202A33',
        bottomColor: day ? '#3D4A53' : '#0D1319',
        cardColor: day ? '#596A74' : '#1A232C',
        cloudColor: day ? '#D4DBDE' : '#7C8790',
        cloudOpacity: 0.78,
        precipitationIntensity: 0,
        lightning: false,
        showCelestialBody: false,
        celestialColor: '#FFFFFF',
      };

    case 'fog':
      return {
        scene: 'fog',
        topColor: day ? '#718087' : '#20292D',
        middleColor: day ? '#909B9F' : '#364146',
        bottomColor: day ? '#566368' : '#182125',
        cardColor: day ? '#69777B' : '#293338',
        cloudColor: '#E6ECEE',
        cloudOpacity: day ? 0.34 : 0.22,
        precipitationIntensity: 0,
        lightning: false,
        showCelestialBody: false,
        celestialColor: '#FFFFFF',
      };

    case 'drizzle':
    case 'freezing_drizzle':
      return {
        scene: 'rain',
        topColor: day ? '#475C6A' : '#101923',
        middleColor: day ? '#607785' : '#22313F',
        bottomColor: day ? '#354955' : '#0B131B',
        cardColor: day ? '#465F6D' : '#172531',
        cloudColor: '#C5CFD4',
        cloudOpacity: 0.8,
        precipitationIntensity: clamp(
          rainIntensity(precipitationMm) * 0.58,
          0.28,
          0.62,
        ),
        lightning: false,
        showCelestialBody: false,
        celestialColor: '#FFFFFF',
      };

    case 'rain':
    case 'freezing_rain':
    case 'rain_showers':
      return {
        scene: 'rain',
        topColor: day ? '#354B5A' : '#09121B',
        middleColor: day ? '#4E6573' : '#172735',
        bottomColor: day ? '#273A45' : '#070D13',
        cardColor: day ? '#3E5765' : '#13212B',
        cloudColor: '#AFBBC2',
        cloudOpacity: 0.9,
        precipitationIntensity: rainIntensity(precipitationMm),
        lightning: false,
        showCelestialBody: false,
        celestialColor: '#FFFFFF',
      };

    case 'snow':
    case 'snow_grains':
    case 'snow_showers':
      return {
        scene: 'snow',
        topColor: day ? '#778D9B' : '#172331',
        middleColor: day ? '#AAB8C0' : '#2B3B4B',
        bottomColor: day ? '#657783' : '#111C28',
        cardColor: day ? '#7C8E98' : '#253544',
        cloudColor: '#E7EDF0',
        cloudOpacity: 0.74,
        precipitationIntensity: clamp(
          0.45 + precipitationMm / 10,
          0.4,
          1,
        ),
        lightning: false,
        showCelestialBody: false,
        celestialColor: '#FFFFFF',
      };

    case 'thunderstorm':
    case 'thunderstorm_hail':
      return {
        scene: 'storm',
        topColor: '#151C25',
        middleColor: '#283440',
        bottomColor: '#0A1017',
        cardColor: '#202C36',
        cloudColor: '#86919A',
        cloudOpacity: 0.96,
        precipitationIntensity: clamp(
          0.72 + precipitationMm / 10,
          0.72,
          1,
        ),
        lightning: true,
        showCelestialBody: false,
        celestialColor: '#FFFFFF',
      };

    default:
      return {
        scene: 'neutral',
        topColor: day ? '#344653' : '#111820',
        middleColor: day ? '#52636F' : '#202A33',
        bottomColor: day ? '#27343C' : '#0D1319',
        cardColor: day ? '#43545E' : '#1A232C',
        cloudColor: '#C8D0D5',
        cloudOpacity: 0.42,
        precipitationIntensity: 0,
        lightning: false,
        showCelestialBody: false,
        celestialColor: '#FFFFFF',
      };
  }
}
