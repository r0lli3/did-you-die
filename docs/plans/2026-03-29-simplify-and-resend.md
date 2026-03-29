# App Simplification + Resend Email Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the app to a Demumu-style single home screen with inline editable fields, and wire up real email alerts via Resend when a user misses 2+ check-ins.

**Architecture:** Remove the 3-screen onboarding flow and settings tab entirely. The home screen becomes self-contained — it creates the user profile on first launch, requests notification permissions inline, and shows editable name/contact email fields directly. Resend replaces the `console.log` stub in `/api/check-missed.ts`.

**Tech Stack:** Expo Router, React Native, AsyncStorage, Resend SDK (`resend`), Vercel serverless functions, Neon Postgres

---

## Task 1: Install Resend and add the env var

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `api/check-missed.ts`

**Step 1: Install the Resend SDK**

```bash
cd /Users/rparame/CursorWorkspaces/did-you-die
npm install resend
```

Expected: `resend` appears in `package.json` dependencies.

**Step 2: Add `RESEND_API_KEY` to Vercel**

Go to https://vercel.com/r0lli3s-projects/did-you-die/settings/environment-variables and add:
- Key: `RESEND_API_KEY`
- Value: your Resend API key (from resend.com → API Keys)
- Environments: Production, Preview, Development

Then pull it locally:

```bash
npx vercel env pull .env --yes
```

**Step 3: Replace the console.log stub in `api/check-missed.ts`**

Replace the import section at the top of the file:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './db';
import { Resend } from 'resend';
```

Replace the `// TODO: Send actual SMS/email` block (lines 78-83) with:

```ts
            // Send email via Resend
            try {
              const resend = new Resend(process.env.RESEND_API_KEY);
              await resend.emails.send({
                from: 'Did You Die <alerts@didyoudie.app>',
                to: contact.email,
                subject: `Check-in alert for ${user.first_name}`,
                text: [
                  `Hi ${contact.name},`,
                  '',
                  `This is an automated alert from Did You Die.`,
                  '',
                  `${user.first_name} has not checked in for ${missedDays} day${missedDays === 1 ? '' : 's'}.`,
                  `If this is unexpected, you may want to reach out to them.`,
                  '',
                  `— Did You Die`,
                ].join('\n'),
              });
              console.log(`Email sent to ${contact.email} for user ${user.first_name}`);
            } catch (emailErr) {
              console.error(`Failed to send email for user ${user.first_name}:`, emailErr);
              // Don't throw — continue processing other users
            }
```

**Step 4: Commit**

```bash
git add api/check-missed.ts package.json package-lock.json
git commit -m "feat: replace console.log stub with Resend email in check-missed"
```

---

## Task 2: Remove the onboarding gate from `app/_layout.tsx`

**Files:**
- Modify: `app/_layout.tsx`

The current `_layout.tsx` checks `isOnboardingComplete()` and redirects to `/onboarding` if not done. We're removing onboarding entirely — just load fonts, hide splash screen, and render.

**Step 1: Rewrite `app/_layout.tsx`**

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.textSecondary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

**Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "refactor: remove onboarding gate from root layout"
```

---

## Task 3: Remove Settings tab and delete onboarding screens

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Delete: `app/(tabs)/settings.tsx`
- Delete: `app/onboarding/` (entire directory)

**Step 1: Remove Settings from `app/(tabs)/_layout.tsx`**

Remove the entire `<Tabs.Screen name="settings" ...>` block, leaving only Home and History:

```tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.textPrimary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

**Step 2: Delete files**

```bash
rm /Users/rparame/CursorWorkspaces/did-you-die/app/(tabs)/settings.tsx
rm -rf /Users/rparame/CursorWorkspaces/did-you-die/app/onboarding
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove settings tab and onboarding screens"
```

---

## Task 4: Update `useProfile` to auto-create profile on first launch

**Files:**
- Modify: `hooks/useProfile.ts`
- Modify: `lib/storage.ts`

Currently `useProfile` returns `null` if no profile exists — the home screen returned early. Now we need a guaranteed profile from first launch so the home screen can always render.

**Step 1: Add `getOrCreateProfile` to `lib/storage.ts`**

Add this function after `saveUserProfile`:

```ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function getOrCreateProfile(): Promise<UserProfile> {
  const existing = await getUserProfile();
  if (existing) return existing;

  // Generate a stable device ID
  const deviceId =
    Constants.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    `device_${Date.now()}`;

  const fresh: UserProfile = {
    id: deviceId,
    firstName: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    checkInTime: '09:00',
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
  };

  await saveUserProfile(fresh);
  return fresh;
}
```

**Step 2: Update `hooks/useProfile.ts`** to use `getOrCreateProfile`:

Replace the `load` function's `getUserProfile()` call:

```ts
import { useState, useEffect, useCallback } from 'react';
import { UserProfile, EmergencyContact } from '../lib/types';
import {
  getOrCreateProfile,
  saveUserProfile,
  getEmergencyContact,
  saveEmergencyContact,
} from '../lib/storage';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      getOrCreateProfile(),
      getEmergencyContact(),
    ]);
    setProfile(p);
    setContact(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await saveUserProfile(updated);
    setProfile(updated);
  }, [profile]);

  const updateContact = useCallback(async (updates: EmergencyContact) => {
    await saveEmergencyContact(updates);
    setContact(updates);
  }, []);

  return {
    profile,
    contact,
    loading,
    updateProfile,
    updateContact,
    reload: load,
  };
}
```

