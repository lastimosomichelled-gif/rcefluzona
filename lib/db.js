import postgres from 'postgres';

const g = globalThis;
export const sql =
  g.__rcefSql ?? 
  postgres(process.env.DATABASE_URL, { 
    max: 1, 
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: 'require',
  });
if (process.env.NODE_ENV !== 'production') 
  g.__rcefSql = sql;
