/**
 * Seed local AsyncStorage with demo data for development.
 * Call this function from a development-only button or script.
 */
import { format, subDays } from 'date-fns';
import { UserProfile, EmergencyContact, CheckIn } from './types';
import { saveUserProfile, saveEmergencyContact, setOnboardingComplete } from './storage';
import { STORAGE_KEYS } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function seedDemoData(): Promise<void> {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // Demo user
  const profile: UserProfile = {
    id: 'user_demo_001',
    firstName: 'Alex',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    checkInTime: '09:00',
    onboardingComplete: true,
    createdAt: subDays(today, 35).toISOString(),
  };

  // Demo emergency contact
  const contact: EmergencyContact = {
    name: 'Jordan Smith',
    relationship: 'Partner',
    phone: '+1 (555) 123-4567',
    email: 'jordan@example.com',
  };

  // Demo check-ins: last 30 days, missing days 8 and 15 ago
  const checkIns: CheckIn[] = [];
  for (let i = 1; i <= 30; i++) {
    if (i === 8 || i === 15) continue; // Simulate missed days
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    checkIns.push({
      id: `checkin_${date}`,
      date,
      checkedInAt: subDays(today, i).toISOString(),
    });
  }

  await saveUserProfile(profile);
  await saveEmergencyContact(contact);
  await AsyncStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));
  await setOnboardingComplete();

  console.log('Demo data seeded successfully');
}
