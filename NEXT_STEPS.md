# Next Steps

Practical production upgrades, in priority order.

## 1. Emergency notification delivery
- Integrate Twilio for SMS alerts to the emergency contact
- Integrate SendGrid for email alerts as a backup channel
- Add delivery confirmation tracking (was the SMS actually received?)
- Vercel cron job (`/api/check-missed`) is already configured to run hourly

## 2. App Store submission
- Design app icon and splash screen
- Create App Store screenshots
- Write App Store description and privacy policy
- Configure EAS Build for iOS and Android production builds
- Submit to TestFlight for beta testing

## 3. Auth
- Add a lightweight auth layer (magic link or anonymous tokens)
- Enables multi-device support and survives app reinstalls
- Keep it invisible — no login screen unless needed

## 4. Background check-in detection
- Use `expo-background-fetch` or `expo-task-manager` to check for missed check-ins even when the app is closed
- Supplement the server-side cron with client-side awareness

## 5. Onboarding phone verification
- Verify the emergency contact's phone number during setup (send a confirmation code)
- Prevents typos in the most critical field

## 6. Error monitoring
- Add Sentry for crash reporting
- Add basic analytics (check-in rate, streak distribution) for product insight
- No user tracking beyond what's needed for reliability

## 7. Offline resilience
- Queue Neon API syncs when offline and replay when back online
- Currently local storage is the source of truth, so this is mostly about cloud consistency

## 8. Accessibility
- Full VoiceOver / TalkBack support
- Dynamic type scaling
- High contrast mode support
