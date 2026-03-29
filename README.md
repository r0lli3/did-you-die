# Did You Die

A simple daily check-in app for people living alone. Check in once a day — if you miss consecutive days, your emergency contact is notified.

## How to run locally

### Prerequisites
- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode) or Android Emulator, or Expo Go on a physical device

### Setup

```bash
cd did-you-die
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

### Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | For API routes | Neon Postgres connection string |
| `EXPO_PUBLIC_API_URL` | No | URL of your Vercel deployment for cloud sync |

**The app works fully in local-only mode without any backend.** Neon + Vercel API routes are only needed for cloud sync and production emergency notifications.

### Running tests

```bash
npm test
```

### Database setup (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Run `db/schema.sql` against your Neon database
3. Optionally run `db/seed.sql` for demo data
4. Set `DATABASE_URL` in your Vercel environment variables

### Deploying to Vercel

The project auto-deploys from GitHub. Vercel is configured to:
- Build the Expo web app (`npx expo export -p web`)
- Serve Vercel API routes from `/api/`
- Run the `check-missed` cron job hourly

## Architecture

```
did-you-die/
├── app/                      # Expo Router screens
│   ├── (tabs)/               # Tab navigation (Home, History, Settings)
│   ├── onboarding/           # Onboarding flow (Welcome, Profile, Contact)
│   └── _layout.tsx           # Root layout with onboarding gate
├── api/                      # Vercel serverless API routes
│   ├── db.ts                 # Neon database connection
│   ├── check-in.ts           # POST /api/check-in — sync check-ins
│   ├── user.ts               # POST /api/user — sync user profile
│   ├── emergency-contact.ts  # POST /api/emergency-contact — sync contact
│   └── check-missed.ts       # Cron: detect missed check-ins, alert contacts
├── components/               # Shared UI components
├── hooks/                    # React hooks (useCheckIn, useProfile)
├── lib/                      # Core logic
│   ├── types.ts              # TypeScript types
│   ├── storage.ts            # AsyncStorage persistence
│   ├── dates.ts              # Date/timezone utilities
│   ├── notifications.ts      # Push notification scheduling
│   ├── neon.ts               # API client for Neon sync (optional)
│   └── seed.ts               # Demo data seeder
├── db/                       # Database files
│   ├── schema.sql            # Neon Postgres schema
│   └── seed.sql              # Demo data
├── constants/                # Colors, config
├── __tests__/                # Unit tests
└── vercel.json               # Vercel deployment config
```

## Check-in and reminder logic

### Daily flow
1. User receives a push notification 30 minutes before their set check-in time
2. User opens the app and taps "I'm okay"
3. Check-in is recorded locally (and synced to Neon via Vercel API if configured)
4. Duplicate check-ins for the same day are silently ignored

### Missed check-in detection
- A Vercel cron job (`/api/check-missed`) runs hourly
- For each user in Neon, it counts consecutive missed days going backward from yesterday
- If missed days >= 2 (configurable via `MISSED_DAYS_THRESHOLD`), it logs an emergency alert
- Duplicate alerts for the same date are prevented via a unique constraint

### Notifications
- Local push notifications via `expo-notifications` for daily reminders
- Notification permissions are requested during onboarding
- If permissions are denied, the app still works — user just won't get reminders

## What is mocked vs production-ready

| Feature | Status | Notes |
|---------|--------|-------|
| Check-in recording | Production-ready | Local-first with optional Neon cloud sync |
| Check-in history | Production-ready | Streak, 7-day, 30-day views |
| Daily reminders | Production-ready | Uses expo-notifications with daily trigger |
| Emergency contact storage | Production-ready | Stored locally and optionally in Neon |
| Emergency SMS/email | Mocked | API route logs the alert; needs Twilio/SendGrid |
| User auth | Lightweight | Uses local device ID; could add auth later |
| Data sync | Optional | Works offline-first; Neon sync is additive |
| Vercel cron | Production-ready | Runs hourly to detect missed check-ins |

## What is needed for production launch

1. **Emergency notifications**: Integrate Twilio (SMS) and SendGrid (email) in `/api/check-missed`
2. **App Store assets**: App icon, splash screen, screenshots, App Store listing
3. **Auth**: Add a lightweight auth layer for multi-device support
4. **Privacy policy**: Required for App Store submission
5. **Error tracking**: Add Sentry or similar for production monitoring
