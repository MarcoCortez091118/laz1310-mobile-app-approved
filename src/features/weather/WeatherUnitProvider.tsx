import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { WeatherUnit } from './presentation';

const STORAGE_KEY = '@laz1310/weather-unit';

interface WeatherUnitContextValue {
  unit: WeatherUnit;
  setUnit: (unit: WeatherUnit) => void;
}

const WeatherUnitContext = createContext<WeatherUnitContextValue | null>(null);

export function WeatherUnitProvider({ children }: PropsWithChildren) {
  const [unit, setUnitState] = useState<WeatherUnit>('F');

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (active && (stored === 'F' || stored === 'C')) {
        setUnitState(stored);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const setUnit = useCallback((value: WeatherUnit) => {
    setUnitState(value);
    void AsyncStorage.setItem(STORAGE_KEY, value);
  }, []);

  const value = useMemo(() => ({ unit, setUnit }), [setUnit, unit]);

  return (
    <WeatherUnitContext.Provider value={value}>
      {children}
    </WeatherUnitContext.Provider>
  );
}

export function useWeatherUnit() {
  const value = useContext(WeatherUnitContext);

  if (!value) {
    throw new Error('useWeatherUnit must be used within WeatherUnitProvider');
  }

  return value;
}
