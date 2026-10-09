import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerCarousel } from '../src/components/BannerCarousel';
import { BottomNavigation } from '../src/components/BottomNavigation';
import { BrandLogo } from '../src/components/BrandLogo';
import { LiveRadioCard } from '../src/components/LiveRadioCard';
import { ProgramCard } from '../src/components/ProgramCard';
import { PromoHero } from '../src/components/PromoHero';
import { SpotifyPlaylistCard } from '../src/components/SpotifyPlaylistCard';
import { WeatherHeaderBadge } from '../src/components/WeatherHeaderBadge';
import { programScheduleLabel } from '../src/features/programs/presentation';
import { usePrograms } from '../src/features/programs/usePrograms';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, spacing } from '../src/theme/tokens';

type HomeModuleRoute = '/dynamics' | '/weather' | '/programs' | '/notifications';
type HomeCategory = {
  id: 'all' | 'dynamics' | 'weather' | 'programs' | 'notifications';
  label: string;
  route?: HomeModuleRoute;
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const { programs, loading: programsLoading, error: programsError } = usePrograms();
  const scrollRef = useRef<ScrollView>(null);

  // These are navigation shortcuts, not filters. All content is shown on Home.
  const categories: HomeCategory[] = [
    { id: 'all', label: english ? 'All' : 'Todos' },
    { id: 'dynamics', label: english ? 'Dynamics' : 'Dinámicas', route: '/dynamics' },
    { id: 'weather', label: english ? 'Weather' : 'Clima', route: '/weather' },
    { id: 'programs', label: english ? 'Programs' : 'Programas', route: '/programs' },
    {
      id: 'notifications',
      label: english ? 'Notifications' : 'Notificaciones',
      route: '/notifications',
    },
  ];

  const navigateCategory = (category: HomeCategory) => {
    if (category.route) {
      router.push(category.route);
      return;
    }

    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safe}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <BrandLogo width={118} />
            <Text style={[styles.location, { color: colors.gray }]}>DETROIT, MI</Text>
          </View>

          <View style={styles.headerActions}>
            <WeatherHeaderBadge />
            <Pressable
              accessibilityLabel={english ? 'Open notifications' : 'Abrir notificaciones'}
              accessibilityRole="button"
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [
                styles.bell,
                {
                  backgroundColor: colors.surfaceElevated,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons color={colors.white} name="notifications-outline" size={20} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          accessibilityLabel={english ? 'Browse sections' : 'Explorar secciones'}
          horizontal
          contentContainerStyle={styles.categories}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const selected = category.id === 'all';
            return (
              <Pressable
                accessibilityLabel={category.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={category.id}
                onPress={() => navigateCategory(category)}
                style={({ pressed }) => [
                  styles.category,
                  {
                    backgroundColor: selected ? colors.red : colors.surfaceElevated,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: selected ? '#FEFEFE' : colors.white },
                    selected && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <BannerCarousel />
        <LiveRadioCard />
        <PromoHero />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            {english ? 'PROGRAMS' : 'PROGRAMAS'}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={!programs.length}
            onPress={() => router.push('/programs')}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : programs.length ? 1 : 0.45 })}
          >
            <Text style={[styles.seeAll, { color: colors.red }]}>
              {english ? 'See all →' : 'Ver todos →'}
            </Text>
          </Pressable>
        </View>

        {programsLoading ? (
          <View style={styles.programState}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.programStateText, { color: colors.muted }]}>
              {english ? 'Loading programs…' : 'Cargando programación…'}
            </Text>
          </View>
        ) : programsError ? (
          <View style={styles.programState}>
            <Text style={[styles.programStateText, { color: colors.muted }]}>
              {english
                ? 'Programs are not available right now.'
                : 'La programación no está disponible en este momento.'}
            </Text>
          </View>
        ) : programs.length > 2 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programCarousel}
          >
            {programs.map((program) => (
              <ProgramCard
                key={`${program.stationId}:${program.id}`}
                onPress={() => router.push(`/programs/${program.id}`)}
                hostName={program.hostName}
                imageUrl={program.imageUrl}
                schedule={programScheduleLabel(program, language)}
                style={styles.programCarouselCard}
                title={program.name}
              />
            ))}
          </ScrollView>
        ) : programs.length ? (
          <View style={styles.programs}>
            {programs.map((program) => (
              <ProgramCard
                key={`${program.stationId}:${program.id}`}
                onPress={() => router.push(`/programs/${program.id}`)}
                hostName={program.hostName}
                imageUrl={program.imageUrl}
                schedule={programScheduleLabel(program, language)}
                style={styles.programPairCard}
                title={program.name}
              />
            ))}
          </View>
        ) : (
          <View style={styles.programState}>
            <Text style={[styles.programStateText, { color: colors.muted }]}>
              {english ? 'No programs have been published yet.' : 'Aún no hay programas publicados.'}
            </Text>
          </View>
        )}

        <SpotifyPlaylistCard />
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingBottom: 190,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 78,
  },
  brandBlock: {
    alignItems: 'flex-start',
  },
  location: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1.1,
    marginLeft: 4,
    marginTop: -8,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  bell: {
    alignItems: 'center',
    borderRadius: 20,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  categories: {
    alignItems: 'center',
    gap: 10,
    paddingRight: spacing.md,
  },
  category: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  categoryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontFamily: fonts.bodyBold,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 30,
  },
  seeAll: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  programs: {
    flexDirection: 'row',
    gap: 14,
  },
  programPairCard: {
    flex: 1,
  },
  programCarousel: {
    gap: 14,
    paddingRight: spacing.md,
  },
  programCarouselCard: {
    width: 176,
  },
  programState: {
    alignItems: 'center',
    gap: 8,
    minHeight: 90,
    justifyContent: 'center',
  },
  programStateText: {
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
  },
});
