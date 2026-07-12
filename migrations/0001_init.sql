PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  app_name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  pig_name TEXT NOT NULL,
  pear_name TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  welcome_title TEXT NOT NULL,
  welcome_description TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  accent_color TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('positive', 'negative')),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  delta INTEGER NOT NULL CHECK (delta <> 0),
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost > 0),
  description TEXT,
  accent_color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  threshold INTEGER NOT NULL CHECK (threshold >= 0),
  badge_emoji TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('rule', 'manual', 'reward')),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  delta INTEGER NOT NULL,
  growth_delta INTEGER NOT NULL DEFAULT 0 CHECK (growth_delta >= 0),
  note TEXT,
  source_rule_id INTEGER REFERENCES rules(id) ON DELETE SET NULL,
  source_reward_id INTEGER REFERENCES rewards(id) ON DELETE SET NULL,
  points_after INTEGER NOT NULL,
  growth_after INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order, id);
CREATE INDEX IF NOT EXISTS idx_rules_sort_order ON rules(sort_order, id);
CREATE INDEX IF NOT EXISTS idx_rewards_sort_order ON rewards(sort_order, id);
CREATE INDEX IF NOT EXISTS idx_levels_threshold ON levels(threshold, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_quotes_sort_order ON quotes(sort_order, id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC, id DESC);
