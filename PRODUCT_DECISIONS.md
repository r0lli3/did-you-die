# Product Decisions

## Original core concept

A solo-safety app for people living alone. The user checks in once per day. If they miss check-ins for consecutive days, the app notifies their emergency contact. The concept prioritizes simplicity: one user, one contact, one daily action.

## The single improvement: visible check-in history

The original concept treats the daily check-in as a binary, ephemeral action — you either did it today or you didn't. There is no persistent record visible to the user.

Safe Check adds **visible check-in history** as the one meaningful improvement:

- **Current streak**: how many consecutive days you've checked in
- **Last 7 days**: a row of day cells showing checked-in, missed, or pending status at a glance
- **Last 30 days**: a calendar grid with color-coded dots and aggregate stats

## Why visible check-in history improves usability

### 1. It builds trust in the system
When you can see that your check-ins are being recorded accurately — day after day, with timestamps — you trust that the system is actually working. An invisible check-in feels like shouting into a void. A visible history is proof that the safety net is real.

### 2. It reinforces the daily habit
A streak counter provides just enough positive reinforcement to sustain the daily habit without gamifying it. You don't get points or badges. You just see "14 days" and feel a quiet motivation to keep going. Missing a day is visible but not punitive — you see the gap, note it, and move on.

### 3. It reduces anxiety about missed check-ins
Without history, a user who thinks they might have missed a day has no way to verify. Did the check-in register? Did I actually tap the button yesterday or just think about it? The history answers these questions instantly, which is important for the mental model of a safety app.

### 4. It makes the app worth opening
A check-in app with no history gives users zero reason to open it except when reminded. The history section gives the home screen substance — something to glance at, something that reflects your pattern. This small addition makes the app feel like a companion rather than an alarm.

## What we deliberately did not add

- **Gamification**: No points, badges, levels, or rewards. A safety app should feel calm, not competitive.
- **AI features**: No smart analysis, no predictions. The app does one thing.
- **Social features**: No sharing, no leaderboards, no community. This is private by design.
- **Complex escalation**: No multi-step notification chains, no "are you sure?" confirmations to the user. Two missed days triggers the contact — simple and reliable.
- **Extensive settings**: No notification tone customization, no theme options, no data export. Just the essentials.