**Step 3: Commit**

```bash
git add hooks/useProfile.ts lib/storage.ts
git commit -m "refactor: auto-create profile on first launch, remove onboarding dependency"
```

---

## Task 5: Rebuild the home screen (`app/(tabs)/index.tsx`)

**Files:**
- Modify: `app/(tabs)/index.tsx`

This is the biggest change. The new screen has:
- Inline editable name + contact email at top (tap to edit, auto-save on blur)
- Big circular check-in button (green / grey based on state)
- Streak counter below the button
- Disclaimer text at bottom
- Notification permission request on first mount

**Step 1: Rewrite `app/(tabs)/index.tsx`**

```tsx
import { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useProfile } from '../../hooks/useProfile';
import { useCheckIn } from '../../hooks/useCheckIn';

export default function HomeScreen() {
  const { profile, contact, updateProfile, updateContact, reload: reloadProfile } = useProfile();
  const {
    todayCheckedIn,
    checkIn,
    streak,
    loading,
    reload: reloadCheckIn,
  } = useCheckIn(
    profile?.timezone || '',
    profile?.checkInTime || '',
    profile?.id
  );

  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sync local state when profile loads
  useEffect(() => {
    if (profile) setName(profile.firstName);
  }, [profile?.firstName]);

  useEffect(() => {
    if (contact) setContactEmail(contact.email);
  }, [contact?.email]);

  // Request notification permission on mount
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Pulse animation for the button when not checked in
  useEffect(() => {
    if (todayCheckedIn) {
      pulseAnim.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [todayCheckedIn]);

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
      reloadCheckIn();
    }, [])
  );

  const handleNameBlur = useCallback(async () => {
    if (profile && name !== profile.firstName) {
      await updateProfile({ firstName: name });
    }
  }, [profile, name, updateProfile]);

  const handleContactEmailBlur = useCallback(async () => {
    const trimmed = contactEmail.trim();
    if (!trimmed) return;
    const current = contact?.email || '';
    if (trimmed !== current) {
      await updateContact({
        name: contact?.name || '',
        relationship: contact?.relationship || '',
        phone: contact?.phone || '',
        email: trimmed,
      });
    }
  }, [contact, contactEmail, updateContact]);

  const handleCheckIn = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await checkIn();
  }, [checkIn]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Inline editable fields */}
        <View style={styles.fields}>
          <TextInput
            style={styles.fieldInput}
            placeholder="Your name"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            onBlur={handleNameBlur}
            returnKeyType="done"
          />
          <TextInput
            style={styles.fieldInput}
            placeholder="Emergency contact's email"
            placeholderTextColor={Colors.textTertiary}
            value={contactEmail}
            onChangeText={setContactEmail}
            onBlur={handleContactEmailBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>

        {/* Big check-in button */}
        <View style={styles.buttonWrapper}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.checkInButton, todayCheckedIn && styles.checkInButtonDone]}
              onPress={handleCheckIn}
              disabled={todayCheckedIn || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.checkInIcon}>{todayCheckedIn ? '✓' : '👻'}</Text>
              <Text style={styles.checkInLabel}>
                {todayCheckedIn ? 'Still alive' : 'Check in today'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Streak */}
          {streak > 0 && (
            <Text style={styles.streak}>🔥 {streak} day{streak === 1 ? '' : 's'} streak</Text>
          )}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          If you haven't checked in for 2 days, the system will send an email to your emergency contact.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const BUTTON_SIZE = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  fields: {
    gap: 16,
  },
  fieldInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  buttonWrapper: {
    alignItems: 'center',
    gap: 20,
  },
  checkInButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#2DB54B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2DB54B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  checkInButtonDone: {
    backgroundColor: '#C8C8C8',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  checkInIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  checkInLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  streak: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  disclaimer: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
});
```

**Step 2: Run the app to verify it looks right**

```bash
cd /Users/rparame/CursorWorkspaces/did-you-die
npx expo start --ios
```

Check:
- Home screen loads with two text fields and big button
- Editing name field and blurring saves it (reload to confirm)
- Tapping check-in button turns it grey and shows "Still alive"
- Streak shows if > 0

**Step 3: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: rebuild home screen with inline editable fields and Demumu-style layout"
```

---

## Task 6: Push and deploy

**Step 1: Push to GitHub (triggers auto-deploy)**

```bash
git push origin main
```

**Step 2: Verify deployment**

Watch https://vercel.com/r0lli3s-projects/did-you-die — should go READY within ~2 minutes.

**Step 3: Test the cron endpoint manually**

```bash
curl -X POST https://did-you-die.vercel.app/api/check-missed
```

Expected: `{"processed": N, "alerts": []}` (no alerts unless someone has missed 2+ days in Neon)

---

## Notes

- `Colors` values used: `Colors.background`, `Colors.textPrimary`, `Colors.textSecondary`, `Colors.textTertiary`, `Colors.borderLight`, `Colors.surface` — all defined in `constants/colors.ts`
- The `useCheckIn` hook's `streak` and `todayCheckedIn` are computed from local AsyncStorage, not Neon — so the app works offline
- Resend sender domain (`alerts@didyoudie.app`) must be verified in your Resend dashboard, or use `onboarding@resend.dev` for testing
