import { query } from '../config/database.js';
import type { User } from '../types/index.js';

export async function findByEmail(email: string): Promise<User | null> {
  const result = await query<User & { password_hash: string }>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findById(id: number): Promise<User | null> {
  const result = await query<User>(
    'SELECT id, email, first_name, last_name, phone, subscription_tier, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function create(
  email: string,
  passwordHash: string,
  firstName?: string,
  lastName?: string
): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, first_name, last_name, phone, subscription_tier, created_at, updated_at`,
    [email, passwordHash, firstName || null, lastName || null]
  );

  // Create initial credits
  await query(
    'INSERT INTO user_credits (user_id) VALUES ($1)',
    [result.rows[0].id]
  );

  return result.rows[0];
}

export async function getPasswordHash(email: string): Promise<string | null> {
  const result = await query<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0]?.password_hash || null;
}
