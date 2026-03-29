import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, firstName, timezone, checkInTime } = req.body;

  if (!userId || !firstName || !timezone || !checkInTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO users (id, first_name, timezone, check_in_time)
      VALUES (${userId}, ${firstName}, ${timezone}, ${checkInTime})
      ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        timezone = EXCLUDED.timezone,
        check_in_time = EXCLUDED.check_in_time
    `;
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to sync user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
