import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { isOnboardingComplete } from '../lib/storage';
import { Colors } from '../constants/colors';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
  });
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    isOnboardingComplete().then(setOnboarded);
  }, []);

  useEffect(() => {
    if (fontsLoaded && onboarded !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, onboarded]);

  useEffect(() => {
    if (onboarded === null || !fontsLoaded) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [onboarded, segments, fontsLoaded]);

  if (!fontsLoaded || onboarded === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.textSecondary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
