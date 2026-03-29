import { useEffect, useCallback } from 'react';
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
import { CheckInButton } from '../../components/CheckInButton';
import { StreakCounter } from '../../components/StreakCounter';
import { WeeklyHistory } from '../../components/WeeklyHistory';
import { NextReminder } from '../../components/NextReminder';
import { EmergencyContactCard } from '../../components/EmergencyContactCard';

export default function HomeScreen() {
  const { profile, contact, reload: reloadProfile } = useProfile();
  const {
    todayCheckedIn,
    checkIn,
    streak,
    weekRecords,
    loading,
    reload: reloadCheckIn,
  } = useCheckIn(
    profile?.timezone || '',
    profile?.checkInTime || '',
    profile?.id
  );

  // Reload data when the tab comes into focus
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
        {/* Greeting */}
        <Text style={styles.greeting}>
          {getGreeting()}, {profile.firstName}
        </Text>

        {/* Streak */}
        <StreakCounter streak={streak} />

        {/* Check-in button */}
        <View style={styles.section}>
          <CheckInButton checkedIn={todayCheckedIn} onPress={checkIn} />
        </View>

        {/* Next reminder */}
        <View style={styles.section}>
          <NextReminder
            checkInTime={profile.checkInTime}
            checkedIn={todayCheckedIn}
          />
        </View>

        {/* Weekly history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 days</Text>
          <WeeklyHistory records={weekRecords} />
        </View>

        {/* Emergency contact */}
        {contact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency contact</Text>
            <EmergencyContactCard contact={contact} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  section: {
    marginTop: 20,
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
