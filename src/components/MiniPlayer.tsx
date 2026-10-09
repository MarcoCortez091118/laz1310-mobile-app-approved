import Ionicons from '@expo/vector-icons/Ionicons';
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
import { PlayPauseButton } from './PlayPauseButton';
import { VinylArtwork } from './VinylArtwork';

interface MiniPlayerProps {
  visible: boolean;
  onDismiss: () => void;
}

export function MiniPlayer({ visible, onDismiss }: MiniPlayerProps) {
  const router = useRouter();
  const { state, toggle } = useRadio();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  if (!visible) {
    return null;
  }

  const playbackState =
    state === 'connecting' || state === 'reconnecting'
      ? 'loading'
      : state === 'playing'
        ? 'pause'
        : 'play';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.burgundy,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          english ? 'Open LA Z 1310 player' : 'Abrir reproductor de LA Z 1310'
        }
        onPress={() => router.replace('/radio')}
        style={styles.content}
      >
        <View style={[styles.accent, { backgroundColor: colors.red }]} />
        <VinylArtwork size={48} playing={state === 'playing'} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.white }]}>LA Z 1310</Text>
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: colors.red }]}
          >
            {state === 'reconnecting'
              ? english
                ? 'Reconnecting live stream…'
                : 'Reconectando transmisión…'
              : english
                ? 'LA Z Detroit · LIVE'
                : 'LA Z Detroit · EN VIVO'}
          </Text>
        </View>
      </Pressable>

      <PlayPauseButton
        onPress={toggle}
        size="compact"
        state={playbackState}
      />

      <Pressable
        accessibilityLabel={
          english ? 'Hide floating radio player' : 'Ocultar reproductor flotante'
        }
        accessibilityRole="button"
        hitSlop={8}
        onPress={onDismiss}
        style={({ pressed }) => [
          styles.dismiss,
          {
            backgroundColor: colors.surfaceElevated,
            opacity: pressed ? 0.68 : 1,
          },
        ]}
      >
        <Ionicons color={colors.muted} name="close" size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    bottom: 88,
    flexDirection: 'row',
    gap: spacing.sm,
    left: 8,
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
    right: 8,
    zIndex: 20,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  accent: {
    borderRadius: radii.round,
    height: 48,
    width: 3,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
  dismiss: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    marginLeft: -4,
    width: 28,
  },
});
