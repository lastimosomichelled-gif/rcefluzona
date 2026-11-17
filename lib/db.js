import postgres from 'postgres';

// Reuse one connection across hot reloads in dev.
const g = globalThis;
export const sql =
  g.__rcefSql ?? postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 20 });
if (process.env.NODE_ENV !== 'production') g.__rcefSql = sql;
