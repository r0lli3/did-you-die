import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { DayRecord, DayStatus } from '../lib/types';
import { getDayNumber, getMonthName, getDayOfWeek, formatRelativeDate } from '../lib/dates';

interface Props {
  records: DayRecord[];
  timezone: string;
}

export function MonthlyCalendar({ records, timezone }: Props) {
  // Stats
  const checkedIn = records.filter(r => r.status === 'checked_in').length;
  const missed = records.filter(r => r.status === 'missed').length;

  return (
    <View style={styles.container}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBadge count={checkedIn} label="Checked in" color={Colors.success} />
        <StatBadge count={missed} label="Missed" color={Colors.missed} />
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {records.map((record) => (
          <CalendarDot key={record.date} record={record} timezone={timezone} />
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={Colors.success} label="Checked in" />
        <LegendItem color={Colors.missed} label="Missed" />
        <LegendItem color={Colors.pending} label="Today" />
      </View>
    </View>
  );
}

function StatBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CalendarDot({ record, timezone }: { record: DayRecord; timezone: string }) {
  const bgColor = {
    checked_in: Colors.success,
    missed: Colors.missed,
    pending: Colors.pending,
    future: Colors.borderLight,
  }[record.status];

  const isToday = record.status === 'pending';

  return (
    <View style={styles.dotContainer}>
      <View style={[styles.calDot, { backgroundColor: bgColor }, isToday && styles.calDotToday]}>
        <Text style={[styles.calDotText, record.status === 'future' && { color: Colors.textTertiary }]}>
          {getDayNumber(record.date)}
        </Text>
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dotContainer: {
    width: '13%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calDotToday: {
    borderWidth: 2,
    borderColor: Colors.pendingDark,
  },
  calDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});
