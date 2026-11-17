import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { updateUser } from '../../actions';
import PageHeader from '@/components/PageHeader';
import Notice from '@/components/Notice';

export const metadata = { title: 'User Management | RCEF Monitor' };

export default async function UsersPage({ searchParams }) {
  await requireAdmin();
  const rows = await sql`
    SELECT id, username, email, full_name, region, role, is_active
    FROM users ORDER BY created_at DESC`;
  return (
    <>
      <PageHeader title="User Management" />
      <section className="content">
        <Notice ok={searchParams?.ok} error={searchParams?.error} />
        <section className="panel">
          <h3>Team accounts</h3>
          <p className="muted">
            New registrations are staff accounts. Only admins can delete machinery records or manage roles.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name / username</th><th>Email</th><th>Region</th>
                  <th>Role</th><th>Active</th><th>Save</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.full_name} <small>{r.username}</small></td>
                    <td>{r.email}</td>
                    <td>{r.region}</td>
                    <td>
                      <select name="role" form={`u${r.id}`} defaultValue={r.role}>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td><input type="checkbox" name="active" form={`u${r.id}`} defaultChecked={r.is_active} /></td>
                    <td>
                      <form id={`u${r.id}`} action={updateUser}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="btn secondary">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </>
  );
}
