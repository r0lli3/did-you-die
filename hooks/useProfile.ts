import { useState, useEffect, useCallback } from 'react';
import { UserProfile, EmergencyContact } from '../lib/types';
import {
  getUserProfile,
  saveUserProfile,
  getEmergencyContact,
  saveEmergencyContact,
  isOnboardingComplete,
} from '../lib/storage';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c, o] = await Promise.all([
      getUserProfile(),
      getEmergencyContact(),
      isOnboardingComplete(),
    ]);
    setProfile(p);
    setContact(c);
    setOnboarded(o);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await saveUserProfile(updated);
    setProfile(updated);
  }, [profile]);

  const updateContact = useCallback(async (updates: EmergencyContact) => {
    await saveEmergencyContact(updates);
    setContact(updates);
  }, []);

  return {
    profile,
    contact,
    onboarded,
    loading,
    updateProfile,
    updateContact,
    reload: load,
  };
}
