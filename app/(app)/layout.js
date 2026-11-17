import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { logout } from '../actions';
import BodyClass from '@/components/BodyClass';
import NavLink from '@/components/NavLink';
import SidebarController from '@/components/SidebarController';

export default async function AppLayout({ children }) {
  const u = await requireUser();
  return (
    <>
      <BodyClass name="app-page" />
      <SidebarController />
      <aside className="sidebar" id="app-sidebar">
        <div className="sidebar-top">
          <Link className="sidebar-brand" href="/dashboard" aria-label="RCEF Monitor dashboard">
            <span className="sidebar-brand-mark" aria-hidden="true">♙</span>
            <strong>{u.full_name}</strong>
          </Link>
          <button className="sidebar-toggle" type="button" aria-label="Close navigation" aria-controls="app-sidebar" aria-expanded="true">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <nav>
          <div className="sidebar-section">
            <span className="sidebar-section-title">Main Menu</span>
            <NavLink href="/dashboard" icon="⌂" label="Dashboard" />
          </div>
          <div className="sidebar-section">
            <span className="sidebar-section-title">General</span>
            <NavLink href="/machinery" icon="▦" label="Machinery records" />
            <NavLink href="/fca_documents" icon="▤" label="FCA Documents" />
            <NavLink href="/fca_requirements" icon="▤" label="FCA Requirements" />
            <NavLink href="/fund_sources" icon="₱" label="Fund sources" />
            {u.role === 'admin' ? <NavLink href="/users" icon="♙" label="User management" /> : null}
          </div>
        </nav>
        <div className="side-user">
          <span className="side-user-avatar" aria-hidden="true">♙</span>
          <span className="side-user-details">
            <strong>{u.full_name}</strong>
            <small>{u.role} · {u.region || 'All regions'}</small>
          </span>
          <form action={logout} style={{ display: 'contents' }}>
            <button className="side-user-logout" title="Log out" aria-label="Log out" style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
              <span aria-hidden="true">↪</span>
              <span className="sidebar-link-label">Log out</span>
            </button>
          </form>
        </div>
      </aside>
      <button className="sidebar-backdrop" type="button" aria-label="Close navigation" tabIndex={-1} />
      <main className="main">
        {children}
        <footer>RCEF Machinery Monitoring · Internal team use</footer>
      </main>
    </>
  );
}
