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

import {
  ThemeColors,
  ThemePreference,
  themeColors,
} from './tokens';

const THEME_STORAGE_KEY = '@laz1310/theme-preference';

interface ThemeContextValue {
  preference: ThemePreference;
  colors: ThemeColors;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (
          mounted &&
          (stored === 'dark' || stored === 'light')
        ) {
          setPreferenceState(stored);
        }
      })
      .finally(() => {
        if (mounted) {
          setHydrated(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    },
    [],
  );

  const toggle = useCallback(() => {
    setPreference(preference === 'dark' ? 'light' : 'dark');
  }, [preference, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      colors: themeColors[preference],
      hydrated,
      setPreference,
      toggle,
    }),
    [hydrated, preference, setPreference, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return value;
}
