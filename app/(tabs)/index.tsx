import { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useProfile } from '../../hooks/useProfile';
import { useCheckIn } from '../../hooks/useCheckIn';

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
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Pulse animation for the button when not checked in
  useEffect(() => {
    if (todayCheckedIn) {
      pulseAnim.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [todayCheckedIn]);

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
          <TextInput
            style={styles.fieldInput}
            placeholder="Your name"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            onBlur={handleNameBlur}
            returnKeyType="done"
          />
          <TextInput
            style={styles.fieldInput}
            placeholder="Emergency contact's email"
            placeholderTextColor={Colors.textTertiary}
            value={contactEmail}
            onChangeText={setContactEmail}
            onBlur={handleContactEmailBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>

        {/* Big check-in button */}
        <View style={styles.buttonWrapper}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.checkInButton, todayCheckedIn && styles.checkInButtonDone]}
              onPress={handleCheckIn}
              disabled={todayCheckedIn || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.checkInIcon}>{todayCheckedIn ? '✓' : '👻'}</Text>
              <Text style={styles.checkInLabel}>
                {todayCheckedIn ? 'Still alive' : 'Check in today'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

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

const BUTTON_SIZE = 220;

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
    gap: 16,
  },
  fieldInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  buttonWrapper: {
    alignItems: 'center',
    gap: 20,
  },
  checkInButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#2DB54B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2DB54B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  checkInButtonDone: {
    backgroundColor: '#C8C8C8',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  checkInIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  checkInLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
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
