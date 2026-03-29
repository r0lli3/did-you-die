import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { saveEmergencyContact, getUserProfile, saveUserProfile, setOnboardingComplete } from '../../lib/storage';
import { scheduleDailyReminder, requestNotificationPermissions } from '../../lib/notifications';
import { EmergencyContact } from '../../lib/types';

const RELATIONSHIP_OPTIONS = ['Partner', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPhone = (p: string) => p.replace(/\D/g, '').length >= 7;

  const canFinish =
    name.trim().length >= 1 &&
    relationship.length > 0 &&
    isValidPhone(phone) &&
    isValidEmail(email);

  const handleFinish = async () => {
    if (!canFinish || saving) return;
    setSaving(true);

    try {
      const contact: EmergencyContact = {
        name: name.trim(),
        relationship,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
      };

      await saveEmergencyContact(contact);

      // Mark onboarding complete
      const profile = await getUserProfile();
      if (profile) {
        await saveUserProfile({ ...profile, onboardingComplete: true });
      }
      await setOnboardingComplete();

      // Set up notifications
      await requestNotificationPermissions();
      if (profile) {
        await scheduleDailyReminder(profile.checkInTime, profile.timezone);
      }

      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.step}>Step 2 of 2</Text>
        <Text style={styles.title}>Emergency contact</Text>
        <Text style={styles.subtitle}>
          This person will be notified if you miss check-ins for two days in a row.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Their name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Relationship</Text>
          <View style={styles.chipGrid}>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, relationship === opt && styles.chipSelected]}
                onPress={() => setRelationship(opt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, relationship === opt && styles.chipTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="name@email.com"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !canFinish && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={!canFinish || saving}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Setting up...' : 'Finish setup'}
          </Text>
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
    lineHeight: 22,
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.buttonPrimary,
    borderColor: Colors.buttonPrimary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  chipTextSelected: {
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
