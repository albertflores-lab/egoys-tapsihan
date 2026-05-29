// api/analytics.js — Sales analytics (admin only)
// GET /api/analytics

const { getPool }               = require('./_db');
const { requireAdmin, setCors } = require('./_auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const pool = getPool();
  try {
    const [ordersToday, topItems, weeklyRevenue, totalStats] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS count, COALESCE(SUM(total),0) AS revenue
        FROM orders
        WHERE DATE(created_at AT TIME ZONE 'Asia/Manila') = CURRENT_DATE
      `),
      pool.query(`
        SELECT item_name, item_emoji, SUM(quantity) AS total_sold
        FROM order_items
        GROUP BY item_name, item_emoji
        ORDER BY total_sold DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT DATE(created_at) AS date,
               COUNT(*) AS orders,
               COALESCE(SUM(total),0) AS revenue
        FROM orders
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
      pool.query(`
        SELECT COUNT(*) AS total_orders,
               COALESCE(SUM(total),0) AS total_revenue
        FROM orders
      `),
    ]);

    return res.status(200).json({
      today:       ordersToday.rows[0],
      top_items:   topItems.rows,
      weekly:      weeklyRevenue.rows,
      all_time:    totalStats.rows[0],
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
