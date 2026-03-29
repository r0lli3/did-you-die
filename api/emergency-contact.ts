import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, name, relationship, phone, email } = req.body;

  if (!userId || !name || !relationship || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO emergency_contacts (user_id, name, relationship, phone, email)
      VALUES (${userId}, ${name}, ${relationship}, ${phone}, ${email})
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        relationship = EXCLUDED.relationship,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        updated_at = now()
    `;
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to sync emergency contact:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
