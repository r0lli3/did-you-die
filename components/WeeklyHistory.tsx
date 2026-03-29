import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { DayRecord } from '../lib/types';
import { getDayOfWeek, getDayNumber } from '../lib/dates';

interface Props {
  records: DayRecord[];
}

export function WeeklyHistory({ records }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {records.map((record) => (
          <DayCell key={record.date} record={record} />
        ))}
      </View>
    </View>
  );
}

function DayCell({ record }: { record: DayRecord }) {
  const dotColor = {
    checked_in: Colors.success,
    missed: Colors.missed,
    pending: Colors.pending,
    future: Colors.borderLight,
  }[record.status];

  const dotBg = {
    checked_in: Colors.successLight,
    missed: Colors.missedLight,
    pending: Colors.pendingLight,
    future: Colors.borderLight,
  }[record.status];

  const isToday = record.status === 'pending' || record.date === new Date().toISOString().split('T')[0];

  return (
    <View style={[styles.cell, isToday && styles.cellToday]}>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
        {getDayOfWeek(record.date)}
      </Text>
      <View style={[styles.dot, { backgroundColor: dotBg }]}>
        {record.status === 'checked_in' && (
          <Text style={[styles.dotIcon, { color: Colors.successDark }]}>✓</Text>
        )}
        {record.status === 'missed' && (
          <Text style={[styles.dotIcon, { color: Colors.missedDark }]}>✗</Text>
        )}
        {record.status === 'pending' && (
          <View style={[styles.pendingDot, { backgroundColor: Colors.pending }]} />
        )}
      </View>
      <Text style={styles.dayNumber}>{getDayNumber(record.date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cellToday: {
    // Subtle highlight for today
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dayLabelToday: {
    color: Colors.pendingDark,
    fontWeight: '700',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
