export interface UserProfile {
  id: string;
  firstName: string;
  timezone: string;
  checkInTime: string; // HH:mm format
  onboardingComplete: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD in user's timezone
  checkedInAt: string; // ISO timestamp
}

export interface NotificationEvent {
  id: string;
  type: 'reminder' | 'emergency_alert';
  date: string; // YYYY-MM-DD
  sentAt: string; // ISO timestamp
  consecutiveMissedDays: number;
}

export type DayStatus = 'checked_in' | 'missed' | 'pending' | 'future';

export interface DayRecord {
  date: string; // YYYY-MM-DD
  status: DayStatus;
  checkedInAt?: string;
}
