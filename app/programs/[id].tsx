import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { getFirebaseSecurityTokens } from '../../src/features/auth/firebase';
import {
  getNotificationPreferences,
  patchNotificationPreferences,
} from '../../src/features/notifications/api';
import { usePushNotifications } from '../../src/features/notifications/PushNotificationsProvider';
import {
  getProgramReminder,
  removeProgramReminder,
  saveProgramReminder,
  type ProgramReminderPreference,
  type ProgramReminderTiming,
} from '../../src/features/programs/reminders';
import {
  programScheduleLines,
} from '../../src/features/programs/presentation';
import { isProgramLive } from '../../src/features/programs/schedule';
import { usePrograms } from '../../src/features/programs/usePrograms';
import { useRadio } from '../../src/features/radio/useRadio';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

export default function ProgramDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; reminder?: string }>();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const { programs, loading, error } = usePrograms();
  const { play } = useRadio();
  const push = usePushNotifications();
  const program = useMemo(
    () => programs.find((item) => item.id === params.id) ?? null,
    [params.id, programs],
  );
  const [reminderOpen, setReminderOpen] = useState(params.reminder === '1');
  const [timing, setTiming] = useState<ProgramReminderTiming>('at_start');
  const [reminder, setReminder] = useState<ProgramReminderPreference | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    void getProgramReminder(params.id).then((current) => {
      setReminder(current);
      if (current) setTiming(current.timing);
    });
  }, [params.id]);

  const live = program ? isProgramLive(program) : false;
  const scheduleLines = program
    ? programScheduleLines(program.schedule, language)
    : [];

  const listenLive = () => {
    play();
    router.push('/radio');
  };

  const saveReminder = async () => {
    if (!program) return;
    setSaving(true);
    setActionError(null);
    try {
      if (!push.enabled) await push.enable();

      const tokens = await getFirebaseSecurityTokens(true);
      const preferences = await getNotificationPreferences(tokens);
      if (!preferences.programs) {
        await patchNotificationPreferences(tokens, { programs: true });
      }

      const saved = await saveProgramReminder(program, timing, language);
      setReminder(saved);
      setReminderOpen(false);
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : english
            ? 'We could not save this reminder.'
            : 'No pudimos guardar este recordatorio.',
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteReminder = async () => {
    if (!program) return;
    setSaving(true);
    setActionError(null);
    try {
      await removeProgramReminder(program.id);
      setReminder(null);
      setReminderOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !program) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Ionicons color={colors.gray} name="alert-circle-outline" size={30} />
          <Text style={[styles.errorTitle, { color: colors.white }]}>
            {english ? 'Program not available' : 'Programa no disponible'}
          </Text>
          {error ? (
            <Text style={[styles.body, { color: colors.muted }]}>{error}</Text>
          ) : null}
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.link, { color: colors.red }]}>
              {english ? 'GO BACK' : 'REGRESAR'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safe}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={[styles.back, { backgroundColor: colors.surfaceElevated }]}
          >
            <Ionicons color={colors.white} name="chevron-back" size={18} />
          </Pressable>
          <View>
            <Text style={[styles.eyebrow, { color: colors.red }]}>
              {english ? 'PROGRAM' : 'PROGRAMA'}
            </Text>
            <Text style={[styles.station, { color: colors.white }]}>
              {program.stationName}
            </Text>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.burgundy }]}>
          {program.imageUrl ? (
            <>
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="cover"
                source={{ uri: program.imageUrl }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroScrim} />
            </>
          ) : (
            <View
              style={[styles.heroGlow, { backgroundColor: colors.red }]}
            />
          )}

          {!program.imageUrl ? (
            <Text style={styles.heroFallback}>
              {program.name.toUpperCase()}
            </Text>
          ) : null}

          <View style={[styles.heroStatus, { backgroundColor: colors.red }]}>
            <Text style={styles.heroStatusText}>
              {live
                ? english
                  ? 'LIVE'
                  : 'EN VIVO'
                : english
                  ? 'PROGRAM'
                  : 'PROGRAMA'}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.white }]}>
          {program.name}
        </Text>
        {program.hostName ? (
          <Text style={[styles.host, { color: colors.muted }]}>
            {english
              ? `With ${program.hostName} · ${program.stationName}`
              : `Con ${program.hostName} · ${program.stationName}`}
          </Text>
        ) : null}
        <Text style={[styles.scheduleLead, { color: colors.red }]}>
          {scheduleLines[0] ??
            (english ? 'Schedule TBD' : 'Horario por definir')}
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={listenLive}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.red, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>
              {english ? 'LISTEN LIVE' : 'ESCUCHAR EN VIVO'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setReminderOpen(true)}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: colors.surfaceElevated,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              color={colors.white}
              name={reminder ? 'notifications' : 'notifications-outline'}
              size={14}
            />
            <Text style={styles.buttonText}>
              {reminder
                ? english
                  ? 'REMINDER ✓'
                  : 'RECORDATORIO ✓'
                : english
                  ? 'REMIND ME'
                  : 'RECORDARME'}
            </Text>
          </Pressable>
        </View>

        {program.description ? (
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.surfaceElevated,
              },
            ]}
          >
            <Text style={[styles.infoTitle, { color: colors.white }]}>
              {english ? 'About the program' : 'Sobre el programa'}
            </Text>
            <Text style={[styles.infoBody, { color: colors.muted }]}>
              {program.description}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surfaceElevated,
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.white }]}>
            {english ? 'Weekly schedule' : 'Horario semanal'}
          </Text>
          {scheduleLines.map((line) => (
            <Text
              key={line}
              style={[styles.infoBody, { color: colors.muted }]}
            >
              {line}
            </Text>
          ))}
          <Text style={[styles.timezone, { color: colors.gray }]}>
            {program.timezone}
          </Text>
        </View>
      </ScrollView>

      <BottomNavigation />

      <Modal
        animationType="slide"
        onRequestClose={() => setReminderOpen(false)}
        transparent
        visible={reminderOpen}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel={english ? 'Close reminder' : 'Cerrar recordatorio'}
            onPress={() => setReminderOpen(false)}
            style={styles.scrim}
          />
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.gray }]} />
            <Text style={[styles.sheetTitle, { color: colors.white }]}>
              {english ? 'Program reminder' : 'Recordatorio del programa'}
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>
              {program.name}
            </Text>

            {([
              ['ten_minutes_before', english ? '10 minutes before' : '10 minutos antes'],
              ['at_start', english ? 'At start' : 'Al comenzar'],
            ] as const).map(([value, label]) => {
              const selected = timing === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={value}
                  onPress={() => setTiming(value)}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected
                        ? colors.surfaceElevated
                        : colors.black,
                      borderColor: selected ? colors.red : colors.surfaceElevated,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.radioDot,
                      {
                        backgroundColor: selected ? colors.red : colors.black,
                        borderColor: selected ? colors.red : colors.gray,
                      },
                    ]}
                  />
                  <Text style={[styles.optionText, { color: colors.white }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            <Text style={[styles.sheetNote, { color: colors.muted }]}>
              {english
                ? 'The reminder is scheduled from the station timezone and delivered at the correct instant for your device timezone.'
                : 'El recordatorio se programa desde la zona horaria de la estación y se entrega en el instante correcto para la zona horaria de tu dispositivo.'}
            </Text>

            {actionError ? (
              <Text style={[styles.actionError, { color: colors.red }]}>
                {actionError}
              </Text>
            ) : null}

            <Pressable
              disabled={saving}
              onPress={() => void saveReminder()}
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.red,
                  opacity: saving ? 0.55 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FEFEFE" size="small" />
              ) : (
                <Text style={styles.saveText}>
                  {english ? 'SAVE REMINDER' : 'GUARDAR RECORDATORIO'}
                </Text>
              )}
            </Pressable>

            {reminder ? (
              <Pressable
                disabled={saving}
                onPress={() => void deleteReminder()}
                style={styles.deleteReminder}
              >
                <Text style={[styles.deleteReminderText, { color: colors.muted }]}>
                  {english ? 'Remove reminder' : 'Eliminar recordatorio'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    gap: 11,
    paddingBottom: 150,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  back: {
    alignItems: 'center',
    borderRadius: radii.round,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
  },
  station: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 20,
  },
  hero: {
    aspectRatio: 1,
    borderRadius: 22,
    marginTop: 4,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  heroScrim: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(5,1,1,0.18)',
  },
  heroGlow: {
    borderRadius: 999,
    height: 230,
    opacity: 0.55,
    position: 'absolute',
    right: -70,
    top: -72,
    width: 230,
  },
  heroFallback: {
    color: '#FEFEFE',
    fontFamily: fonts.displayBlack,
    fontSize: 36,
    left: 18,
    lineHeight: 34,
    maxWidth: 240,
    position: 'absolute',
    top: 54,
  },
  heroStatus: {
    bottom: 14,
    borderRadius: 5,
    left: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
  },
  heroStatusText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 34,
    lineHeight: 35,
    marginTop: 4,
  },
  host: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  scheduleLead: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  primaryButton: {
    borderRadius: radii.round,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: radii.round,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  buttonText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  infoCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 7,
    marginTop: 2,
    padding: 14,
  },
  infoTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  infoBody: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
  },
  timezone: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    marginTop: 2,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 11,
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(5,1,1,0.72)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    borderRadius: 999,
    height: 4,
    width: 42,
  },
  sheetTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 27,
    lineHeight: 30,
    marginTop: 2,
  },
  sheetSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  option: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  radioDot: {
    borderRadius: 99,
    borderWidth: 1,
    height: 16,
    width: 16,
  },
  optionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  sheetNote: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
  },
  actionError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    lineHeight: 14,
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: radii.round,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  saveText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  deleteReminder: {
    alignSelf: 'center',
    padding: spacing.xs,
  },
  deleteReminderText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
});
