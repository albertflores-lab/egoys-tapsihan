const { getPool } = require('./_db');
const { requireAdmin, setCors } = require('./_auth');

const DEFAULT_MENU = [
  { id: 1, name: "Unlimited Lugaw",  category: "bestseller", price: 59,  description: "Unli rice porridge + egg + chicharon",      emoji: "🍚", image_url: "" },
  { id: 2, name: "LiempoSiLog",      category: "bestseller", price: 99,  description: "Grilled Liempo + Garlic Rice + Egg",         emoji: "🍖", image_url: "" },
  { id: 3, name: "TapsiLog",         category: "tapsilog",   price: 85,  description: "Classic Tapa, sinangag, itlog",              emoji: "🍳", image_url: "" },
  { id: 4, name: "Pork SiLog",       category: "tapsilog",   price: 85,  description: "Juicy Pork Chop + sinangag + egg",           emoji: "🥩", image_url: "" },
  { id: 5, name: "Chicken SiLog",    category: "tapsilog",   price: 85,  description: "Grilled Chicken + garlic rice + egg",        emoji: "🍗", image_url: "" },
  { id: 6, name: "Special Lugaw",    category: "lugaw",      price: 49,  description: "Loaded with egg, chicken, chicharon",        emoji: "🥣", image_url: "" },
  { id: 7, name: "Plain Lugaw",      category: "lugaw",      price: 35,  description: "Classic rice porridge, simple and comforting", emoji: "🍜", image_url: "" },
  { id: 8, name: "Extra Egg",        category: "addon",      price: 15,  description: "Fried egg add-on",                           emoji: "🥚", image_url: "" },
  { id: 9, name: "Extra Rice",       category: "addon",      price: 20,  description: "Garlic fried rice add-on",                   emoji: "🍚", image_url: "" },
  { id: 10, name: "Chicharon",       category: "addon",      price: 20,  description: "Crispy pork skin topping",                   emoji: "🧂", image_url: "" },
];

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const pool = getPool();

  if (req.method === "GET") {
    try {
      const result = await pool.query(
        `SELECT id, name, category, price, description, emoji, COALESCE(image_url,'') AS image_url
         FROM menu_items WHERE is_active = true ORDER BY id`
      );
      if (result.rows.length > 0) {
        return res.status(200).json({ success: true, menu: result.rows });
      }
    } catch (e) {
      // DB unavailable — use defaults
    }
    return res.status(200).json({ success: true, menu: DEFAULT_MENU });
  }

  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "POST") {
    const { name, category, price, description, emoji, image_url } = req.body || {};
    if (!name) return res.status(400).json({ error: "name is required" });
    try {
      const result = await pool.query(
        `INSERT INTO menu_items (name, category, price, description, emoji, image_url)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, category, price, description, emoji, image_url`,
        [name, category || 'tapsilog', price || 0, description || '', emoji || '🍽️', image_url || '']
      );
      return res.status(201).json({ success: true, item: result.rows[0] });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create menu item: ' + e.message });
    }
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    const { name, category, price, description, emoji, image_url } = req.body || {};
    if (!id) return res.status(400).json({ error: "?id=X required" });
    try {
      const fields = []; const vals = []; let idx = 1;
      if (name !== undefined) { fields.push(`name = $${idx++}`); vals.push(name); }
      if (category !== undefined) { fields.push(`category = $${idx++}`); vals.push(category); }
      if (price !== undefined) { fields.push(`price = $${idx++}`); vals.push(price); }
      if (description !== undefined) { fields.push(`description = $${idx++}`); vals.push(description); }
      if (emoji !== undefined) { fields.push(`emoji = $${idx++}`); vals.push(emoji); }
      if (image_url !== undefined) { fields.push(`image_url = $${idx++}`); vals.push(image_url); }
      fields.push(`updated_at = NOW()`);
      vals.push(id);
      const result = await pool.query(
        `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, category, price, description, emoji, image_url`,
        vals
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Menu item not found' });
      return res.status(200).json({ success: true, item: result.rows[0] });
    } catch (e) {
      return res.status(500).json({ error: 'Update failed: ' + e.message });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "?id=X required" });
    try {
      await pool.query('UPDATE menu_items SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Delete failed: ' + e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
