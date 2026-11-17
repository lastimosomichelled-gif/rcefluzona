import Link from 'next/link';
import { redirect } from 'next/navigation';
import { me } from '@/lib/auth';
import { login } from './actions';
import BodyClass from '@/components/BodyClass';
import Notice from '@/components/Notice';

export const metadata = { title: 'Log in | RCEF Monitor' };

export default async function LoginPage({ searchParams }) {
  if (await me()) redirect('/dashboard');
  return (
    <>
      <BodyClass name="auth" />
      <section className="auth-card">
        <h2>LUZON A CLUSTER</h2>
        <Notice ok={searchParams?.message} error={searchParams?.error} />
        <form action={login}>
          <label>Username</label>
          <input name="username" required autoComplete="username" />
          <label>Password</label>
          <input type="password" name="password" required autoComplete="current-password" />
          <button className="btn primary full">Log in</button>
        </form>
        <p className="auth-links">
          <Link href="/forgot_password">Forgot password?</Link> ·{' '}
          <Link href="/register">Create account</Link>
        </p>
      </section>
    </>
  );
}
