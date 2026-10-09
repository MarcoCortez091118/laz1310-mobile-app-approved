import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
  BarlowCondensed_900Black,
} from '@expo-google-fonts/barlow-condensed';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppBackground } from '../src/components/AppBackground';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { AuthProvider } from '../src/features/auth/AuthProvider';
import { ContentVersionProvider } from '../src/features/content/ContentVersionProvider';
import { PushNotificationsProvider } from '../src/features/notifications/PushNotificationsProvider';
import { ProgramRemindersProvider } from '../src/features/programs/ProgramRemindersProvider';
import { RadioProvider } from '../src/features/radio/RadioProvider';
import { useRadio } from '../src/features/radio/useRadio';
import { WeatherUnitProvider } from '../src/features/weather/WeatherUnitProvider';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { ThemeProvider, useAppTheme } from '../src/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const pathname = usePathname();
  const { hasStarted } = useRadio();
  const { preference } = useAppTheme();
  const [miniPlayerDismissed, setMiniPlayerDismissed] = useState(false);

  useEffect(() => {
    if (!hasStarted || pathname === '/radio') {
      setMiniPlayerDismissed(false);
    }
  }, [hasStarted, pathname]);

  const showMiniPlayer =
    hasStarted &&
    !miniPlayerDismissed &&
    pathname !== '/' &&
    pathname !== '/radio';

  const weatherDetail = pathname.startsWith('/weather/');

  return (
    <AppBackground enabled={!weatherDetail}>
      <View style={styles.app}>
        <StatusBar style={preference === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'transparent' },
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="home" options={{ animation: 'none' }} />
          <Stack.Screen name="radio" options={{ animation: 'none' }} />
          <Stack.Screen name="explore" options={{ animation: 'none' }} />
          <Stack.Screen name="profile/index" options={{ animation: 'none' }} />
        </Stack>
        <MiniPlayer
          onDismiss={() => setMiniPlayerDismissed(true)}
          visible={showMiniPlayer}
        />
      </View>
    </AppBackground>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    BarlowCondensed_900Black,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <WeatherUnitProvider>
            <AuthProvider>
              <ContentVersionProvider>
                <PushNotificationsProvider>
                  <ProgramRemindersProvider>
                    <RadioProvider>
                      <AppNavigator />
                    </RadioProvider>
                  </ProgramRemindersProvider>
                </PushNotificationsProvider>
              </ContentVersionProvider>
            </AuthProvider>
          </WeatherUnitProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
