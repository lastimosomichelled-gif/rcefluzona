'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, icon, label }) {
  const pathname = usePathname();
  return (
    <Link href={href} title={label} className={pathname === href ? 'active' : ''}>
      <span className="sidebar-icon" aria-hidden="true">{icon}</span>
      <span className="sidebar-link-label">{label}</span>
    </Link>
  );
}
