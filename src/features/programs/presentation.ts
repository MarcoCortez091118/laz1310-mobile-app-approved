import type { AppLanguage } from '../../i18n/LanguageProvider';
import type { PublishedProgram, PublishedScheduleEntry } from './api';

export const PROGRAM_WEEKDAYS_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export const PROGRAM_WEEKDAYS_EN = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const SHORT_WEEKDAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
const SHORT_WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function formatProgramTime(value: string): string {
  const [rawHour = '0', rawMinute = '00'] = value.split(':');
  const hour = Number(rawHour);
  const minute = rawMinute.padStart(2, '0').slice(0, 2);
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function shortWeekday(day: number, language: AppLanguage): string {
  const values = language === 'en' ? SHORT_WEEKDAYS_EN : SHORT_WEEKDAYS_ES;
  return values[day] ?? (language === 'en' ? `Day ${day + 1}` : `Día ${day + 1}`);
}

function dayRanges(days: number[], language: AppLanguage): string {
  const unique = [...new Set(days)].sort((left, right) => left - right);
  const ranges: Array<[number, number]> = [];

  unique.forEach((day) => {
    const last = ranges[ranges.length - 1];
    if (last && day === last[1] + 1) {
      last[1] = day;
    } else {
      ranges.push([day, day]);
    }
  });

  return ranges
    .map(([start, end]) =>
      start === end
        ? shortWeekday(start, language)
        : `${shortWeekday(start, language)} – ${shortWeekday(end, language)}`,
    )
    .join(', ');
}

export function programScheduleLines(
  schedule: PublishedScheduleEntry[],
  language: AppLanguage = 'es',
): string[] {
  const groups = new Map<string, PublishedScheduleEntry[]>();

  schedule.forEach((entry) => {
    const key = `${entry.startsAt}|${entry.endsAt}`;
    const current = groups.get(key) ?? [];
    current.push(entry);
    groups.set(key, current);
  });

  return [...groups.values()]
    .sort((left, right) => {
      const leftDay = Math.min(...left.map((entry) => entry.weekday));
      const rightDay = Math.min(...right.map((entry) => entry.weekday));
      if (leftDay !== rightDay) return leftDay - rightDay;
      const leftFirst = left[0];
      const rightFirst = right[0];
      if (!leftFirst || !rightFirst) return 0;
      return leftFirst.startsAt.localeCompare(rightFirst.startsAt);
    })
    .flatMap((entries) => {
      const first = entries[0];
      if (!first) return [];
      return [
        `${dayRanges(entries.map((entry) => entry.weekday), language)} · ${formatProgramTime(first.startsAt)} – ${formatProgramTime(first.endsAt)}`,
      ];
    });
}

export function programScheduleLabel(
  program: PublishedProgram,
  language: AppLanguage = 'es',
): string {
  const lines = programScheduleLines(program.schedule, language);
  const fallback = language === 'en' ? 'Schedule TBD' : 'Horario por definir';
  if (!lines.length) return fallback;
  const first = lines[0] ?? fallback;
  if (lines.length === 1) return first;
  return `${first} · +${lines.length - 1}`;
}

export interface WeeklyProgramSlot {
  id: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  program: PublishedProgram;
}

export function weeklyProgramSlots(programs: PublishedProgram[]): WeeklyProgramSlot[][] {
  const days = PROGRAM_WEEKDAYS_ES.map(() => [] as WeeklyProgramSlot[]);

  programs.forEach((program) => {
    program.schedule.forEach((entry) => {
      if (entry.weekday < 0 || entry.weekday > 6) return;
      const day = days[entry.weekday];
      if (!day) return;
      day.push({
        id: entry.id,
        weekday: entry.weekday,
        startsAt: entry.startsAt,
        endsAt: entry.endsAt,
        program,
      });
    });
  });

  days.forEach((slots) =>
    slots.sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
  );

  return days;
}
