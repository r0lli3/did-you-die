import { format, parseISO, startOfDay, subDays, isToday, isBefore, isAfter, addMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { DayStatus, DayRecord, CheckIn } from './types';

/**
 * Get today's date string (YYYY-MM-DD) in the user's timezone.
 */
export function getTodayDate(timezone: string): string {
  const now = new Date();
  const zoned = toZonedTime(now, timezone);
  return format(zoned, 'yyyy-MM-dd');
}

/**
 * Get current time in the user's timezone.
 */
export function getNowInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

/**
 * Parse a check-in time string (HH:mm) and get the next occurrence as a Date.
 */
export function getNextCheckInTime(checkInTime: string, timezone: string): Date {
  const [hours, minutes] = checkInTime.split(':').map(Number);
  const now = getNowInTimezone(timezone);
  const today = startOfDay(now);

  let next = new Date(today);
  next.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (isBefore(next, now)) {
    next = new Date(next.getTime() + 24 * 60 * 60 * 1000);
  }

  return fromZonedTime(next, timezone);
}

/**
 * Get the reminder time (before check-in time).
 */
export function getReminderTime(checkInTime: string, timezone: string, minutesBefore: number): Date {
  const checkIn = getNextCheckInTime(checkInTime, timezone);
  return addMinutes(checkIn, -minutesBefore);
}

/**
 * Build a list of DayRecords for the last N days.
 */
export function buildDayRecords(
  checkIns: CheckIn[],
  days: number,
  timezone: string,
  checkInTime: string
): DayRecord[] {
  const todayStr = getTodayDate(timezone);
  const checkInMap = new Map(checkIns.map(c => [c.date, c]));
  const records: DayRecord[] = [];
  const now = getNowInTimezone(timezone);

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(parseISO(todayStr), i), 'yyyy-MM-dd');
    const checkIn = checkInMap.get(date);

    let status: DayStatus;

    if (checkIn) {
      status = 'checked_in';
    } else if (date === todayStr) {
      status = 'pending';
    } else if (date > todayStr) {
      status = 'future';
    } else {
      status = 'missed';
    }

    records.push({
      date,
      status,
      checkedInAt: checkIn?.checkedInAt,
    });
  }

  return records;
}

/**
 * Calculate the current check-in streak.
 */
export function calculateStreak(checkIns: CheckIn[], timezone: string): number {
  const todayStr = getTodayDate(timezone);
  const checkInDates = new Set(checkIns.map(c => c.date));

  let streak = 0;
  let currentDate = todayStr;

  // If today is checked in, count it and look backward from yesterday
  if (checkInDates.has(currentDate)) {
    streak = 1;
    currentDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
  } else {
    // Today not checked in yet — start counting from yesterday
    currentDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
  }

  // Count consecutive days backward
  while (checkInDates.has(currentDate)) {
    streak++;
    currentDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
  }

  return streak;
}

/**
 * Count consecutive missed days from today going backward.
 */
export function countConsecutiveMissedDays(checkIns: CheckIn[], timezone: string): number {
  const todayStr = getTodayDate(timezone);
  const checkInDates = new Set(checkIns.map(c => c.date));

  // If checked in today, no missed days
  if (checkInDates.has(todayStr)) {
    return 0;
  }

  let missed = 0;
  let currentDate = format(subDays(parseISO(todayStr), 1), 'yyyy-MM-dd');

  while (!checkInDates.has(currentDate)) {
    missed++;
    // Don't count back before the user's first check-in or more than 30 days
    if (missed >= 30) break;
    currentDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
  }

  return missed;
}

/**
 * Format a time string for display.
 */
export function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get day of week abbreviation for a date string.
 */
export function getDayOfWeek(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE');
}

/**
 * Get day number for a date string.
 */
export function getDayNumber(dateStr: string): string {
  return format(parseISO(dateStr), 'd');
}

/**
 * Get month name for a date string.
 */
export function getMonthName(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM yyyy');
}

/**
 * Format a relative date description.
 */
export function formatRelativeDate(dateStr: string, timezone: string): string {
  const todayStr = getTodayDate(timezone);
  if (dateStr === todayStr) return 'Today';

  const yesterday = format(subDays(parseISO(todayStr), 1), 'yyyy-MM-dd');
  if (dateStr === yesterday) return 'Yesterday';

  return format(parseISO(dateStr), 'MMM d');
}
