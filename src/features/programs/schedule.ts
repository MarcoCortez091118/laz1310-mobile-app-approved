import type { PublishedProgram, PublishedScheduleEntry } from './api';

export type ProgramAirtimeState = 'live' | 'upcoming' | 'off_air';

export interface ProgramOccurrence {
  entry: PublishedScheduleEntry;
  startsAt: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
}

function formatter(timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    calendar: 'gregory',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

function zonedParts(value: Date, timezone: string): ZonedParts {
  const parts = formatter(timezone).formatToParts(value);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    weekday: WEEKDAY_INDEX[read('weekday')] ?? 0,
    hour: Number(read('hour')),
    minute: Number(read('minute')),
  };
}

function parseClock(value: string) {
  const [hour = '0', minute = '0'] = value.split(':');
  return {
    hour: Number(hour),
    minute: Number(minute),
  };
}

function minutesSinceMidnight(value: string) {
  const parsed = parseClock(value);
  return parsed.hour * 60 + parsed.minute;
}

function calendarDateFromOffset(parts: ZonedParts, offsetDays: number) {
  const value = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + offsetDays),
  );

  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
    weekday: (value.getUTCDay() + 6) % 7,
  };
}

/**
 * Converts a wall-clock time in an IANA timezone to its UTC instant.
 *
 * Intl gives us the timezone-aware wall-clock representation of any UTC
 * instant. Iterating the difference converges on the desired instant while
 * respecting DST without hardcoded offsets.
 */
export function zonedDateTimeToUtc(input: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timezone: string;
}) {
  const targetPseudoUtc = Date.UTC(
    input.year,
    input.month - 1,
    input.day,
    input.hour,
    input.minute,
  );
  let candidate = targetPseudoUtc;

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const resolved = zonedParts(new Date(candidate), input.timezone);
    const resolvedPseudoUtc = Date.UTC(
      resolved.year,
      resolved.month - 1,
      resolved.day,
      resolved.hour,
      resolved.minute,
    );
    const delta = targetPseudoUtc - resolvedPseudoUtc;

    candidate += delta;
    if (Math.abs(delta) < 60_000) break;
  }

  return new Date(candidate);
}

function entryIsLive(
  entry: PublishedScheduleEntry,
  nowParts: ZonedParts,
): boolean {
  const currentMinutes = nowParts.hour * 60 + nowParts.minute;
  const starts = minutesSinceMidnight(entry.startsAt);
  const ends = minutesSinceMidnight(entry.endsAt);

  if (ends > starts) {
    return (
      entry.weekday === nowParts.weekday &&
      currentMinutes >= starts &&
      currentMinutes < ends
    );
  }

  const previousWeekday = (nowParts.weekday + 6) % 7;
  return (
    (entry.weekday === nowParts.weekday && currentMinutes >= starts) ||
    (entry.weekday === previousWeekday && currentMinutes < ends)
  );
}

export function isProgramLive(
  program: PublishedProgram,
  now = new Date(),
): boolean {
  const parts = zonedParts(now, program.timezone);
  return program.schedule.some((entry) => entryIsLive(entry, parts));
}

export function isProgramScheduledToday(
  program: PublishedProgram,
  now = new Date(),
): boolean {
  const parts = zonedParts(now, program.timezone);
  return program.schedule.some((entry) => entry.weekday === parts.weekday);
}

export function upcomingProgramOccurrences(
  program: PublishedProgram,
  input?: {
    now?: Date;
    horizonDays?: number;
  },
): ProgramOccurrence[] {
  const now = input?.now ?? new Date();
  const horizonDays = Math.max(1, input?.horizonDays ?? 8);
  const current = zonedParts(now, program.timezone);
  const occurrences: ProgramOccurrence[] = [];

  for (let offset = 0; offset < horizonDays; offset += 1) {
    const calendar = calendarDateFromOffset(current, offset);

    program.schedule
      .filter((entry) => entry.weekday === calendar.weekday)
      .forEach((entry) => {
        const clock = parseClock(entry.startsAt);
        const startsAt = zonedDateTimeToUtc({
          year: calendar.year,
          month: calendar.month,
          day: calendar.day,
          hour: clock.hour,
          minute: clock.minute,
          timezone: program.timezone,
        });

        if (startsAt.getTime() > now.getTime()) {
          occurrences.push({ entry, startsAt });
        }
      });
  }

  return occurrences.sort(
    (left, right) => left.startsAt.getTime() - right.startsAt.getTime(),
  );
}

export function programAirtimeState(
  program: PublishedProgram,
  now = new Date(),
): ProgramAirtimeState {
  if (isProgramLive(program, now)) return 'live';

  const parts = zonedParts(now, program.timezone);
  const currentMinutes = parts.hour * 60 + parts.minute;
  const laterToday = program.schedule.some(
    (entry) =>
      entry.weekday === parts.weekday &&
      minutesSinceMidnight(entry.startsAt) > currentMinutes,
  );

  return laterToday ? 'upcoming' : 'off_air';
}

export function nextProgramStart(
  program: PublishedProgram,
  now = new Date(),
): Date | null {
  return upcomingProgramOccurrences(program, {
    now,
    horizonDays: 8,
  })[0]?.startsAt ?? null;
}
