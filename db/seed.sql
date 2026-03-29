-- Seed data for development/demo

INSERT INTO users (id, first_name, timezone, check_in_time, created_at)
VALUES ('user_demo_001', 'Alex', 'America/New_York', '09:00', now() - interval '35 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO emergency_contacts (user_id, name, relationship, phone, email)
VALUES ('user_demo_001', 'Jordan Smith', 'Partner', '+1 (555) 123-4567', 'jordan@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- Generate 30 days of check-ins, skipping days 8 and 15 ago
DO $$
DECLARE
  d INTEGER;
BEGIN
  FOR d IN 1..30 LOOP
    IF d NOT IN (8, 15) THEN
      INSERT INTO check_ins (user_id, date, checked_in_at)
      VALUES (
        'user_demo_001',
        CURRENT_DATE - d,
        (CURRENT_DATE - d + TIME '09:15:00')::TIMESTAMPTZ
      )
      ON CONFLICT (user_id, date) DO NOTHING;
    END IF;
  END LOOP;
END $$;
