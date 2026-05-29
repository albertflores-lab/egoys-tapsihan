// api/health.js — Health check
// GET /api/health

const { getPool } = require('./_db');
const { setCors } = require('./_auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pool = getPool();
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      status:  'ok',
      db:      'connected',
      service: "Egoy's Tapsihan API",
      version: '2.0.0',
      host:    'Vercel + Supabase',
      time:    new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
};
