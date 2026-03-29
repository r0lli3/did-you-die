import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveCheckIn,
  getCheckIns,
  hasCheckedInToday,
  saveUserProfile,
  getUserProfile,
  saveEmergencyContact,
  getEmergencyContact,
  isOnboardingComplete,
  setOnboardingComplete,
  clearAllData,
} from '../lib/storage';
import { CheckIn, UserProfile, EmergencyContact } from '../lib/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    __store: store,
    __clear: () => Object.keys(store).forEach((k) => delete store[k]),
  };
});

beforeEach(() => {
  (AsyncStorage as any).__clear();
  jest.clearAllMocks();
});

describe('Check-in storage', () => {
  it('saves and retrieves check-ins', async () => {
    const checkIn: CheckIn = {
      id: 'test_1',
      date: '2026-03-29',
      checkedInAt: new Date().toISOString(),
    };

    await saveCheckIn(checkIn);
    const result = await getCheckIns();
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-03-29');
  });

  it('prevents duplicate check-ins for the same date', async () => {
    const checkIn: CheckIn = {
      id: 'test_1',
      date: '2026-03-29',
      checkedInAt: new Date().toISOString(),
    };

    await saveCheckIn(checkIn);
    await saveCheckIn({ ...checkIn, id: 'test_2' });
    const result = await getCheckIns();
    expect(result).toHaveLength(1);
  });

  it('checks if today has been checked in', async () => {
    expect(await hasCheckedInToday('2026-03-29')).toBe(false);

    await saveCheckIn({
      id: 'test_1',
      date: '2026-03-29',
      checkedInAt: new Date().toISOString(),
    });

    expect(await hasCheckedInToday('2026-03-29')).toBe(true);
  });
});

describe('User profile storage', () => {
  it('saves and retrieves profile', async () => {
    const profile: UserProfile = {
      id: 'user_1',
      firstName: 'Test',
      timezone: 'America/New_York',
      checkInTime: '09:00',
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(profile);
    const result = await getUserProfile();
    expect(result?.firstName).toBe('Test');
  });
});

describe('Emergency contact storage', () => {
  it('saves and retrieves contact', async () => {
    const contact: EmergencyContact = {
      name: 'Test Contact',
      relationship: 'Friend',
      phone: '+1234567890',
      email: 'test@example.com',
    };

    await saveEmergencyContact(contact);
    const result = await getEmergencyContact();
    expect(result?.name).toBe('Test Contact');
  });
});

describe('Onboarding state', () => {
  it('defaults to not complete', async () => {
    expect(await isOnboardingComplete()).toBe(false);
  });

  it('can be set to complete', async () => {
    await setOnboardingComplete();
    expect(await isOnboardingComplete()).toBe(true);
  });
});
