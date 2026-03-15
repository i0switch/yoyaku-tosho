import {
  addHours,
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
      // Fallback
    }
  }

  date = setMinutes(date, date.getMinutes() + (config.intervalMinutes > 60 ? 0 : 1));
  date = setSeconds(date, 0);

  if (isBeforeWindow(date, config)) {
    return moveToStartOfWindow(date, config);
  }

  if (isAfterWindow(date, config)) {
    return moveToStartOfWindow(addDays(date, 1), config);
  }

  // Find next slot within today
  let nextSlot = addMinutes(date, config.intervalMinutes);
  if (config.intervalMinutes >= 60) {
    nextSlot = setMinutes(nextSlot, 0); 
  }

  if (isAfterWindow(nextSlot, config) || (isBeforeWindow(nextSlot, config) && nextSlot.getDate() === date.getDate())) {
    return moveToStartOfWindow(addDays(date, 1), config);
  }
  
  return nextSlot;
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
