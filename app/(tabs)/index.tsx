import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useProfile } from '../../hooks/useProfile';
import { useCheckIn } from '../../hooks/useCheckIn';
import { AnimatedLabelInput } from '../../components/AnimatedLabelInput';
import { ShatterButton } from '../../components/ShatterButton';

export default function HomeScreen() {
  const { profile, contact, updateProfile, updateContact, reload: reloadProfile } = useProfile();
  const {
    todayCheckedIn,
    checkIn,
    streak,
    loading,
    reload: reloadCheckIn,
  } = useCheckIn(
    profile?.timezone || '',
    profile?.checkInTime || '',
    profile?.id
  );

  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  // Sync local state when profile loads
  useEffect(() => {
    if (profile) setName(profile.firstName);
  }, [profile?.firstName]);

  useEffect(() => {
    if (contact) setContactEmail(contact.email);
  }, [contact?.email]);

  // Request notification permission on mount
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
      reloadCheckIn();
    }, [])
  );

  const handleNameBlur = useCallback(async () => {
    if (profile && name !== profile.firstName) {
      await updateProfile({ firstName: name });
    }
  }, [profile, name, updateProfile]);

  const handleContactEmailBlur = useCallback(async () => {
    const trimmed = contactEmail.trim();
    if (!trimmed) return;
    const current = contact?.email || '';
    if (trimmed !== current) {
      await updateContact({
        name: contact?.name || '',
        relationship: contact?.relationship || '',
        phone: contact?.phone || '',
        email: trimmed,
      });
    }
  }, [contact, contactEmail, updateContact]);

  const handleCheckIn = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await checkIn();
  }, [checkIn]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Inline editable fields */}
        <View style={styles.fields}>
          <AnimatedLabelInput
            label="Your name"
            value={name}
            onChangeText={setName}
            onBlur={handleNameBlur}
            returnKeyType="done"
          />
          <AnimatedLabelInput
            label="Emergency contact's email"
            value={contactEmail}
            onChangeText={setContactEmail}
            onBlur={handleContactEmailBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>

        {/* Shatter check-in button */}
        <View style={styles.buttonWrapper}>
          <ShatterButton
            label={todayCheckedIn ? 'Still alive' : 'Check in today'}
            icon={todayCheckedIn ? '✓' : '👻'}
            isShattered={todayCheckedIn}
            disabled={loading}
            shatterColor={todayCheckedIn ? '#C8C8C8' : '#2DB54B'}
            onPress={handleCheckIn}
          />

          {/* Streak */}
          {streak > 0 && (
            <Text style={styles.streak}>🔥 {streak} day{streak === 1 ? '' : 's'} streak</Text>
          )}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          If you haven't checked in for 2 days, the system will send an email to your emergency contact.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  fields: {
    gap: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
    gap: 20,
  },
  streak: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  disclaimer: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
});
