import { format, subDays } from 'date-fns';
import {
  buildDayRecords,
  calculateStreak,
  countConsecutiveMissedDays,
  formatTimeDisplay,
  getTodayDate,
} from '../lib/dates';
import { CheckIn } from '../lib/types';

const TZ = 'America/New_York';

function makeCheckIn(daysAgo: number): CheckIn {
  const date = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
  return {
    id: `test_${date}`,
    date,
    checkedInAt: subDays(new Date(), daysAgo).toISOString(),
  };
}

describe('calculateStreak', () => {
  it('returns 0 when no check-ins exist', () => {
    expect(calculateStreak([], TZ)).toBe(0);
  });

  it('returns 1 when only today is checked in', () => {
    const today = makeCheckIn(0);
    expect(calculateStreak([today], TZ)).toBe(1);
  });

  it('counts consecutive days including today', () => {
    const checkIns = [makeCheckIn(0), makeCheckIn(1), makeCheckIn(2)];
    expect(calculateStreak(checkIns, TZ)).toBe(3);
  });

  it('stops at a gap', () => {
    // Checked in today, yesterday, but NOT 2 days ago
    const checkIns = [makeCheckIn(0), makeCheckIn(1), makeCheckIn(3)];
    expect(calculateStreak(checkIns, TZ)).toBe(2);
  });

  it('counts streak from yesterday when today is not checked in', () => {
    const checkIns = [makeCheckIn(1), makeCheckIn(2), makeCheckIn(3)];
    expect(calculateStreak(checkIns, TZ)).toBe(3);
  });
});

describe('countConsecutiveMissedDays', () => {
  it('returns 0 when checked in today', () => {
    const checkIns = [makeCheckIn(0)];
    expect(countConsecutiveMissedDays(checkIns, TZ)).toBe(0);
  });

  it('counts missed days from yesterday', () => {
    // Last check-in was 3 days ago
    const checkIns = [makeCheckIn(3)];
    expect(countConsecutiveMissedDays(checkIns, TZ)).toBe(2);
  });
});

describe('buildDayRecords', () => {
  it('builds 7 day records', () => {
    const records = buildDayRecords([], 7, TZ, '09:00');
    expect(records).toHaveLength(7);
  });

  it('marks today as pending when not checked in', () => {
    const records = buildDayRecords([], 7, TZ, '09:00');
    const today = records[records.length - 1];
    expect(today.status).toBe('pending');
  });

  it('marks today as checked_in when checked in', () => {
    const checkIns = [makeCheckIn(0)];
    const records = buildDayRecords(checkIns, 7, TZ, '09:00');
    const today = records[records.length - 1];
    expect(today.status).toBe('checked_in');
  });

  it('marks past days without check-in as missed', () => {
    const records = buildDayRecords([], 7, TZ, '09:00');
    const yesterday = records[records.length - 2];
    expect(yesterday.status).toBe('missed');
  });
});

describe('formatTimeDisplay', () => {
  it('formats morning time', () => {
    expect(formatTimeDisplay('09:00')).toBe('9:00 AM');
  });

  it('formats afternoon time', () => {
    expect(formatTimeDisplay('14:30')).toBe('2:30 PM');
  });

  it('formats midnight', () => {
    expect(formatTimeDisplay('00:00')).toBe('12:00 AM');
  });

  it('formats noon', () => {
    expect(formatTimeDisplay('12:00')).toBe('12:00 PM');
  });
});
