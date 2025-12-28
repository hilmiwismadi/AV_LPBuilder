import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'events.db');
const db = new Database(dbPath);

// Create events table
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_title TEXT NOT NULL,
    instagram_link TEXT NOT NULL UNIQUE,
    post_date TEXT,
    caption TEXT,
    phone_number TEXT,
    is_free_event BOOLEAN DEFAULT 0,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_account TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_post_date ON events(post_date);
  CREATE INDEX IF NOT EXISTS idx_source_account ON events(source_account);
  CREATE INDEX IF NOT EXISTS idx_is_free_event ON events(is_free_event);
`);

console.log('Database initialized successfully at:', dbPath);
console.log('Table "events" created with columns:');
console.log('- id: Auto-incrementing primary key');
console.log('- event_title: Event name/title');
console.log('- instagram_link: Post URL');
console.log('- post_date: Date of Instagram post');
console.log('- caption: Full caption text');
console.log('- phone_number: Extracted phone number (if any)');
console.log('- is_free_event: Boolean flag for free events');
console.log('- scraped_at: Timestamp when data was scraped');
console.log('- source_account: Instagram account that posted it');

db.close();
