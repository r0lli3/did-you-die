import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useProfile } from '../../hooks/useProfile';
import { useCheckIn } from '../../hooks/useCheckIn';
import { StreakCounter } from '../../components/StreakCounter';
import { MonthlyCalendar } from '../../components/MonthlyCalendar';
import { WeeklyHistory } from '../../components/WeeklyHistory';

export default function HistoryScreen() {
  const { profile, reload: reloadProfile } = useProfile();
  const {
    streak,
    weekRecords,
    monthRecords,
    loading,
    reload: reloadCheckIn,
  } = useCheckIn(
    profile?.timezone || '',
    profile?.checkInTime || '',
    profile?.id
  );

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
      reloadCheckIn();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    await Promise.all([reloadProfile(), reloadCheckIn()]);
  }, [reloadProfile, reloadCheckIn]);

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.textTertiary} />
        }
      >
        <Text style={styles.title}>Check-in history</Text>

        {/* Current streak */}
        <View style={styles.streakCard}>
          <StreakCounter streak={streak} />
        </View>

        {/* Last 7 days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 days</Text>
          <WeeklyHistory records={weekRecords} />
        </View>

        {/* Last 30 days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 30 days</Text>
          <MonthlyCalendar records={monthRecords} timezone={profile.timezone} />
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  streakCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
});
