import Link from 'next/link';
import { redirect } from 'next/navigation';
import { me } from '@/lib/auth';
import { register } from '../actions';
import BodyClass from '@/components/BodyClass';
import Notice from '@/components/Notice';

export const metadata = { title: 'Create account | RCEF Monitor' };

export default async function RegisterPage({ searchParams }) {
  if (await me()) redirect('/dashboard');
  return (
    <>
      <BodyClass name="auth" />
      <section className="auth-card">
        <h2>Create account</h2>
        <Notice error={searchParams?.error} />
        <form action={register}>
          <label>Full name:</label>
          <input name="full_name" required />
          <label>Username:</label>
          <input name="username" required minLength={3} pattern="[A-Za-z0-9_.]+" title="Use letters, numbers, dot, underscore" />
          <label>Email:</label>
          <input name="email" type="email" required />
          <label>Assigned Region:</label>
          <input name="region" placeholder="e.g. Region III" />
          <label>Password:</label>
          <input name="password" type="password" minLength={8} required />
          <label>Confirm password:</label>
          <input name="confirm" type="password" minLength={8} required />
          <button className="btn primary full">Create account</button>
        </form>
        <p className="auth-links"><Link href="/">Back to log in</Link></p>
      </section>
    </>
  );
}
