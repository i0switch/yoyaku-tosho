import { generateSchedule } from './generateSchedule';
import { setHours, setMinutes, parseISO } from 'date-fns';
import { ScheduleConfig } from '../domain/types';

describe('generateSchedule', () => {
  const refDate = new Date('2026-03-14T10:00:00'); // 10:00:00
  
  const defaultConfig: ScheduleConfig = {
    startHour: 7,
    startMinute: 0,
    endHour: 22,
    endMinute: 0,
    intervalMinutes: 60,
  };

  it('should assign sequential hourly slots starting from next hour (default)', () => {
    const posts = [{ text: 'P1' }, { text: 'P2' }];
    const schedule = generateSchedule(posts, refDate, defaultConfig);
    
    expect(schedule[0].scheduledAt).toContain('11:00');
    expect(schedule[1].scheduledAt).toContain('12:00');
  });

  it('should work with custom 30-minute intervals', () => {
    const customConfig: ScheduleConfig = {
      startHour: 7,
      startMinute: 0,
      endHour: 22,
      endMinute: 0,
      intervalMinutes: 30,
    };
    const posts = [{ text: 'P1' }, { text: 'P2' }];
    const schedule = generateSchedule(posts, refDate, customConfig);
    
    expect(schedule[0].scheduledAt).toContain('10:30');
    expect(schedule[1].scheduledAt).toContain('11:00');
  });

  it('should respect precise minute boundaries (startMinute/endMinute)', () => {
    const preciseConfig: ScheduleConfig = {
      startHour: 10,
      startMinute: 45,
      endHour: 11,
      endMinute: 15,
      intervalMinutes: 30,
    };
    // ref is 10:00
    const posts = [{ text: 'P1' }, { text: 'P2' }];
    const schedule = generateSchedule(posts, refDate, preciseConfig);
    
    expect(schedule[0].scheduledAt).toContain('10:45');
    expect(schedule[1].scheduledAt).toContain('11:15');
    // A 3rd post would roll over to next day 10:45
  });

  it('should rollover to next day after endHour', () => {
    const lateRef = new Date('2026-03-14T23:00:00');
    const posts = [{ text: 'P1' }];
    const schedule = generateSchedule(posts, lateRef, defaultConfig);
    
    expect(schedule[0].scheduledAt).toContain('2026-03-15T07:00:00');
  });

  it('should rollover when today slots are exhausted', () => {
    const nightRef = new Date('2026-03-14T21:00:00');
    const posts = [{ text: 'P1' }, { text: 'P2' }];
    const schedule = generateSchedule(posts, nightRef, defaultConfig);
    
    expect(schedule[0].scheduledAt).toContain('22:00');
    expect(schedule[1].scheduledAt).toContain('2026-03-15T07:00:00');
  });

  it('should respect startDate if provided in config', () => {
    const configWithDate: ScheduleConfig = {
      startDate: '2026-04-01',
      startHour: 9,
      startMinute: 0,
      endHour: 18,
      endMinute: 0,
      intervalMinutes: 60,
    };
    const posts = [{ text: 'P1' }];
    const schedule = generateSchedule(posts, refDate, configWithDate);
    
    expect(schedule[0].scheduledAt).toBe('2026-04-01T09:00:00');
  });
});
