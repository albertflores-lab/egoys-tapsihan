// api/orders.js — Order management
// POST /api/orders                   → place new order (public)
// GET  /api/orders                   → all orders (admin)
// GET  /api/orders?user=me           → current user's orders (auth)
// PUT  /api/orders?id=X&status=done  → update status (admin)

const { getPool }                     = require('./_db');
const { requireAuth, requireAdmin, verifyToken, setCors } = require('./_auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pool = getPool();

  // ===== POST — Place Order (public) =====
  if (req.method === 'POST') {
    const { items, customer_name, phone, address, barangay, city,
            order_type, pay_method, notes, user_id } = req.body || {};

    if (!items || !items.length)
      return res.status(400).json({ error: 'No items in order' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const subtotal     = items.reduce((s, i) => s + (i.price * i.qty), 0);
      const delivery_fee = order_type === 'delivery' ? 50 : 0;
      const service_fee  = 10;
      const total        = subtotal + delivery_fee + service_fee;
      const order_number = '#ETL-' + String(Math.floor(1000 + Math.random() * 9000));

      const orderRes = await client.query(
        `INSERT INTO orders
           (order_number, user_id, customer_name, phone, address,
            barangay, city, order_type, pay_method, status,
            subtotal, delivery_fee, service_fee, total, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING *`,
        [order_number, user_id || null,
         customer_name || 'Walk-in', phone || '', address || '',
         barangay || '', city || '',
         order_type || 'pickup', pay_method || 'cash', 'pending',
         subtotal, delivery_fee, service_fee, total, notes || '']
      );
      const order = orderRes.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items
             (order_id, menu_item_id, item_name, item_emoji, quantity, unit_price, total_price)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [order.id, item.id, item.name, item.emoji || '🍽️',
           item.qty, item.price, item.price * item.qty]
        );
      }

      await client.query('COMMIT');
      return res.status(201).json({
        order_number: order.order_number,
        total,
        order_id: order.id
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Order POST error:', err);
      return res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }

  // ===== GET =====
  if (req.method === 'GET') {
    const { user: userParam } = req.query;

    // User's own orders
    if (userParam === 'me') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;
      try {
        const result = await pool.query(
          `SELECT o.*,
             (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = o.id) AS items
           FROM orders o
           WHERE o.user_id = $1
           ORDER BY o.created_at DESC`,
          [authUser.id]
        );
        return res.status(200).json(result.rows);
      } catch (err) {
        console.error('User orders error:', err);
        return res.status(500).json({ error: 'Server error' });
      }
    }

    // All orders — admin only
    const admin = requireAdmin(req, res);
    if (!admin) return;
    try {
      const result = await pool.query(
        `SELECT o.*,
           (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = o.id) AS items
         FROM orders o
         ORDER BY o.created_at DESC
         LIMIT 100`
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('All orders error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // ===== PUT — Update status (admin) =====
  if (req.method === 'PUT') {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const { id } = req.query;
    const { status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'ID and status required' });
    try {
      const result = await pool.query(
        'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
        [status, id]
      );
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Order status error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
