# Design: App Simplification + Resend Email Notifications

Date: 2026-03-29

## Overview

Two parallel improvements:
1. Redesign the app UI to match a minimal, Demumu-style layout — one home screen with inline editable fields, a big check-in button, and a streak counter; plus a History tab.
2. Wire up real email alerts using Resend when a user misses 2+ consecutive check-ins.

---

## 1. App UI Simplification

### What changes

**Delete entirely:**
- `app/onboarding/` (Welcome, Profile, Contact screens)
- `app/(tabs)/settings.tsx`
- Onboarding gate logic in `app/_layout.tsx`

**Rebuild `app/(tabs)/index.tsx` (Home screen):**
- Top: two inline-editable text fields — Your name, Emergency contact email. Tap to edit, auto-save on blur. Persist to AsyncStorage (and sync to Neon if API configured).
- Middle: large circular button
  - Default state: green, ghost icon, "Check in today"
  - Checked-in state: grey, checkmark, "Still alive"
- Below button: streak counter — e.g. "🔥 5 day streak"
- Bottom: disclaimer text — "If you haven't checked in for 2 days, the system will send an email to your emergency contact."
- Privacy Policy link at very bottom

**First launch behaviour:**
- Fire iOS notification permission prompt immediately on mount (no separate onboarding screen)
- If name/email fields are empty, they show placeholder text — user fills them in directly on the home screen

**Keep `app/(tabs)/history.tsx`:**
- Current streak + longest streak
- 7-day dot grid
- 30-day calendar view

**Tabs:** Home + History only (remove Settings tab from tab bar)

### Data flow (unchanged)
- `useProfile` hook reads/writes name + check-in time from AsyncStorage
- `useCheckIn` hook records check-ins locally and syncs to Neon
- No behavioural changes — only the UI layer changes

---

## 2. Resend Email Integration

### What changes

**`/api/check-missed.ts`** — replace the `console.log` alert with a real `resend.emails.send()` call.

Email format:
- **To:** emergency contact email
- **From:** `alerts@didyoudie.app` (or a verified Resend sender domain)
- **Subject:** `[Did You Die] Check-in alert for [user name]`
- **Body (plain text):**
  > Hi, this is an automated alert from Did You Die.
  >
  > [User name] has not checked in for [N] days. If this is unexpected, you may want to reach out to them.
  >
  > — Did You Die

**New dependency:** `resend` npm package

**New env var:** `RESEND_API_KEY` (added to Vercel environment variables)

**Error handling:** wrap the send call in try/catch — a failed email should not throw the cron job; log the error and continue to the next user.

---

## Trade-offs considered

- **Resend vs SendGrid**: Resend has a simpler API and better DX for transactional email. SendGrid is more established but heavier. Resend is the right call for this stage.
- **Inline fields vs onboarding**: Removing onboarding reduces friction dramatically. The app works without a name/email (local-only mode), so it's fine to leave those fields empty on first launch.
- **SMS removal**: Dropping Twilio/SMS simplifies ops significantly. Email-only is sufficient for MVP.
