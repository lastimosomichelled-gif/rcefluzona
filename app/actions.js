'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { createSession, destroySession } from '@/lib/session';
import { requireAdmin, requireUser } from '@/lib/auth';

const str = (fd, k) => String(fd.get(k) ?? '').trim();
const q = (s) => encodeURIComponent(s);

export async function login(formData) {
  const username = str(formData, 'username');
  const password = String(formData.get('password') ?? '');
  const rows = await sql`
    SELECT id, password_hash FROM users
    WHERE username = ${username} AND is_active = TRUE`;
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) {
    redirect('/?error=' + q('Username or password is incorrect.'));
  }
  await createSession(u.id);
  redirect('/dashboard');
}

export async function register(formData) {
  const name = str(formData, 'full_name');
  const username = str(formData, 'username');
  const email = str(formData, 'email').toLowerCase();
  const region = str(formData, 'region');
  const pw = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !/^[A-Za-z0-9_.]{3,50}$/.test(username) || !emailOk || pw.length < 8 || pw !== confirm) {
    redirect('/register?error=' + q('Check your details and ensure both passwords match (8 characters minimum).'));
  }

  const dup = await sql`SELECT id FROM users WHERE username = ${username} OR email = ${email}`;
  if (dup.length) redirect('/register?error=' + q('Username or email is already registered.'));

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users`;
  const role = count === 0 ? 'admin' : 'staff'; // first account = admin
  const hash = await bcrypt.hash(pw, 10);
  const [row] = await sql`
    INSERT INTO users (username, email, full_name, region, role, password_hash)
    VALUES (${username}, ${email}, ${name}, ${region || null}, ${role}, ${hash})
    RETURNING id`;
  await createSession(row.id);
  redirect('/dashboard');
}

export async function logout() {
  destroySession();
  redirect('/');
}

export async function updateUser(formData) {
  const admin = await requireAdmin();
  const id = Number(formData.get('id')) || 0;
  const role = formData.get('role') === 'admin' ? 'admin' : 'staff';
  const active = formData.get('active') === 'on';

  if (id === admin.id && (!active || role !== 'admin')) {
    redirect('/users?error=' + q('You cannot deactivate or demote your own current admin account.'));
  }
  await sql`UPDATE users SET role = ${role}, is_active = ${active} WHERE id = ${id}`;
  revalidatePath('/users');
  redirect('/users?ok=' + q('User permissions updated.'));
}

export async function saveFundSource(formData) {
  const u = await requireUser();
  const year = Number(formData.get('fund_year')) || 0;
  const src = str(formData, 'fund_source') || 'RCEF';
  const amtRaw = str(formData, 'amount');
  const amount = amtRaw === '' || Number.isNaN(Number(amtRaw)) ? null : amtRaw;
  const notes = str(formData, 'notes');

  if (year < 2019 || year > 2031) {
    redirect('/fund_sources?error=' + q('Year must be from 2019 through 2031.'));
  }
  await sql`
    UPDATE fund_sources
    SET fund_source = ${src}, amount = ${amount}, notes = ${notes},
        updated_by = ${u.id}, updated_at = NOW()
    WHERE fund_year = ${year}`;
  revalidatePath('/fund_sources');
  redirect('/fund_sources?ok=' + q('Fund source updated.'));
}
