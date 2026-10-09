import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRadio } from '../features/radio/useRadio';
import { useLanguage } from '../i18n/LanguageProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';
import { LiveBadge } from './LiveBadge';
import { PlayPauseButton } from './PlayPauseButton';
import { VinylArtwork } from './VinylArtwork';

export function LiveRadioCard() {
  const router = useRouter();
  const { state, play, pause, retry } = useRadio();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  const loading = state === 'connecting' || state === 'reconnecting';
  const error = state === 'error';

  const handlePrimaryPress = () => {
    if (error) {
      retry();
      return;
    }
    if (state === 'playing') {
      pause();
      return;
    }
    play();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.burgundy, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={english ? 'Open live radio' : 'Abrir radio en vivo'}
        onPress={() => router.replace('/radio')}
        style={styles.content}
      >
        <View style={[styles.accent, { backgroundColor: colors.red }]} />
        <VinylArtwork size={58} playing={state === 'playing'} />

        <View style={styles.copy}>
          <LiveBadge compact live={!error} />
          <Text style={[styles.title, { color: colors.white }]}>
            {error
              ? english ? 'RADIO UNAVAILABLE' : 'RADIO NO DISPONIBLE'
              : english ? 'LISTEN LIVE' : 'ESCUCHA EN VIVO'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {error
              ? english ? 'Tap to retry' : 'Toca para reintentar'
              : 'LA Z 1310 · Detroit'}
          </Text>
        </View>
      </Pressable>

      <PlayPauseButton
        onPress={handlePrimaryPress}
        size="compact"
        state={loading ? 'loading' : state === 'playing' ? 'pause' : 'play'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 96, padding: spacing.md },
  content: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.sm },
  accent: { borderRadius: radii.round, height: 64, width: 4 },
  copy: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 21, lineHeight: 22, marginTop: 2 },
  subtitle: { fontFamily: fonts.body, fontSize: 11 },
});
