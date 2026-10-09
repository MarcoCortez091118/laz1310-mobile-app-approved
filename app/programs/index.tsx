import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { BottomNavigation } from '../../src/components/BottomNavigation';
import { ProgramFeedCard } from '../../src/components/ProgramFeedCard';
import {
  formatProgramTime,
  PROGRAM_WEEKDAYS_EN,
  PROGRAM_WEEKDAYS_ES,
  programScheduleLabel,
  weeklyProgramSlots,
} from '../../src/features/programs/presentation';
import {
  programAirtimeState,
  isProgramScheduledToday,
  nextProgramStart,
} from '../../src/features/programs/schedule';
import {
  listProgramReminders,
} from '../../src/features/programs/reminders';
import { usePrograms } from '../../src/features/programs/usePrograms';
import { useRadio } from '../../src/features/radio/useRadio';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

type Filter = 'all' | 'live' | 'today';

export default function ProgramsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const { play } = useRadio();
  const english = language === 'en';
  const { programs, loading, error, refresh } = usePrograms();
  const [filter, setFilter] = useState<Filter>('all');
  const [showWeekly, setShowWeekly] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [reminderIds, setReminderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const refreshReminders = useCallback(async () => {
    const reminders = await listProgramReminders();
    setReminderIds(new Set(reminders.map((item) => item.programId)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshReminders();
    }, [refreshReminders]),
  );

  const visiblePrograms = useMemo(() => {
    const filtered = programs.filter((program) => {
      const state = programAirtimeState(program, now);
      if (filter === 'live') return state === 'live';
      if (filter === 'today') return isProgramScheduledToday(program, now);
      return true;
    });

    return filtered.slice().sort((left, right) => {
      const rank = { live: 0, upcoming: 1, off_air: 2 } as const;
      const stateDiff =
        rank[programAirtimeState(left, now)] -
        rank[programAirtimeState(right, now)];
      if (stateDiff !== 0) return stateDiff;

      const leftStart = nextProgramStart(left, now)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightStart = nextProgramStart(right, now)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (leftStart !== rightStart) return leftStart - rightStart;

      return left.name.localeCompare(right.name, language);
    });
  }, [filter, language, now, programs]);

  const schedule = useMemo(
    () => weeklyProgramSlots(programs),
    [programs],
  );
  const weekdays = english ? PROGRAM_WEEKDAYS_EN : PROGRAM_WEEKDAYS_ES;

  const openProgram = (programId: string, reminder = false) => {
    const suffix = reminder ? '?reminder=1' : '';
    router.push(`/programs/${programId}${suffix}` as Href);
  };

  const listenLive = () => {
    play();
    router.push('/radio');
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safe}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading && programs.length > 0}
            onRefresh={() => void refresh()}
            tintColor={colors.red}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.red }]}>
          {english ? 'LA Z 1310 · SCHEDULE' : 'LA Z 1310 · PROGRAMACIÓN'}
        </Text>
        <Text style={[styles.title, { color: colors.white }]}>
          {english ? 'Programs' : 'Programas'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {english
            ? 'Shows, voices and schedules published by LA Z 1310.'
            : 'Shows, voces y horarios publicados por LA Z 1310.'}
        </Text>

        <View style={styles.filters}>
          {([
            ['all', english ? 'ALL' : 'TODO'],
            ['live', english ? 'LIVE' : 'EN VIVO'],
            ['today', english ? 'TODAY' : 'HOY'],
          ] as const).map(([value, label]) => {
            const active = filter === value;
            return (
              <Pressable
                accessibilityRole="button"
                key={value}
                onPress={() => setFilter(value)}
                style={({ pressed }) => [
                  styles.filter,
                  {
                    backgroundColor: active
                      ? colors.red
                      : colors.surfaceElevated,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? '#FEFEFE' : colors.muted },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading && !programs.length ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} size="large" />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              {english ? 'Loading programs…' : 'Cargando programación…'}
            </Text>
          </View>
        ) : error && !programs.length ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              color={colors.red}
              name="alert-circle-outline"
              size={26}
            />
            <Text style={[styles.errorTitle, { color: colors.white }]}>
              {english
                ? 'We could not load programs'
                : 'No pudimos cargar los programas'}
            </Text>
            <Text style={[styles.stateText, { color: colors.muted }]}>
              {error}
            </Text>
            <Pressable
              onPress={() => void refresh()}
              style={[styles.retry, { backgroundColor: colors.red }]}
            >
              <Text style={styles.retryText}>
                {english ? 'RETRY' : 'REINTENTAR'}
              </Text>
            </Pressable>
          </View>
        ) : programs.length ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                {english ? 'Now & upcoming' : 'Ahora y próximos'}
              </Text>
              <Text style={[styles.count, { color: colors.red }]}>
                {visiblePrograms.length}
              </Text>
            </View>

            {visiblePrograms.length ? (
              <View style={styles.programList}>
                {visiblePrograms.map((program) => {
                  const state = programAirtimeState(program, now);
                  return (
                    <ProgramFeedCard
                      key={`${program.stationId}:${program.id}`}
                      language={language}
                      onOpen={() => openProgram(program.id)}
                      onPrimaryAction={
                        state === 'live'
                          ? listenLive
                          : () => openProgram(program.id, true)
                      }
                      program={program}
                      reminderActive={reminderIds.has(program.id)}
                      schedule={programScheduleLabel(program, language)}
                      state={state}
                    />
                  );
                })}
              </View>
            ) : (
              <View
                style={[
                  styles.emptyFilter,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  color={colors.gray}
                  name="calendar-outline"
                  size={24}
                />
                <Text style={[styles.stateText, { color: colors.muted }]}>
                  {filter === 'live'
                    ? english
                      ? 'No program is live right now.'
                      : 'No hay un programa en vivo en este momento.'
                    : english
                      ? 'No programs match this filter.'
                      : 'No hay programas para este filtro.'}
                </Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowWeekly((current) => !current)}
              style={({ pressed }) => [
                styles.weekToggle,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.weekToggleText, { color: colors.red }]}>
                {showWeekly
                  ? english
                    ? 'HIDE WEEKLY SCHEDULE ↑'
                    : 'OCULTAR HORARIO SEMANAL ↑'
                  : english
                    ? 'VIEW WEEKLY SCHEDULE →'
                    : 'VER HORARIO SEMANAL →'}
              </Text>
            </Pressable>

            {showWeekly ? (
              <View style={styles.week}>
                {schedule.map((slots, weekday) => {
                  const dayName =
                    weekdays[weekday] ??
                    (english ? `Day ${weekday + 1}` : `Día ${weekday + 1}`);
                  return (
                    <View
                      key={dayName}
                      style={[
                        styles.dayCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.dayName, { color: colors.white }]}>
                        {dayName}
                      </Text>
                      {slots.length ? (
                        <View style={styles.daySlots}>
                          {slots.map((slot) => (
                            <Pressable
                              accessibilityRole="button"
                              key={`${slot.program.stationId}:${slot.id}`}
                              onPress={() => openProgram(slot.program.id)}
                              style={styles.slot}
                            >
                              <View
                                style={[
                                  styles.slotRail,
                                  { backgroundColor: colors.red },
                                ]}
                              />
                              <View style={styles.slotCopy}>
                                <Text
                                  style={[
                                    styles.slotTime,
                                    { color: colors.red },
                                  ]}
                                >
                                  {formatProgramTime(slot.startsAt)} –{' '}
                                  {formatProgramTime(slot.endsAt)}
                                </Text>
                                <Text
                                  style={[
                                    styles.slotTitle,
                                    { color: colors.white },
                                  ]}
                                >
                                  {slot.program.name}
                                </Text>
                                {slot.program.hostName ? (
                                  <Text
                                    style={[
                                      styles.slotHost,
                                      { color: colors.muted },
                                    ]}
                                  >
                                    {slot.program.hostName}
                                  </Text>
                                ) : null}
                              </View>
                            </Pressable>
                          ))}
                        </View>
                      ) : (
                        <Text
                          style={[styles.emptyDay, { color: colors.gray }]}
                        >
                          {english
                            ? 'No published programming'
                            : 'Sin programación publicada'}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.state}>
            <Ionicons color={colors.gray} name="mic-outline" size={34} />
            <Text style={[styles.errorTitle, { color: colors.white }]}>
              {english
                ? 'No programs have been published yet'
                : 'Aún no hay programas publicados'}
            </Text>
            <Text style={[styles.stateText, { color: colors.muted }]}>
              {english
                ? 'Programs published from WebAdmin will appear here automatically.'
                : 'Cuando el equipo publique Programs desde WebAdmin aparecerán aquí automáticamente.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingBottom: 150,
    paddingHorizontal: spacing.md,
    paddingTop: 26,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 42,
    lineHeight: 46,
    marginTop: 14,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 340,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  filter: {
    borderRadius: radii.round,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  filterText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 27,
  },
  count: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  programList: {
    gap: spacing.md,
  },
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 260,
    paddingHorizontal: spacing.lg,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  errorCard: {
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  errorTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 21,
    textAlign: 'center',
  },
  retry: {
    borderRadius: 10,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  emptyFilter: {
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 120,
    padding: spacing.lg,
  },
  weekToggle: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.lg,
  },
  weekToggleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  week: {
    gap: spacing.sm,
  },
  dayCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  dayName: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  daySlots: {
    gap: spacing.sm,
  },
  slot: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotRail: {
    borderRadius: 99,
    width: 3,
  },
  slotCopy: {
    flex: 1,
    paddingVertical: 2,
  },
  slotTime: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
  },
  slotTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    marginTop: 2,
  },
  slotHost: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
  emptyDay: {
    fontFamily: fonts.body,
    fontSize: 10,
  },
});
