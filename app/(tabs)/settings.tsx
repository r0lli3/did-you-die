import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useProfile } from '../../hooks/useProfile';
import { scheduleDailyReminder, sendTestNotification } from '../../lib/notifications';
import { clearAllData } from '../../lib/storage';
import { useRouter } from 'expo-router';

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

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, contact, updateProfile, updateContact, reload } = useProfile();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [editingContact, setEditingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  if (!profile) return null;

  const handleNameEdit = () => {
    setNameValue(profile.firstName);
    setEditingName(true);
  };

  const handleNameSave = async () => {
    if (nameValue.trim().length < 1) return;
    await updateProfile({ firstName: nameValue.trim() });
    setEditingName(false);
  };

  const handleTimeChange = async (time: string) => {
    await updateProfile({ checkInTime: time });
    await scheduleDailyReminder(time, profile.timezone);
  };

  const handleContactEdit = () => {
    if (contact) {
      setContactName(contact.name);
      setContactPhone(contact.phone);
      setContactEmail(contact.email);
    }
    setEditingContact(true);
  };

  const handleContactSave = async () => {
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) return;
    await updateContact({
      name: contactName.trim(),
      relationship: contact?.relationship || 'Other',
      phone: contactPhone.trim(),
      email: contactEmail.trim(),
    });
    setEditingContact(false);
  };

  const handleTestReminder = async () => {
    await sendTestNotification();
    Alert.alert('Sent', 'A test notification has been sent.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset everything?',
      'This will delete all your data and return to setup. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your name</Text>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={nameValue}
                onChangeText={setNameValue}
                autoFocus
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleNameSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.row} onPress={handleNameEdit}>
              <Text style={styles.rowValue}>{profile.firstName}</Text>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Timezone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timezone</Text>
          <View style={styles.row}>
            <Text style={styles.rowValue}>{profile.timezone}</Text>
          </View>
        </View>

        {/* Check-in time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily check-in time</Text>
          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.timeChip,
                  profile.checkInTime === opt.value && styles.timeChipSelected,
                ]}
                onPress={() => handleTimeChange(opt.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    profile.checkInTime === opt.value && styles.timeChipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency contact</Text>
          {editingContact ? (
            <View style={styles.editCard}>
              <TextInput
                style={styles.input}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Name"
                placeholderTextColor={Colors.textTertiary}
              />
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Phone"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="Email"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleContactSave}>
                <Text style={styles.saveBtnText}>Save contact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.row} onPress={handleContactEdit}>
              <View>
                <Text style={styles.rowValue}>{contact?.name || 'Not set'}</Text>
                {contact && <Text style={styles.rowSub}>{contact.phone}</Text>}
              </View>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={handleTestReminder}>
            <Text style={styles.actionText}>Send test reminder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={handleReset}>
            <Text style={[styles.actionText, { color: Colors.missed }]}>Reset all data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  rowSub: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.pendingDark,
  },
  editRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  editCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.buttonPrimaryText,
    fontSize: 15,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipSelected: {
    backgroundColor: Colors.buttonPrimary,
    borderColor: Colors.buttonPrimary,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  timeChipTextSelected: {
    color: Colors.buttonPrimaryText,
  },
  actionRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.pendingDark,
  },
});
