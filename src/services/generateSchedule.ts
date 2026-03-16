import {
  setHours,
  setMinutes,
  setSeconds,
  addDays,
  format,
  addMinutes,
  parseISO,
} from 'date-fns';
import { InputPost, ScheduledPost, ScheduleConfig } from '../domain/types';

const DEFAULT_CONFIG: ScheduleConfig = {
  startHour: 7,
  startMinute: 0,
  endHour: 22,
  endMinute: 0,
  intervalMinutes: 60,
};

/**
 * Generates a schedule for the given posts based on dynamic slots.
 */
export function generateSchedule(
  posts: InputPost[],
  referenceDate: Date = new Date(),
  config: Partial<ScheduleConfig> = DEFAULT_CONFIG,
): ScheduledPost[] {
  const finalConfig: ScheduleConfig = { ...DEFAULT_CONFIG, ...config };
  const scheduledPosts: ScheduledPost[] = [];
  let currentSlot = getNextAvailableSlot(referenceDate, finalConfig);

  posts.forEach((post, index) => {
    const scheduledAt = post.scheduledAt || format(currentSlot, "yyyy-MM-dd'T'HH:mm:ss");

    scheduledPosts.push({
      ...post,
      id: `post-${index}`,
      order: index,
      scheduledAt: scheduledAt,
    });

    if (!post.scheduledAt) {
      currentSlot = advanceSlot(currentSlot, finalConfig);
    }
  });

  return scheduledPosts;
}

function getNextAvailableSlot(ref: Date, config: ScheduleConfig): Date {
  let date = new Date(ref);

  if (config.startDate) {
    try {
      const parsedStart = parseISO(config.startDate);
      date.setFullYear(parsedStart.getFullYear());
      date.setMonth(parsedStart.getMonth());
      date.setDate(parsedStart.getDate());

      date = setHours(date, config.startHour);
      date = setMinutes(date, config.startMinute);
      date = setSeconds(date, 0);
      return date;
    } catch (e) {
      // Fallback to auto-scheduling
    }
  }

  date = setSeconds(date, 0);

  if (isBeforeWindow(date, config)) {
    return moveToStartOfWindow(date, config);
  }

  if (isAfterWindow(date, config)) {
    return moveToStartOfWindow(addDays(date, 1), config);
  }

  // Advance to the next interval boundary
  const nextSlot = snapToNextInterval(date, config.intervalMinutes);

  if (isAfterWindow(nextSlot, config)) {
    return moveToStartOfWindow(addDays(date, 1), config);
  }

  return nextSlot;
}

/**
 * Snaps the given date forward to the next interval boundary.
 * e.g. 10:00 with 30-min interval → 10:30; 10:00 with 60-min → 11:00
 */
function snapToNextInterval(date: Date, intervalMinutes: number): Date {
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const nextBoundary = Math.ceil((totalMinutes + 1) / intervalMinutes) * intervalMinutes;
  const h = Math.floor(nextBoundary / 60);
  const m = nextBoundary % 60;
  let result = setSeconds(setMinutes(setHours(new Date(date), h % 24), m), 0);
  if (h >= 24) {
    result = addDays(result, 1);
  }
  return result;
}

function advanceSlot(current: Date, config: ScheduleConfig): Date {
  const next = addMinutes(current, config.intervalMinutes);

  if (isAfterWindow(next, config) || isBeforeWindow(next, config)) {
    return moveToStartOfWindow(addDays(current, 1), config);
  }

  return next;
}

function isBeforeWindow(date: Date, config: ScheduleConfig): boolean {
  const h = date.getHours();
  const m = date.getMinutes();
  return h < config.startHour || (h === config.startHour && m < config.startMinute);
}

function isAfterWindow(date: Date, config: ScheduleConfig): boolean {
  const h = date.getHours();
  const m = date.getMinutes();
  return h > config.endHour || (h === config.endHour && m > config.endMinute);
}

function moveToStartOfWindow(date: Date, config: ScheduleConfig): Date {
  let d = new Date(date);
  d = setHours(d, config.startHour);
  d = setMinutes(d, config.startMinute);
  d = setSeconds(d, 0);
  return d;
}
