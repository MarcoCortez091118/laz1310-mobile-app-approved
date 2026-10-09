import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { AppLanguage } from '../i18n/LanguageProvider';
import type { PublishedProgram } from '../features/programs/api';
import type { ProgramAirtimeState } from '../features/programs/schedule';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

interface ProgramFeedCardProps {
  program: PublishedProgram;
  language: AppLanguage;
  state: ProgramAirtimeState;
  schedule: string;
  reminderActive: boolean;
  onOpen: () => void;
  onPrimaryAction: () => void;
}

function statusLabel(
  state: ProgramAirtimeState,
  language: AppLanguage,
) {
  if (state === 'live') return language === 'en' ? 'LIVE' : 'EN VIVO';
  if (state === 'upcoming') return language === 'en' ? 'UP NEXT' : 'PRÓXIMO';
  return language === 'en' ? 'OFF AIR' : 'FUERA DEL AIRE';
}

function primaryLabel(
  state: ProgramAirtimeState,
  language: AppLanguage,
  reminderActive: boolean,
) {
  if (state === 'live') {
    return language === 'en' ? 'LISTEN LIVE' : 'ESCUCHAR EN VIVO';
  }
  if (reminderActive) {
    return language === 'en' ? 'REMINDER ✓' : 'RECORDATORIO ✓';
  }
  return language === 'en' ? 'REMIND ME' : 'RECORDARME';
}

function fallbackArtworkLines(program: PublishedProgram) {
  const words = program.name
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return ['LA Z', 'PROGRAM'];
  if (words.length === 1) return [words[0] ?? 'LA Z'];

  return [
    words.slice(0, Math.ceil(words.length / 2)).join(' '),
    words.slice(Math.ceil(words.length / 2)).join(' '),
  ];
}

export function ProgramFeedCard({
  program,
  language,
  state,
  schedule,
  reminderActive,
  onOpen,
  onPrimaryAction,
}: ProgramFeedCardProps) {
  const { colors } = useAppTheme();
  const live = state === 'live';
  const artworkLines = fallbackArtworkLines(program);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: live ? colors.burgundy : colors.surface,
          borderColor: live ? colors.red : colors.surfaceElevated,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={
          language === 'en'
            ? `Open ${program.name}`
            : `Abrir ${program.name}`
        }
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [
          styles.top,
          { opacity: pressed ? 0.78 : 1 },
        ]}
      >
        <View
          style={[
            styles.artwork,
            { backgroundColor: colors.burgundy },
          ]}
        >
          {program.imageUrl ? (
            <>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="cover"
                source={{ uri: program.imageUrl }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.artworkScrim} />
            </>
          ) : (
            <View
              style={[
                styles.artworkGlow,
                { backgroundColor: colors.red },
              ]}
            />
          )}

          {!program.imageUrl ? (
            <View style={styles.fallbackCopy}>
              {artworkLines.slice(0, 2).map((line) => (
                <Text key={line} numberOfLines={1} style={styles.fallbackTitle}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={[styles.artworkTime, { backgroundColor: colors.red }]}>
            <Text numberOfLines={1} style={styles.artworkTimeText}>
              {schedule}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: live ? colors.red : colors.surfaceElevated,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: live ? '#FEFEFE' : colors.muted },
              ]}
            >
              {statusLabel(state, language)}
            </Text>
          </View>

          <Text
            numberOfLines={2}
            style={[styles.title, { color: colors.white }]}
          >
            {program.name}
          </Text>

          {program.hostName ? (
            <Text
              numberOfLines={1}
              style={[styles.host, { color: colors.muted }]}
            >
              {language === 'en'
                ? `With ${program.hostName}`
                : `Con ${program.hostName}`}
            </Text>
          ) : null}

          <Text
            numberOfLines={2}
            style={[
              styles.schedule,
              { color: live ? colors.red : colors.white },
            ]}
          >
            {schedule}
          </Text>
        </View>
      </Pressable>

      {program.description ? (
        <Text
          numberOfLines={3}
          style={[styles.description, { color: colors.muted }]}
        >
          {program.description}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onPrimaryAction}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor:
                live || reminderActive
                  ? colors.red
                  : colors.surfaceElevated,
              opacity: pressed ? 0.76 : 1,
            },
          ]}
        >
          {reminderActive && !live ? (
            <Ionicons color="#FEFEFE" name="notifications" size={13} />
          ) : null}
          <Text style={styles.actionText}>
            {primaryLabel(state, language, reminderActive)}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: colors.surfaceElevated,
              opacity: pressed ? 0.76 : 1,
            },
          ]}
        >
          <Text style={styles.actionText}>
            {language === 'en' ? 'VIEW DETAILS' : 'VER DETALLES'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    padding: 14,
  },
  top: {
    flexDirection: 'row',
    gap: 14,
  },
  artwork: {
    borderRadius: 14,
    height: 94,
    overflow: 'hidden',
    position: 'relative',
    width: 94,
  },
  artworkScrim: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(5,1,1,0.16)',
  },
  artworkGlow: {
    borderRadius: 999,
    height: 110,
    opacity: 0.28,
    position: 'absolute',
    right: -58,
    top: -34,
    width: 110,
  },
  fallbackCopy: {
    left: 10,
    position: 'absolute',
    right: 8,
    top: 31,
  },
  fallbackTitle: {
    color: '#FEFEFE',
    fontFamily: fonts.displayBlack,
    fontSize: 18,
    lineHeight: 17,
  },
  artworkTime: {
    bottom: 10,
    borderRadius: 5,
    left: 10,
    maxWidth: 76,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
  },
  artworkTimeText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 7,
  },
  meta: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statusText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 24,
    lineHeight: 25,
  },
  host: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    lineHeight: 15,
  },
  schedule: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  action: {
    alignItems: 'center',
    borderRadius: radii.round,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  actionText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
});
