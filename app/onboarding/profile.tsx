import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { DEFAULT_CHECK_IN_TIME } from '../../constants/config';
import { saveUserProfile } from '../../lib/storage';
import { UserProfile } from '../../lib/types';
import * as Localization from 'expo-localization';

const TIMEZONE = Localization.getCalendars()[0]?.timeZone || 'America/New_York';

const TIME_OPTIONS = [
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [checkInTime, setCheckInTime] = useState(DEFAULT_CHECK_IN_TIME);

  const canContinue = firstName.trim().length >= 1;

  const handleContinue = async () => {
    if (!canContinue) return;

    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      firstName: firstName.trim(),
      timezone: TIMEZONE,
      checkInTime,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(profile);
    router.push('/onboarding/contact');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.step}>Step 1 of 2</Text>
        <Text style={styles.title}>About you</Text>
        <Text style={styles.subtitle}>We'll keep this simple.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Your first name"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Timezone</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{TIMEZONE}</Text>
          </View>
          <Text style={styles.hint}>Detected automatically from your device.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Daily check-in time</Text>
          <Text style={styles.hint}>When should we remind you to check in?</Text>
          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.timeChip,
                  checkInTime === opt.value && styles.timeChipSelected,
                ]}
                onPress={() => setCheckInTime(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    checkInTime === opt.value && styles.timeChipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 24,
  },
  step: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  readOnlyField: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  readOnlyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  hint: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipSelected: {
    backgroundColor: Colors.buttonPrimary,
    borderColor: Colors.buttonPrimary,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  timeChipTextSelected: {
    color: Colors.buttonPrimaryText,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: Colors.buttonPrimaryText,
    fontSize: 17,
    fontWeight: '600',
  },
});
