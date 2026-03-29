import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './db';
import { Resend } from 'resend';

const MISSED_DAYS_THRESHOLD = 2;

/**
 * Vercel Cron Job: check for missed check-ins.
 *
 * Configure in vercel.json with:
 *   "crons": [{ "path": "/api/check-missed", "schedule": "0 * * * *" }]
 *
 * For each user, counts consecutive missed days.
 * If >= MISSED_DAYS_THRESHOLD, logs an emergency notification event.
 * In production, integrate Twilio/SendGrid here to actually send alerts.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is called by Vercel Cron (or allow POST for testing)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getDb();

    // Get all users
    const users = await sql`SELECT id, first_name, timezone, check_in_time FROM users`;

    const alerts: Array<{ user: string; missedDays: number; contact: string }> = [];

    for (const user of users) {
      // Count consecutive missed days (not counting today)
      const today = new Date().toISOString().split('T')[0];

      const recentCheckIns = await sql`
        SELECT date FROM check_ins
        WHERE user_id = ${user.id}
          AND date >= (CURRENT_DATE - INTERVAL '${MISSED_DAYS_THRESHOLD + 1} days')::date
        ORDER BY date DESC
      `;

      const checkInDates = new Set(recentCheckIns.map((r: any) => r.date));

      let missedDays = 0;
      for (let i = 1; i <= MISSED_DAYS_THRESHOLD + 1; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (!checkInDates.has(dateStr)) {
          missedDays++;
        } else {
          break;
        }
      }

      if (missedDays >= MISSED_DAYS_THRESHOLD) {
        // Check if we already sent an alert today
        const existing = await sql`
          SELECT id FROM notification_events
          WHERE user_id = ${user.id} AND type = 'emergency_alert' AND date = ${today}
        `;

        if (existing.length === 0) {
          const contacts = await sql`
            SELECT name, email, phone FROM emergency_contacts
            WHERE user_id = ${user.id}
          `;

          if (contacts.length > 0) {
            const contact = contacts[0];

            // Log the event (prevents duplicate alerts)
            await sql`
              INSERT INTO notification_events (user_id, type, date, consecutive_missed_days)
              VALUES (${user.id}, 'emergency_alert', ${today}, ${missedDays})
              ON CONFLICT (user_id, date, type) DO NOTHING
            `;

            // Send email via Resend
            try {
              const resend = new Resend(process.env.RESEND_API_KEY);
              await resend.emails.send({
                from: 'Did You Die <onboarding@resend.dev>',
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
            }

            alerts.push({
              user: user.first_name,
              missedDays,
              contact: contact.name,
            });
          }
        }
      }
    }

    return res.status(200).json({ processed: users.length, alerts });
  } catch (error) {
    console.error('check-missed error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
