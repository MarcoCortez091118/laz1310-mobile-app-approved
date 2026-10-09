import { apiRequest } from '../../api/client';

export type WeatherConditionCode =
  | 'clear'
  | 'mostly_clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'freezing_drizzle'
  | 'rain'
  | 'freezing_rain'
  | 'snow'
  | 'snow_grains'
  | 'rain_showers'
  | 'snow_showers'
  | 'thunderstorm'
  | 'thunderstorm_hail'
  | 'unknown';

export interface WeatherLocation {
  id: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
}

export interface WeatherLocationSummary extends WeatherLocation {
  primary: boolean;
}

export interface CurrentWeather {
  conditionCode: WeatherConditionCode;
  conditionText: string;
  temperatureC: number;
  highC: number;
  lowC: number;
  humidityPercent: number;
  windKph: number;
  precipitationMm: number;
  precipitationPeriodMinutes: number;
  isDay: boolean;
}

export interface HourlyWeather {
  at: string;
  temperatureC: number;
  conditionCode: WeatherConditionCode;
  conditionText: string;
  humidityPercent: number;
  windKph: number;
  precipitationMm: number;
  precipitationProbabilityPercent: number;
  isDay: boolean;
}

export interface DailyWeather {
  date: string;
  highC: number;
  lowC: number;
  conditionCode: WeatherConditionCode;
  conditionText: string;
  windKph: number;
  precipitationMm: number;
  precipitationProbabilityPercent: number;
}

export interface WeatherAttribution {
  text: string;
  url: string;
  licenseUrl: string;
}

export interface WeatherResponse {
  location: WeatherLocation;
  observedAt: string;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  attribution: WeatherAttribution[];
  fetchedAt: string;
  stale: boolean;
}

export function getWeatherLocations(): Promise<WeatherLocationSummary[]> {
  return apiRequest<WeatherLocationSummary[]>('/api/v1/weather/locations');
}

export function getWeatherDetail(locationId: string): Promise<WeatherResponse> {
  return apiRequest<WeatherResponse>(
    '/api/v1/weather/' + encodeURIComponent(locationId),
  );
}
