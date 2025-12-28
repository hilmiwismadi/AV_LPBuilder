import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'crm-events.db');

console.log('\n📊 Adding tagged account columns to database...\n');

const db = new Database(dbPath);

try {
  // Add new columns for tagged/mentioned accounts
  const columnsToAdd = [
    { name: 'tagged_accounts', type: 'TEXT' }, // JSON array of {username, name, profileUrl}
    { name: 'organizer_ig', type: 'TEXT' },   // Primary organizer Instagram handle
    { name: 'organizer_name', type: 'TEXT' }  // Primary organizer name
  ];

  for (const column of columnsToAdd) {
    try {
      db.exec(`ALTER TABLE scraped_posts ADD COLUMN ${column.name} ${column.type}`);
      console.log(`✓ Added column: ${column.name}`);
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log(`  Column ${column.name} already exists`);
      } else {
        console.error(`✗ Error adding column ${column.name}:`, error.message);
      }
    }
  }

  console.log('\n✅ Database schema updated successfully!\n');

  // Show current schema
  const tableInfo = db.prepare('PRAGMA table_info(scraped_posts)').all();
  console.log('Current columns:');
  tableInfo.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });

} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}
