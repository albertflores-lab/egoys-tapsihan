// api/menu-image.js — Upload image for a menu item
// POST /api/menu-image?id=X
// Body: { image_url: 'data:image/jpeg;base64,...' }

const { getPool }               = require('./_db');
const { requireAdmin, setCors } = require('./_auth');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  const { image_url } = req.body || {};

  if (!id)        return res.status(400).json({ error: 'Menu item ID required (?id=X)' });
  if (!image_url) return res.status(400).json({ error: 'image_url required in body' });
  if (!image_url.startsWith('data:image/')) {
    return res.status(400).json({ error: 'image_url must be a base64 data URL (data:image/...)' });
  }

  const pool = getPool();
  try {
    const mimeMatch = image_url.match(/^data:([^;]+);base64,/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // Check item exists first
    const check = await pool.query('SELECT id FROM menu_items WHERE id = $1', [id]);
    if (!check.rows.length) return res.status(404).json({ error: `Menu item ${id} not found` });

    // Save to uploaded_images log
    await pool.query(
      `INSERT INTO uploaded_images (type, filename, data, mime_type)
       VALUES ('menu_item', $1, $2, $3)`,
      [`item_${id}_${Date.now()}`, image_url, mime]
    );

    // Update the menu item's image_url
    const result = await pool.query(
      'UPDATE menu_items SET image_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, image_url',
      [image_url, id]
    );

    return res.status(200).json({
      success: true,
      item: result.rows[0],
      image_url,
    });
  } catch (err) {
    console.error('Menu image upload error:', err.message);
    return res.status(500).json({ error: 'Image upload failed: ' + err.message });
  }
};
