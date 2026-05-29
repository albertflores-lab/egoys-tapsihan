// api/_db.js — Supabase PostgreSQL connection for Vercel serverless
// Uses Session Pooler (port 5432) — set DATABASE_URL in Vercel env vars

const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) {
      throw new Error('DATABASE_URL environment variable is not set. Add it in Vercel → Settings → Environment Variables.');
    }

    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }, // Required for Supabase
      max: 3,                  // Keep low for serverless cold starts
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected DB pool error:', err.message);
      pool = null; // Reset so next request gets a fresh pool
    });
  }
  return pool;
}

module.exports = { getPool };
