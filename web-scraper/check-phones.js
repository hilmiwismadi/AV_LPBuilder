import Database from 'better-sqlite3';

const db = new Database('./crm-events.db');

const stats = db.prepare(`
  SELECT COUNT(*) as total
  FROM scraped_posts
  WHERE phone_number IS NOT NULL AND phone_number != ''
`).get();

const phones = db.prepare(`
  SELECT id, event_title, phone_number
  FROM scraped_posts
  WHERE phone_number IS NOT NULL AND phone_number != ''
  LIMIT 25
`).all();

console.log('Total posts with scraped phone numbers:', stats.total);
console.log('\nFirst 21 phone numbers from database:');
phones.slice(0, 21).forEach((p, i) => {
  console.log(`${i+1}. ${p.phone_number} (ID: ${p.id})`);
});

db.close();
