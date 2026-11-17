import Link from 'next/link';
import { sql } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import ChartBox from '@/components/ChartBox';

export const metadata = { title: 'Dashboard | RCEF Monitor' };

const YEARS = Array.from({ length: 13 }, (_, i) => 2019 + i);
const DOC_KEYS = ['eval', 'val', 'letter', 'board', 'certacc', 'members', 'mach'];
const REQ_DEFS = {
  moa: ['MOA', ['moa_target', 'moa_signed', 'moa_transmitted', 'moa_received', 'moa_distributed']],
  cod: ['COD', ['cod_target', 'cod_signed', 'cod_transmitted', 'cod_received', 'cod_distributed']],
  dod: ['DOD', ['dod_target', 'dod_signed', 'dod_transmitted', 'dod_received', 'dod_distributed']],
  members: ['Members', ['mem_target', 'mem_uploaded']],
};
const nf = (n) => Number(n || 0).toLocaleString('en-US');

export default async function DashboardPage({ searchParams }) {
  const u = await requireUser();

  const raw = String(searchParams?.fund_year ?? '').trim();
  const yearNum = /^\d{4}$/.test(raw) && +raw >= 2019 && +raw <= 2031 ? +raw : null;
  const year = yearNum ? String(yearNum) : '';
  const where = yearNum ? sql`WHERE fund_year = ${yearNum}` : sql``;
  const whereM = yearNum ? sql`WHERE m.fund_year = ${yearNum}` : sql``;

  const [s] = await sql`
    SELECT COUNT(*)::int AS records,
      COALESCE(SUM(quantity),0)::int AS units,
      COUNT(*) FILTER (WHERE status = 'Functional')::int AS functional,
      COUNT(*) FILTER (WHERE status = 'Operational')::int AS operational,
      COUNT(*) FILTER (WHERE status = 'Non-Operational')::int AS nonop,
      COUNT(DISTINCT NULLIF(province,''))::int AS provinces
    FROM machinery ${where}`;

  const regions = await sql`
    SELECT region, COUNT(*)::int AS records, COALESCE(SUM(quantity),0)::int AS units
    FROM machinery ${where} GROUP BY region ORDER BY region`;

  const deliveryData = await sql`
    SELECT m.fund_year, MAX(fs.fund_source) AS src, COALESCE(SUM(m.quantity),0)::int AS total_units
    FROM machinery m LEFT JOIN fund_sources fs ON fs.fund_year = m.fund_year
    ${whereM}
    GROUP BY m.fund_year ORDER BY m.fund_year ASC NULLS LAST`;
  const deliveryLabels = deliveryData.map((r) =>
    r.fund_year === null ? 'Not specified' : `${r.src || 'Fund'} ${r.fund_year}`.trim());
  const deliveryUnits = deliveryData.map((r) => r.total_units);

  const statusMap = { Functional: s.functional, Operational: s.operational, 'Non-Operational': s.nonop };
  const statusTotal = s.functional + s.operational + s.nonop;

  // FCA progress
  const fcaRows = await sql`
    SELECT d.eval, d.val, d.letter, d.board, d.certacc, d.members, d.mach,
      COALESCE(c.moa_target,0) AS moa_target, COALESCE(c.moa_signed,0) AS moa_signed,
      COALESCE(c.moa_transmitted,0) AS moa_transmitted, COALESCE(c.moa_received,0) AS moa_received,
      COALESCE(c.moa_distributed,0) AS moa_distributed,
      COALESCE(c.cod_target,0) AS cod_target, COALESCE(c.cod_signed,0) AS cod_signed,
      COALESCE(c.cod_transmitted,0) AS cod_transmitted, COALESCE(c.cod_received,0) AS cod_received,
      COALESCE(c.cod_distributed,0) AS cod_distributed,
      COALESCE(c.dod_target,0) AS dod_target, COALESCE(c.dod_signed,0) AS dod_signed,
      COALESCE(c.dod_transmitted,0) AS dod_transmitted, COALESCE(c.dod_received,0) AS dod_received,
      COALESCE(c.dod_distributed,0) AS dod_distributed,
      COALESCE(c.mem_target,0) AS mem_target, COALESCE(c.mem_uploaded,0) AS mem_uploaded
    FROM fca_documents d LEFT JOIN fca_checklists c ON c.fca_id = d.id`;

  const docTotal = fcaRows.length;
  let docSteps = 0;
  let docFull = 0;
  for (const r of fcaRows) {
    const n = DOC_KEYS.reduce((a, k) => a + Number(r[k]), 0);
    docSteps += n;
    if (n === DOC_KEYS.length) docFull++;
  }
  const docPct = docTotal ? Math.round((100 * docSteps) / (docTotal * DOC_KEYS.length)) : 0;
  const fullPct = docTotal ? Math.round((100 * docFull) / docTotal) : 0;

  const reqStats = Object.entries(REQ_DEFS).map(([t, [label, keys]]) => {
    let targets = 0;
    let full = 0;
    for (const r of fcaRows) {
      if (!Number(r[keys[0]])) continue;
      targets++;
      const done = keys.slice(1).reduce((a, k) => a + Number(r[k]), 0);
      if (done === keys.length - 1) full++;
    }
    return { t, label, targets, full, pct: targets ? Math.round((100 * full) / targets) : 0 };
  });

  const stats = [
    ['Machinery records', s.records],
    ['Total units', s.units],
    ['Functional', s.functional],
    ['Operational', s.operational],
    ['Non-Operational', s.nonop],
    ['Provinces covered', s.provinces],
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <section className="content">
        <div className="hero">
          <div>
            <small>REGIONAL EQUIPMENT OVERVIEW</small>
            <h2>Good day, {u.full_name}!</h2>
          </div>
          <Link className="btn white" href="/machinery">+ Add machinery</Link>
        </div>

        <section className="panel">
          <form className="filters" method="get">
            <label htmlFor="fund_year">Fund year</label>
            <select id="fund_year" name="fund_year" defaultValue={year}>
              <option value="">All years (2019–2031)</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn secondary">Apply filter</button>
            <Link className="btn secondary" href="/dashboard">Clear</Link>
          </form>
        </section>

        <div className="stats">
          {stats.map(([label, value]) => (
            <div className="stat" key={label}>
              <small>{label}</small>
              <strong>{nf(value)}</strong>
              <span>{year ? `Fund year ${year}` : 'Across all years'}</span>
            </div>
          ))}
        </div>

        <div className="columns">
          <section className="panel">
            <div className="panel-title"><div>
              <h3>Units delivered per fund source</h3>
              <p>Total units per fund source</p>
            </div></div>
            {deliveryLabels.length === 0 ? (
              <p className="empty">No machinery records yet. Add machinery with a fund year to see units per fund source.</p>
            ) : (
              <ChartBox kind="bar" labels={deliveryLabels} data={deliveryUnits} />
            )}
          </section>
          <section className="panel">
            <div className="panel-title"><div>
              <h3>Machinery status</h3>
              <p>Number of records per status</p>
            </div></div>
            {statusTotal === 0 ? (
              <p className="empty">No records yet.</p>
            ) : (
              <ChartBox kind="doughnut" labels={Object.keys(statusMap)} data={Object.values(statusMap)} />
            )}
          </section>
        </div>

        <div className="columns">
          <section className="panel">
            <div className="panel-title">
              <div>
                <h3>Machinery by region</h3>
                <p>Record count and total quantity</p>
              </div>
              <Link href="/machinery">View records →</Link>
            </div>
            {regions.length === 0 ? (
              <p className="empty">No records yet. Add machinery or select another year.</p>
            ) : regions.map((r) => (
              <div className="region-row" key={r.region}>
                <div>
                  <strong>{r.region}</strong>
                  <small>{nf(r.units)} units</small>
                </div>
                <span className="tag">{nf(r.records)} records</span>
              </div>
            ))}
          </section>
          <section className="panel">
            <div className="panel-title"><div>
              <h3>Fund year coverage</h3>
              <p>Filter the dashboard by year from 2019 to 2031</p>
            </div></div>
            <div className="years">
              {YEARS.map((y) => (
                <Link key={y} href={`/dashboard?fund_year=${y}`} className={String(y) === year ? 'selected-year' : ''}>
                  <strong>{y}</strong>
                  <small>View</small>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>FCA document monitoring</h3>
              <p>Complete = Eval, Val, Letter, Board, CertAcc, Members and Mach all ticked</p>
            </div>
            <Link href="/fca_documents">View FCA documents →</Link>
          </div>
          <div className="stats">
            <div className="stat">
              <small>Documents complete</small>
              <strong>{docPct}%</strong>
              <div className="pbar"><i style={{ width: `${docPct}%` }} /></div>
              <span>Ticked steps across all FCAs</span>
            </div>
            <div className="stat">
              <small>Fully complete FCAs</small>
              <strong>{nf(docFull)} / {nf(docTotal)}</strong>
              <div className="pbar"><i style={{ width: `${fullPct}%` }} /></div>
              <span>Eval → Mach complete</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>FCA Requirements Checklist</h3>
              <p>% complete = target FCAs with all steps ticked ÷ all target FCAs</p>
            </div>
            <Link href="/fca_requirements">View checklist →</Link>
          </div>
          <div className="stats">
            {reqStats.map((st) => (
              <Link className="stat stat-link" key={st.t} href={`/fca_requirements?type=${st.t}`}>
                <small>{st.label}</small>
                <strong>{st.pct}%</strong>
                <div className="pbar"><i style={{ width: `${st.pct}%` }} /></div>
                <span>{st.full} / {st.targets} target FCAs fully complete</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
