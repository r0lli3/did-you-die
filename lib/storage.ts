import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, EmergencyContact, CheckIn, NotificationEvent } from './types';
import { STORAGE_KEYS } from '../constants/config';

// --- User Profile ---

export async function getUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return raw ? JSON.parse(raw) : null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

// --- Emergency Contact ---

export async function getEmergencyContact(): Promise<EmergencyContact | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACT);
  return raw ? JSON.parse(raw) : null;
}

export async function saveEmergencyContact(contact: EmergencyContact): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACT, JSON.stringify(contact));
}

// --- Check-ins ---

export async function getCheckIns(): Promise<CheckIn[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHECK_INS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCheckIn(checkIn: CheckIn): Promise<void> {
  const existing = await getCheckIns();

  // Prevent duplicate check-ins for the same date
  const alreadyExists = existing.some(c => c.date === checkIn.date);
  if (alreadyExists) return;

  existing.push(checkIn);
  await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(existing));
}

export async function hasCheckedInToday(todayDate: string): Promise<boolean> {
  const checkIns = await getCheckIns();
  return checkIns.some(c => c.date === todayDate);
}

// --- Notification Events ---

export async function getNotificationEvents(): Promise<NotificationEvent[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_EVENTS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveNotificationEvent(event: NotificationEvent): Promise<void> {
  const existing = await getNotificationEvents();

  // Prevent duplicate alerts for the same date
  const alreadyExists = existing.some(
    e => e.date === event.date && e.type === event.type
  );
  if (alreadyExists) return;

  existing.push(event);
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_EVENTS, JSON.stringify(existing));
}

// --- Onboarding ---

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return val === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
}

// --- Clear all data (for testing/reset) ---

export async function clearAllData(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
}
