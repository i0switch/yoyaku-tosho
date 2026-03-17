import { generateSchedule } from './generateSchedule';
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

  it('should preserve manually set scheduledAt and not advance slot', () => {
    const posts = [
      { text: 'P1', scheduledAt: '2026-05-01T12:00:00' },
      { text: 'P2' },
    ];
    const schedule = generateSchedule(posts, refDate, defaultConfig);

    expect(schedule[0].scheduledAt).toBe('2026-05-01T12:00:00');
    // P2 should use the first auto slot (not advance past P1's manual time)
    expect(schedule[1].scheduledAt).toContain('11:00');
  });

  it('should assign correct ids and order', () => {
    const posts = [{ text: 'A' }, { text: 'B' }];
    const schedule = generateSchedule(posts, refDate, defaultConfig);

    expect(schedule[0].id).toBe('post-0');
    expect(schedule[1].id).toBe('post-1');
    expect(schedule[0].order).toBe(0);
    expect(schedule[1].order).toBe(1);
  });

  it('should span multiple days for many posts', () => {
    const posts = Array.from({ length: 20 }, (_, i) => ({ text: `Post ${i}` }));
    const schedule = generateSchedule(posts, refDate, defaultConfig);

    const dates = schedule.map((p) => p.scheduledAt.substring(0, 10));
    const uniqueDates = [...new Set(dates)];
    expect(uniqueDates.length).toBeGreaterThan(1);
  });

  it('should return empty array for empty posts', () => {
    const schedule = generateSchedule([], refDate, defaultConfig);
    expect(schedule).toHaveLength(0);
  });

  // TC-GS-01: interval=1分で2投稿間の差が1分
  it('TC-GS-01: interval=1分 → P1とP2の差が1分', () => {
    const config1min: ScheduleConfig = { ...defaultConfig, intervalMinutes: 1 };
    const posts = [{ text: 'P1' }, { text: 'P2' }];
    const schedule = generateSchedule(posts, refDate, config1min);
    const t1 = new Date(schedule[0].scheduledAt).getTime();
    const t2 = new Date(schedule[1].scheduledAt).getTime();
    expect(t2 - t1).toBe(60 * 1000);
  });

  // TC-GS-02: startDate='not-a-date' → parseISO が Invalid Date を返し format() が RangeError をスロー
  // [BUG-03] known failure: try-catch が不完全で format() まで Invalid Date が伝播する
  it('TC-GS-02: startDate=not-a-date → RangeError がスローされる', () => {
    const config: ScheduleConfig = { ...defaultConfig, startDate: 'not-a-date' };
    // 現在の実装では Invalid Date が format() に渡り RangeError になる (既知の不具合)
    expect(() => generateSchedule([{ text: 'P1' }], refDate, config)).toThrow(RangeError);
  });

  // TC-GS-03: startDate='' → 例外なし
  it('TC-GS-03: startDate=空文字 → 例外なし', () => {
    const config: ScheduleConfig = { ...defaultConfig, startDate: '' };
    expect(() => generateSchedule([{ text: 'P1' }], refDate, config)).not.toThrow();
  });

  // TC-GS-04: startHour>endHour の逆転設定 → 例外なし
  // [BUG-02] known failure: startHour>endHourの逆転でスケジューリングが期待通りでない
  it('TC-GS-04: startHour>endHour 逆転設定 → 例外なし', () => {
    const invertedConfig: ScheduleConfig = {
      startHour: 22, startMinute: 0,
      endHour: 7, endMinute: 0,
      intervalMinutes: 60,
    };
    expect(() => generateSchedule([{ text: 'P1' }], refDate, invertedConfig)).not.toThrow();
  });

  // TC-GS-05: ref=22:00 → 次スロット(23:00)が範囲外のため翌日07:00へロールオーバー
  it('TC-GS-05: ref=22:00 → 翌日07:00へロールオーバー', () => {
    const ref = new Date('2026-03-14T22:00:00');
    const schedule = generateSchedule([{ text: 'P1' }], ref, defaultConfig);
    expect(schedule[0].scheduledAt).toContain('2026-03-15T07:00:00');
  });

  // TC-GS-06: ref=22:01 → isAfterWindow のため即翌日07:00
  it('TC-GS-06: ref=22:01 → scheduledAt=2026-03-15T07:00:00', () => {
    const ref = new Date('2026-03-14T22:01:00');
    const schedule = generateSchedule([{ text: 'P1' }], ref, defaultConfig);
    expect(schedule[0].scheduledAt).toBe('2026-03-15T07:00:00');
  });

  // TC-GS-07: ref=07:00 → 次インターバルは08:00
  it('TC-GS-07: ref=07:00 → scheduledAtが08:00を含む', () => {
    const ref = new Date('2026-03-14T07:00:00');
    const schedule = generateSchedule([{ text: 'P1' }], ref, defaultConfig);
    expect(schedule[0].scheduledAt).toContain('08:00');
  });

  // TC-GS-08: ref=06:59 → isBeforeWindow → 07:00
  it('TC-GS-08: ref=06:59 → scheduledAt=2026-03-14T07:00:00', () => {
    const ref = new Date('2026-03-14T06:59:00');
    const schedule = generateSchedule([{ text: 'P1' }], ref, defaultConfig);
    expect(schedule[0].scheduledAt).toBe('2026-03-14T07:00:00');
  });

  // TC-GS-09: ref=23:30 → isAfterWindow → 翌日07:00
  it('TC-GS-09: ref=23:30 → scheduledAt=2026-03-15T07:00:00', () => {
    const ref = new Date('2026-03-14T23:30:00');
    const schedule = generateSchedule([{ text: 'P1' }], ref, defaultConfig);
    expect(schedule[0].scheduledAt).toBe('2026-03-15T07:00:00');
  });

  // TC-GS-10: interval=1440分で2投稿 → P2が07:00を含む
  it('TC-GS-10: interval=1440分 → P2のscheduledAtが07:00を含む', () => {
    const config1day: ScheduleConfig = { ...defaultConfig, intervalMinutes: 1440 };
    const posts = [{ text: 'P1' }, { text: 'P2' }];
    const schedule = generateSchedule(posts, refDate, config1day);
    expect(schedule[1].scheduledAt).toContain('07:00');
  });

  // TC-GS-11: config省略 → DEFAULT_CONFIG使用 → 11:00
  it('TC-GS-11: config省略でDEFAULT_CONFIG使用 → 11:00を含む', () => {
    const schedule = generateSchedule([{ text: 'P1' }], refDate);
    expect(schedule[0].scheduledAt).toContain('11:00');
  });

  // TC-GS-12: P1=手動2026-12-01T12:00、P2=自動 → P2が11:00
  it('TC-GS-12: P1が手動設定でもP2は自動スロット(11:00)', () => {
    const posts = [
      { text: 'P1', scheduledAt: '2026-12-01T12:00:00' },
      { text: 'P2' },
    ];
    const schedule = generateSchedule(posts, refDate, defaultConfig);
    expect(schedule[0].scheduledAt).toBe('2026-12-01T12:00:00');
    expect(schedule[1].scheduledAt).toContain('11:00');
  });
});
