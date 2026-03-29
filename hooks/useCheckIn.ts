import { useState, useEffect, useCallback } from 'react';
import { CheckIn, DayRecord } from '../lib/types';
import { getCheckIns, saveCheckIn, hasCheckedInToday } from '../lib/storage';
import { getTodayDate, buildDayRecords, calculateStreak } from '../lib/dates';
import { syncCheckIn } from '../lib/neon';
import { WEEK_DAYS, MONTH_DAYS } from '../constants/config';

export function useCheckIn(timezone: string, checkInTime: string, userId?: string) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayDate = timezone ? getTodayDate(timezone) : '';

  const load = useCallback(async () => {
    if (!timezone) return;
    setLoading(true);
    const all = await getCheckIns();
    setCheckIns(all);
    setTodayCheckedIn(all.some(c => c.date === todayDate));
    setLoading(false);
  }, [timezone, todayDate]);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = useCallback(async () => {
    if (!timezone || todayCheckedIn) return;

    const now = new Date().toISOString();
    const newCheckIn: CheckIn = {
      id: `${todayDate}_${Date.now()}`,
      date: todayDate,
      checkedInAt: now,
    };

    await saveCheckIn(newCheckIn);
    setCheckIns(prev => [...prev, newCheckIn]);
    setTodayCheckedIn(true);

    // Sync to Neon via API if configured
    if (userId) {
      syncCheckIn(userId, todayDate, now).catch(() => {
        // Silent fail for sync — local check-in is the source of truth
      });
    }
  }, [timezone, todayDate, todayCheckedIn, userId]);

  const streak = timezone ? calculateStreak(checkIns, timezone) : 0;

  const weekRecords: DayRecord[] =
    timezone && checkInTime
      ? buildDayRecords(checkIns, WEEK_DAYS, timezone, checkInTime)
      : [];

  const monthRecords: DayRecord[] =
    timezone && checkInTime
      ? buildDayRecords(checkIns, MONTH_DAYS, timezone, checkInTime)
      : [];

  return {
    checkIns,
    todayCheckedIn,
    loading,
    checkIn,
    streak,
    weekRecords,
    monthRecords,
    reload: load,
  };
}
