import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../src/components/BottomNavigation';
import { IconButton } from '../src/components/IconButton';
import { LiveBadge } from '../src/components/LiveBadge';
import { PlayPauseButton } from '../src/components/PlayPauseButton';
import { VinylArtwork } from '../src/components/VinylArtwork';
import { RADIO_CONFIG } from '../src/config/radio';
import { shareLiveRadio } from '../src/config/share';
import { useRadio } from '../src/features/radio/useRadio';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

function formatDetroitTime(date: Date, english: boolean) {
  return new Intl.DateTimeFormat(english ? 'en-US' : 'es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: RADIO_CONFIG.timeZone,
  }).format(date);
}

export default function RadioScreen() {
  const router = useRouter();
  const { state, error, toggle, retry } = useRadio();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const { width, height } = useWindowDimensions();
  const english = language === 'en';
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const detroitTime = useMemo(() => formatDetroitTime(now, english), [english, now]);
  const loading = state === 'connecting' || state === 'reconnecting';
  const buttonState = loading ? 'loading' : state === 'playing' ? 'pause' : 'play';
  const vinylSize = Math.min(272, Math.max(170, width - 96), Math.max(170, height * 0.33));

  const share = async () => {
    try {
      await shareLiveRadio(language);
    } catch {
      Alert.alert(
        english ? 'Unable to share' : 'No se pudo compartir',
        english ? 'Please try again.' : 'Inténtalo de nuevo.',
      );
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <IconButton
            accessibilityLabel={english ? 'Back' : 'Volver'}
            backgroundColor="transparent"
            iconColor={colors.white}
            iconSize={28}
            name="chevron-back"
            onPress={() => router.replace('/home')}
            size={48}
          />

          <View style={styles.stationHeader}>
            <Text style={[styles.station, { color: colors.white }]}>LA Z 1310 AM</Text>
            <Text style={[styles.city, { color: colors.gray }]}>DETROIT, MI</Text>
          </View>
          <View style={styles.sidePlaceholder} />
        </View>

        <View style={styles.vinylStage}>
          <VinylArtwork size={vinylSize} playing={state === 'playing'} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCopy}>
            <Text style={[styles.title, { color: colors.white }]}>LA Z DETROIT</Text>
            <Text style={[styles.slogan, { color: colors.muted }]}>
              {english ? 'Marking territory' : 'Marcando territorio'}
            </Text>
          </View>

          <IconButton
            accessibilityLabel={english ? 'Share LA Z Detroit' : 'Compartir LA Z Detroit'}
            name="share-outline"
            onPress={() => void share()}
            size={48}
          />
        </View>

        <View style={styles.liveRow}>
          <LiveBadge live={state !== 'error'} />
          <Text style={[styles.time, { color: colors.gray }]}>
            {english ? 'DETROIT TIME' : 'HORA DETROIT'} · {detroitTime}
          </Text>
        </View>

        <View style={styles.controls}>
          <PlayPauseButton onPress={state === 'error' ? retry : toggle} state={buttonState} />
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.red }]}>
            {english ? 'ON AIR NOW' : 'AHORA AL AIRE'}
          </Text>
          <Text style={[styles.nowTitle, { color: colors.white }]}>
            {state === 'error'
              ? english ? 'STREAM UNAVAILABLE' : 'TRANSMISIÓN NO DISPONIBLE'
              : state === 'reconnecting'
                ? english ? 'RECONNECTING STREAM' : 'RECONECTANDO TRANSMISIÓN'
                : english ? 'MUSIC THAT MOVES YOU' : 'MÚSICA QUE TE MUEVE'}
          </Text>
          <Text numberOfLines={2} style={[styles.infoSubtitle, { color: colors.muted }]}>
            {error ?? (english ? 'LA Z 1310 · Live stream' : 'LA Z 1310 · Transmisión en vivo')}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={english ? 'Open program schedule' : 'Abrir programación'}
          accessibilityRole="button"
          onPress={() => router.push('/programs')}
          style={({ pressed }) => [
            styles.programCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View>
            <Text style={[styles.programTitle, { color: colors.white }]}>
              {english ? 'SCHEDULE' : 'PROGRAMACIÓN'}
            </Text>
            <Text style={[styles.infoSubtitle, { color: colors.muted }]}>
              {english ? 'See what is coming up on air' : 'Consulta lo que sigue al aire'}
            </Text>
          </View>
          <Ionicons color={colors.gray} name="chevron-forward" size={22} />
        </Pressable>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: 112,
    paddingHorizontal: spacing.md,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    width: '100%',
  },
  sidePlaceholder: { width: 48 },
  stationHeader: { alignItems: 'center' },
  station: { fontFamily: fonts.bodyBold, fontSize: 16 },
  city: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1.1, marginTop: 2 },
  vinylStage: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metaCopy: { flex: 1, paddingRight: spacing.sm },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 34, lineHeight: 36 },
  slogan: { fontFamily: fonts.body, fontSize: 15, marginTop: 2 },
  liveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  time: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 0.6 },
  controls: { alignItems: 'center', marginVertical: spacing.sm, width: '100%' },
  infoCard: { borderRadius: radii.md, borderWidth: 1, gap: 4, padding: 16, width: '100%' },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1 },
  nowTitle: { fontFamily: fonts.displayExtraBold, fontSize: 22, lineHeight: 25 },
  infoSubtitle: { fontFamily: fonts.body, fontSize: 12 },
  programCard: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingHorizontal: 16,
    width: '100%',
  },
  programTitle: { fontFamily: fonts.bodyBold, fontSize: 14 },
});
