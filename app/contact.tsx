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

import { ScreenHeader } from '../src/components/ScreenHeader';
import { CONTACT_CHANNELS } from '../src/config/contact';
import { openContactChannel } from '../src/features/contact/links';
import { useLanguage } from '../src/i18n/LanguageProvider';
import { useAppTheme } from '../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../src/theme/tokens';

export default function ContactScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const { colors } = useAppTheme();
  const english = language === 'en';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={english ? 'Contact' : 'Contacto'} />
        <Text style={[styles.title, { color: colors.white }]}>
          {english ? 'STAY CONNECTED' : 'SIGAMOS CONECTADOS'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Find LA Z Detroit on our official website and social channels.'
            : 'Encuentra a LA Z Detroit en nuestro sitio web y redes oficiales.'}
        </Text>

        <View style={styles.links}>
          {CONTACT_CHANNELS.map((channel) => {
            const label = english ? channel.labelEn : channel.labelEs;
            return (
              <Pressable
                accessibilityLabel={`${label}: ${channel.detail}`}
                accessibilityRole="link"
                key={channel.id}
                onPress={() => void openContactChannel(channel, language)}
                style={({ pressed }) => [
                  styles.channel,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: pressed ? 0.74 : 1,
                  },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                  <Ionicons color={colors.red} name={channel.icon} size={26} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.label, { color: colors.white }]}>
                    {label}
                  </Text>
                  <Text
                    numberOfLines={2}
                    selectable
                    style={[styles.detail, { color: colors.muted }]}
                  >
                    {channel.detail}
                  </Text>
                </View>
                <Ionicons color={colors.gray} name="open-outline" size={22} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityLabel={
            english ? 'Advertise with LA Z 1310' : 'Promociónate con LA Z 1310'
          }
          accessibilityRole="button"
          onPress={() => router.push('/advertise')}
          style={({ pressed }) => [
            styles.advertise,
            {
              backgroundColor: colors.burgundy,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Ionicons color={colors.red} name="megaphone-outline" size={26} />
          <View style={styles.copy}>
            <Text style={[styles.label, { color: colors.white }]}>
              {english ? 'Advertise with us' : 'Promociónate con nosotros'}
            </Text>
            <Text style={[styles.detail, { color: colors.muted }]}>
              {english ? 'Get in touch with our sales team' : 'Contacta a nuestro equipo comercial'}
            </Text>
          </View>
          <Ionicons color={colors.gray} name="chevron-forward" size={22} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 160,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  links: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  channel: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 84,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.sm,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  copy: { flex: 1, gap: 5 },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 16 },
  detail: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  advertise: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    minHeight: 88,
    padding: spacing.md,
  },
});
