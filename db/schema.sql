-- Did You Die: Neon Postgres schema
-- Run this against your Neon database to set up the tables.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  check_in_time TEXT NOT NULL DEFAULT '09:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS check_ins (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS notification_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'emergency_alert')),
  date DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consecutive_missed_days INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date, type)
);

CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON check_ins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notification_events_user ON notification_events(user_id, date DESC);
