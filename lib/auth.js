import { redirect } from 'next/navigation';
import { sql } from './db';
import { readSession } from './session';

// Equivalent of PHP me(): current active user or null.
export async function me() {
  const uid = await readSession();
  if (!uid) return null;
  const rows = await sql`
    SELECT id, username, email, full_name, role, region
    FROM users WHERE id = ${uid} AND is_active = TRUE`;
  return rows[0] ?? null;
}

// Equivalent of PHP auth(): redirect to login if not signed in.
export async function requireUser() {
  const u = await me();
  if (!u) redirect('/');
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== 'admin') redirect('/dashboard');
  return u;
}
