-- =============================================
-- EGOY'S TAPSIHAN LUGAWAN — Supabase SQL Setup
-- Run this ENTIRE file in Supabase SQL Editor
-- =============================================

-- ===== DISABLE RLS (safe for public-food-app use) =====
-- The app uses client-side auth — Supabase RLS would block writes.
ALTER TABLE IF EXISTS menu_items      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_config  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS uploaded_images  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders           DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users            DISABLE ROW LEVEL SECURITY;

-- ===== TABLES =====

CREATE TABLE IF NOT EXISTS menu_items (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  category    VARCHAR(50)  NOT NULL DEFAULT 'tapsilog',
  price       INTEGER      NOT NULL DEFAULT 0,
  description TEXT,
  emoji       VARCHAR(10)  DEFAULT '🍽️',
  image_url   TEXT,
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name     VARCHAR(100),
  phone         VARCHAR(30),
  role          VARCHAR(20)  DEFAULT 'customer',
  avatar        VARCHAR(10)  DEFAULT 'GU',
  provider      VARCHAR(30)  DEFAULT 'local',
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL PRIMARY KEY,
  order_number  VARCHAR(20)  UNIQUE NOT NULL,
  user_id       BIGINT       REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(100),
  phone         VARCHAR(30),
  address       TEXT,
  barangay      VARCHAR(100),
  city          VARCHAR(100),
  order_type    VARCHAR(20)  DEFAULT 'pickup',
  pay_method    VARCHAR(30)  DEFAULT 'cash',
  status        VARCHAR(30)  DEFAULT 'pending',
  subtotal      INTEGER      DEFAULT 0,
  delivery_fee  INTEGER      DEFAULT 0,
  service_fee   INTEGER      DEFAULT 10,
  total         INTEGER      DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     BIGINT  REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id BIGINT  REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name    VARCHAR(100),
  item_emoji   VARCHAR(10),
  quantity     INTEGER DEFAULT 1,
  unit_price   INTEGER DEFAULT 0,
  total_price  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS business_config (
  id         BIGSERIAL PRIMARY KEY,
  key        VARCHAR(100) UNIQUE NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploaded_images (
  id         BIGSERIAL PRIMARY KEY,
  type       VARCHAR(50)  NOT NULL,
  filename   VARCHAR(255) NOT NULL,
  data       TEXT         NOT NULL,
  mime_type  VARCHAR(50)  DEFAULT 'image/jpeg',
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ===== INDEXES =====

CREATE INDEX IF NOT EXISTS idx_orders_user        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_category      ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_active        ON menu_items(is_active);

-- ===== SEED: MENU ITEMS =====

INSERT INTO menu_items (name, category, price, description, emoji) VALUES
  ('Unlimited Lugaw',  'bestseller', 59,  'Unli rice porridge + egg + chicharon',   '🍚'),
  ('LiempoSiLog',      'bestseller', 99,  'Grilled Liempo + Garlic Rice + Egg',      '🥩'),
  ('TapsiLog',         'tapsilog',   85,  'Classic Tapa, sinangag, itlog',            '🍳'),
  ('Pork SiLog',       'tapsilog',   85,  'Juicy Pork Chop + sinangag + egg',         '🍖'),
  ('Chicken SiLog',    'tapsilog',   85,  'Grilled Chicken + garlic rice + egg',      '🍗'),
  ('Special Lugaw',    'lugaw',      49,  'Loaded with egg, chicken, chicharon',      '🥣'),
  ('Plain Lugaw',      'lugaw',      35,  'Classic rice porridge, simple and comforting', '🍜'),
  ('Extra Egg',        'addon',      15,  'Fried egg add-on',                         '🥚'),
  ('Extra Rice',       'addon',      20,  'Garlic fried rice add-on',                 '🍙'),
  ('Chicharon',        'addon',      20,  'Crispy pork skin topping',                 '🧂')
ON CONFLICT DO NOTHING;

-- ===== SEED: USERS =====
INSERT INTO users (email, password_hash, full_name, role, avatar) VALUES
  ('admin@egoys.com', '$2a$10$rBV2JDeWW3.vKyeQcpbpIOdlBR3P7Li9gZLVMbQGzOaWK0Q5WKlNG', 'Aldrin Perez', 'admin', 'AP'),
  ('guest@egoys.com', '$2a$10$7HBEv/v9XpNe5iRSaBQeT.NsBmhXQaTq8MdVluRWmVYlXMHkq/OKe', 'Guest User', 'customer', 'GU')
ON CONFLICT (email) DO NOTHING;

-- ===== SEED: BUSINESS CONFIG =====

INSERT INTO business_config (key, value) VALUES
  ('biz_name',    'Egoy''s Tapsihan Lugawan'),
  ('biz_tag',     '24/7 Tapsilugan at Unlimited Lugawan'),
  ('biz_phone',   '+63 917 XXX XXXX'),
  ('biz_addr',    '123 Quirino Highway, Brgy. Talipapa, Quezon City'),
  ('biz_email',   'egoys@tapsihan.ph'),
  ('biz_gcash',   '09XX XXX XXXX'),
  ('biz_story',   'What started as a small turo-turo in Quezon City has grown into one of the most beloved tapsilogan in the area. Founded by Aldrin "Egoy" Perez, we serve over 500 orders daily.'),
  ('biz_mission', 'To serve authentic, affordable Filipino comfort food to every Filipino — students, workers, and families — 24 hours a day, with the warmth of a home-cooked meal.'),
  ('biz_vision',  'To become the go-to tapsilogan brand in Metro Manila, known for consistent quality, speed, and a Filipino dining experience that never sleeps.'),
  ('biz_services','Dine-In, Take-Out / Pickup, Delivery'),
  ('founded_year','2023')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- Done! Tables, RLS, indexes, and seed data ready.
-- =============================================
