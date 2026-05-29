const { getPool } = require('./_db');
const { requireAdmin, setCors } = require('./_auth');

const DEFAULT_CONFIG = {
  name:     "Egoy's Tapsihan Lugawan",
  tag:      "24/7 Tapsilugan at Unlimited Lugawan",
  slogan:   "UNLIMITED LUGAW, MURA, MASARAP AT BABALIK BALIKAN",
  phone:    "+63 917 XXX XXXX",
  addr:     "123 Quirino Highway, Brgy. Talipapa, Quezon City",
  email:    "egoys@tapsihan.ph",
  gcash:    "09XX XXX XXXX",
  story:    "What started as a small turo-turo in Quezon City has grown into one of the most beloved tapsilogan in the area. Founded by Aldrin 'Egoy' Perez, we serve over 500 orders daily.",
  mission:  "To serve authentic, affordable Filipino comfort food to every Filipino — students, workers, and families — 24 hours a day.",
  vision:   "To become the go-to tapsilogan brand in Metro Manila, known for consistent quality, speed, and a Filipino dining experience that never sleeps.",
  services: "Dine-In, Take-Out / Pickup, Delivery, Catering",
  hours:    "Open 24/7 — 365 days a year",
  delivery: { available: true, fee: 50, freeAbove: 500, eta: "30–45 mins" },
  social:   { facebook: "", instagram: "", twitter: "" },
};

const KEY_MAP = {
  name: 'biz_name', tag: 'biz_tag', phone: 'biz_phone', addr: 'biz_addr',
  email: 'biz_email', gcash: 'biz_gcash', story: 'biz_story',
  mission: 'biz_mission', vision: 'biz_vision', services: 'biz_services',
};

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const pool = getPool();

  if (req.method === "GET") {
    try {
      const result = await pool.query('SELECT key, value FROM business_config');
      if (result.rows.length > 0) {
        const config = { ...DEFAULT_CONFIG };
        result.rows.forEach(r => {
          const k = r.key.replace(/^biz_/, '');
          config[k] = r.value;
        });
        return res.status(200).json({ success: true, config });
      }
    } catch (e) { /* fall through */ }
    return res.status(200).json({ success: true, config: DEFAULT_CONFIG });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const admin = requireAdmin(req, res);
  if (!admin) return;

  const { config } = req.body || {};
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ error: 'config object required in body' });
  }

  try {
    for (const [key, value] of Object.entries(config)) {
      const dbKey = KEY_MAP[key] || `biz_${key}`;
      await pool.query(
        `INSERT INTO business_config (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [dbKey, String(value)]
      );
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save config: ' + e.message });
  }
};
