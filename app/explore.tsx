import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../src/components/BottomNavigation';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';

  const modules = [
    {
      id: 'dynamics',
      title: english ? 'Dynamics' : 'Dinámicas',
      subtitle: english
        ? 'Join LA Z promotions and contests.'
        : 'Participa en promociones y concursos de LA Z.',
      icon: 'sparkles-outline' as const,
      route: '/dynamics' as const,
    },
    {
      id: 'weather',
      title: english ? 'Weather' : 'Clima',
      subtitle: english
        ? 'Forecasts for Detroit and LA Z cities.'
        : 'Pronóstico de Detroit y otras ciudades de LA Z.',
      icon: 'partly-sunny-outline' as const,
      route: '/weather' as const,
    },
    {
      id: 'programs',
      title: english ? 'Programs' : 'Programas',
      subtitle: english
        ? 'Shows, hosts and published weekly schedule.'
        : 'Shows, hosts y programación semanal publicada.',
      icon: 'mic-outline' as const,
      route: '/programs' as const,
    },
    {
      id: 'contact',
      title: english ? 'Contact' : 'Contacto',
      subtitle: english
        ? 'Website, Facebook, Instagram and WhatsApp.'
        : 'Sitio web, Facebook, Instagram y WhatsApp.',
      icon: 'chatbubbles-outline' as const,
      route: '/contact' as const,
    },
    {
      id: 'advertise',
      title: english ? 'Advertise with us' : 'Promociónate con nosotros',
      subtitle: english
        ? 'Talk to our team about advertising your business.'
        : 'Hablemos de publicidad para tu negocio.',
      icon: 'megaphone-outline' as const,
      route: '/advertise' as const,
    },
  ];

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safe}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.white }]}>
          {english ? 'Explore' : 'Explorar'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Discover the experiences available on LA Z.'
            : 'Descubre las experiencias disponibles en LA Z.'}
        </Text>

        <View style={styles.grid}>
          {modules.map((item) => (
            <Pressable
              accessibilityLabel={item.title}
              accessibilityRole="button"
              key={item.id}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  opacity: pressed ? 0.76 : 1,
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                <Ionicons
                  color={colors.red}
                  name={item.icon}
                  size={28}
                />
              </View>
              <Text style={[styles.cardTitle, { color: colors.white }]}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 160,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 36,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  grid: {
    gap: 14,
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    minHeight: 150,
    padding: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  cardTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 25,
    marginTop: 14,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
