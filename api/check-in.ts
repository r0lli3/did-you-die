import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, date, checkedInAt } = req.body;

  if (!userId || !date || !checkedInAt) {
    return res.status(400).json({ error: 'Missing required fields: userId, date, checkedInAt' });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO check_ins (user_id, date, checked_in_at)
      VALUES (${userId}, ${date}, ${checkedInAt})
      ON CONFLICT (user_id, date) DO NOTHING
    `;
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to sync check-in:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
