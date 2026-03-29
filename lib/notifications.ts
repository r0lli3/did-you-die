import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNextCheckInTime, getReminderTime } from './dates';
import { REMINDER_MINUTES_BEFORE } from '../constants/config';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule the daily reminder notification.
 */
export async function scheduleDailyReminder(
  checkInTime: string,
  timezone: string
): Promise<void> {
  // Cancel any existing reminders first
  await cancelAllReminders();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const [hours, minutes] = checkInTime.split(':').map(Number);

  // Calculate reminder time (30 min before check-in)
  let reminderHour = hours;
  let reminderMinute = minutes - REMINDER_MINUTES_BEFORE;
  if (reminderMinute < 0) {
    reminderMinute += 60;
    reminderHour -= 1;
    if (reminderHour < 0) reminderHour += 24;
  }

  // Schedule a daily repeating notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to check in',
      body: "Let us know you're okay today.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminderHour,
      minute: reminderMinute,
    },
  });
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Send a test notification immediately.
 */
export async function sendTestNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test reminder',
      body: "This is how your daily check-in reminder will look.",
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Check if notification permissions are granted.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}
