import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { formatTimeDisplay } from '../lib/dates';

interface Props {
  checkInTime: string;
  checkedIn: boolean;
}

export function NextReminder({ checkInTime, checkedIn }: Props) {
  if (checkedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Next check-in</Text>
        <Text style={styles.value}>Tomorrow at {formatTimeDisplay(checkInTime)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Check-in reminder</Text>
      <Text style={styles.value}>{formatTimeDisplay(checkInTime)} today</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
