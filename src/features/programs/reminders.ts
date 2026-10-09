import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { AppLanguage } from '../../i18n/LanguageProvider';
import type { PublishedProgram } from './api';
import { upcomingProgramOccurrences } from './schedule';
import {
  PROGRAM_REMINDER_MARKER,
  PUSH_CHANNEL_ID,
  ensureSystemNotificationChannel,
} from '../notifications/system';

export type ProgramReminderTiming = 'ten_minutes_before' | 'at_start';

export interface ProgramReminderPreference {
  programId: string;
  timing: ProgramReminderTiming;
  language: AppLanguage;
}

interface StoredProgramReminder extends ProgramReminderPreference {
  notificationIds: string[];
}

type ReminderStore = Record<string, StoredProgramReminder>;

const STORAGE_KEY = 'laz1310.program-reminders.v1';
const HORIZON_DAYS = 14;
const MAX_OCCURRENCES_PER_PROGRAM = 10;

async function readStore(): Promise<ReminderStore> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as ReminderStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(store: ReminderStore) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

async function cancelNotificationIds(ids: string[]) {
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined),
    ),
  );
}

function reminderLeadMinutes(timing: ProgramReminderTiming) {
  return timing === 'ten_minutes_before' ? 10 : 0;
}

function reminderCopy(
  program: PublishedProgram,
  timing: ProgramReminderTiming,
  language: AppLanguage,
) {
  if (language === 'en') {
    return timing === 'ten_minutes_before'
      ? {
          title: `${program.name} starts in 10 minutes`,
          body: `Coming up on ${program.stationName}. Tap to open the program.`,
        }
      : {
          title: `${program.name} is live`,
          body: `It's starting now on ${program.stationName}. Listen live.`,
        };
  }

  return timing === 'ten_minutes_before'
    ? {
        title: `${program.name} comienza en 10 minutos`,
        body: `Enseguida en ${program.stationName}. Toca para abrir el programa.`,
      }
    : {
        title: `${program.name} está en vivo`,
        body: `Está comenzando ahora en ${program.stationName}. Escúchalo en vivo.`,
      };
}

async function scheduleProgramReminder(
  program: PublishedProgram,
  preference: ProgramReminderPreference,
) {
  if (Platform.OS === 'web') return [];

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== Notifications.PermissionStatus.GRANTED) {
    throw new Error('Notification permission is required for program reminders');
  }

  await ensureSystemNotificationChannel();

  const leadMs = reminderLeadMinutes(preference.timing) * 60_000;
  const now = Date.now();
  const occurrences = upcomingProgramOccurrences(program, {
    horizonDays: HORIZON_DAYS,
  })
    .map((occurrence) => ({
      ...occurrence,
      fireAt: new Date(occurrence.startsAt.getTime() - leadMs),
    }))
    .filter((occurrence) => occurrence.fireAt.getTime() > now + 5_000)
    .slice(0, MAX_OCCURRENCES_PER_PROGRAM);

  const copy = reminderCopy(
    program,
    preference.timing,
    preference.language,
  );
  const notificationIds: string[] = [];

  for (const occurrence of occurrences) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: copy.title,
        body: copy.body,
        sound: true,
        data: {
          [PROGRAM_REMINDER_MARKER]: '1',
          targetValue: `/programs/${program.id}`,
          programId: program.id,
          startsAt: occurrence.startsAt.toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: occurrence.fireAt,
        ...(Platform.OS === 'android' ? { channelId: PUSH_CHANNEL_ID } : {}),
      },
    });
    notificationIds.push(id);
  }

  return notificationIds;
}

export async function listProgramReminders(): Promise<
  ProgramReminderPreference[]
> {
  const store = await readStore();
  return Object.values(store).map(({ notificationIds: _ids, ...preference }) => preference);
}

export async function getProgramReminder(
  programId: string,
): Promise<ProgramReminderPreference | null> {
  const store = await readStore();
  const item = store[programId];
  if (!item) return null;

  const { notificationIds: _ids, ...preference } = item;
  return preference;
}

export async function saveProgramReminder(
  program: PublishedProgram,
  timing: ProgramReminderTiming,
  language: AppLanguage,
): Promise<ProgramReminderPreference> {
  const store = await readStore();
  const current = store[program.id];

  const preference: ProgramReminderPreference = {
    programId: program.id,
    timing,
    language,
  };

  const nextIds = await scheduleProgramReminder(program, preference);
  if (current) await cancelNotificationIds(current.notificationIds);

  store[program.id] = {
    ...preference,
    notificationIds: nextIds,
  };
  await writeStore(store);

  return preference;
}

export async function removeProgramReminder(programId: string) {
  const store = await readStore();
  const current = store[programId];
  if (!current) return;

  await cancelNotificationIds(current.notificationIds);
  delete store[programId];
  await writeStore(store);
}

export async function pauseProgramReminders() {
  const store = await readStore();

  await Promise.all(
    Object.values(store).map((reminder) =>
      cancelNotificationIds(reminder.notificationIds),
    ),
  );

  const paused = Object.fromEntries(
    Object.entries(store).map(([id, reminder]) => [
      id,
      { ...reminder, notificationIds: [] },
    ]),
  );
  await writeStore(paused);
}

export async function syncSavedProgramReminders(
  programs: PublishedProgram[],
) {
  if (Platform.OS === 'web') return;

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== Notifications.PermissionStatus.GRANTED) {
    await pauseProgramReminders();
    return;
  }

  const store = await readStore();
  const byId = new Map(programs.map((program) => [program.id, program]));

  for (const [programId, reminder] of Object.entries(store)) {
    await cancelNotificationIds(reminder.notificationIds);

    const program = byId.get(programId);
    if (!program) {
      store[programId] = { ...reminder, notificationIds: [] };
      continue;
    }

    const notificationIds = await scheduleProgramReminder(program, reminder);
    store[programId] = {
      ...reminder,
      notificationIds,
    };
  }

  await writeStore(store);
}
