/**
 * Neon database sync layer.
 *
 * The React Native client does NOT connect directly to Neon.
 * Instead, it calls API routes (hosted on Vercel) that talk to Neon.
 * The API base URL is set via EXPO_PUBLIC_API_URL.
 *
 * In local-only mode (no API_URL), all sync functions are no-ops
 * and the app works entirely with AsyncStorage.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export const isApiConfigured = Boolean(API_URL);

async function apiCall(path: string, body: Record<string, unknown>): Promise<void> {
  if (!isApiConfigured) return;

  try {
    await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Silent fail — local storage is the source of truth
  }
}

/**
 * Sync a check-in to Neon via API.
 */
export async function syncCheckIn(userId: string, date: string, checkedInAt: string) {
  await apiCall('/api/check-in', { userId, date, checkedInAt });
}

/**
 * Sync user profile to Neon via API.
 */
export async function syncUserProfile(
  userId: string,
  firstName: string,
  timezone: string,
  checkInTime: string
) {
  await apiCall('/api/user', { userId, firstName, timezone, checkInTime });
}

/**
 * Sync emergency contact to Neon via API.
 */
export async function syncEmergencyContact(
  userId: string,
  name: string,
  relationship: string,
  phone: string,
  email: string
) {
  await apiCall('/api/emergency-contact', { userId, name, relationship, phone, email });
}
