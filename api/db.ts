import { neon } from '@neondatabase/serverless';

/**
 * Get a Neon SQL query function.
 * Uses the DATABASE_URL environment variable set in Vercel.
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(databaseUrl);
}
