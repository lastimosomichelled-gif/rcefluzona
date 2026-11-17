import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { saveFundSource } from '../../actions';
import PageHeader from '@/components/PageHeader';
import Notice from '@/components/Notice';

export const metadata = { title: 'Fund Sources | RCEF Monitor' };

export default async function FundSourcesPage({ searchParams }) {
  await requireUser();
  const rows = await sql`SELECT * FROM fund_sources ORDER BY fund_year`;
  return (
    <>
      <PageHeader title="Fund Sources · 2019–2031" />
      <section className="content">
        <Notice ok={searchParams?.ok} error={searchParams?.error} />
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>Funding timeline</h3>
              <p>Enter only verified fund-source amounts and notes. Blank amounts are not assumed to be zero.</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Year</th><th>Fund source</th><th>Amount (₱)</th><th>Notes</th><th>Save</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.fund_year}>
                    <td><strong>{r.fund_year}</strong></td>
                    <td><input name="fund_source" form={`f${r.fund_year}`} defaultValue={r.fund_source} required /></td>
                    <td>
                      <input type="number" min="0" step="0.01" name="amount" form={`f${r.fund_year}`}
                        defaultValue={r.amount ?? ''} placeholder="Not entered" />
                    </td>
                    <td><input name="notes" form={`f${r.fund_year}`} defaultValue={r.notes ?? ''} placeholder="Optional note" /></td>
                    <td>
                      <form id={`f${r.fund_year}`} action={saveFundSource}>
                        <input type="hidden" name="fund_year" value={r.fund_year} />
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
