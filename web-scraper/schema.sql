-- Enhanced database schema for Instagram scraper with CRM fields
CREATE TABLE IF NOT EXISTS scraped_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Scraped data (automatically filled)
  post_url TEXT NOT NULL UNIQUE,
  post_date TEXT,
  caption TEXT,
  phone_number TEXT,
  phone_number_1 TEXT,
  phone_number_2 TEXT,
  event_title TEXT,
  source_account TEXT,
  image_url TEXT,
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- CRM fields (manually filled by sales team)
  event_organizer TEXT,
  contact_person_1 TEXT,
  contact_person_2 TEXT,
  event_type TEXT,
  location TEXT,
  next_event_date TEXT,
  price_range TEXT,
  status TEXT DEFAULT 'TODO',
  notes TEXT,
  last_contact_date TEXT,

  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_date ON scraped_posts(post_date);
CREATE INDEX IF NOT EXISTS idx_source_account ON scraped_posts(source_account);
CREATE INDEX IF NOT EXISTS idx_status ON scraped_posts(status);
CREATE INDEX IF NOT EXISTS idx_phone_number ON scraped_posts(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_number_1 ON scraped_posts(phone_number_1);
CREATE INDEX IF NOT EXISTS idx_phone_number_2 ON scraped_posts(phone_number_2);
