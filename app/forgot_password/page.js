import Link from 'next/link';
import BodyClass from '@/components/BodyClass';

export const metadata = { title: 'Forgot password | RCEF Monitor' };

export default function ForgotPasswordPage() {
  return (
    <>
      <BodyClass name="auth solo" />
      <section className="auth-card">
        <h2>Forgot password?</h2>
        <p className="muted">
          Email-based password reset is not enabled yet. Please ask an administrator to help you.
        </p>
        <p className="auth-links"><Link href="/">Back to login</Link></p>
      </section>
    </>
  );
}
