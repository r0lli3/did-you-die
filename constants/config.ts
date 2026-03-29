// How many consecutive missed days before alerting the emergency contact
export const MISSED_DAYS_THRESHOLD = 2;

// How many minutes before the check-in time to send a reminder
export const REMINDER_MINUTES_BEFORE = 30;

// Default check-in time
export const DEFAULT_CHECK_IN_TIME = '09:00';

// History display lengths
export const WEEK_DAYS = 7;
export const MONTH_DAYS = 30;

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@dyd:user_profile',
  EMERGENCY_CONTACT: '@dyd:emergency_contact',
  CHECK_INS: '@dyd:check_ins',
  NOTIFICATION_EVENTS: '@dyd:notification_events',
  ONBOARDING_COMPLETE: '@dyd:onboarding_complete',
} as const;
