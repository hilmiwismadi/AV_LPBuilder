import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'crm-events.db');

console.log('\n🔄 Phone Number Migration Script\n');
console.log('This script will:');
console.log('1. Check if phone_number_2 column exists');
console.log('2. Add phone_number_1 and phone_number_2 columns if needed');
console.log('3. Copy data from phone_number to phone_number_2');
console.log('4. Keep phone_number column for backwards compatibility\n');

if (!existsSync(dbPath)) {
  console.log('❌ Database not found at:', dbPath);
  console.log('Please run the scraper first to create the database.\n');
  process.exit(1);
}

const db = new Database(dbPath);

try {
  // Check current schema
  const columns = db.prepare("PRAGMA table_info(scraped_posts)").all();
  const columnNames = columns.map(col => col.name);

  console.log('📊 Current columns:', columnNames.join(', '));

  // Check if phone_number_2 exists
  const hasPhone1 = columnNames.includes('phone_number_1');
  const hasPhone2 = columnNames.includes('phone_number_2');
  const hasOldPhone = columnNames.includes('phone_number');

  console.log('\n📱 Phone columns status:');
  console.log('  - phone_number (old):', hasOldPhone ? '✓ Exists' : '✗ Not found');
  console.log('  - phone_number_1:', hasPhone1 ? '✓ Exists' : '✗ Not found');
  console.log('  - phone_number_2:', hasPhone2 ? '✓ Exists' : '✗ Not found');

  // Add new columns if they don't exist
  if (!hasPhone1) {
    console.log('\n➕ Adding phone_number_1 column...');
    db.exec('ALTER TABLE scraped_posts ADD COLUMN phone_number_1 TEXT');
    console.log('✓ Added phone_number_1');
  }

  if (!hasPhone2) {
    console.log('➕ Adding phone_number_2 column...');
    db.exec('ALTER TABLE scraped_posts ADD COLUMN phone_number_2 TEXT');
    console.log('✓ Added phone_number_2');
  }

  // Check if migration is needed
  const needsMigration = db.prepare(`
    SELECT COUNT(*) as count
    FROM scraped_posts
    WHERE phone_number IS NOT NULL
    AND phone_number != ''
    AND (phone_number_2 IS NULL OR phone_number_2 = '')
  `).get();

  console.log(`\n📊 Records needing migration: ${needsMigration.count}`);

  if (needsMigration.count > 0) {
    console.log('\n🔄 Migrating phone numbers from phone_number to phone_number_2...');

    const result = db.prepare(`
      UPDATE scraped_posts
      SET phone_number_2 = phone_number
      WHERE phone_number IS NOT NULL
      AND phone_number != ''
      AND (phone_number_2 IS NULL OR phone_number_2 = '')
    `).run();

    console.log(`✓ Migrated ${result.changes} phone numbers to phone_number_2`);
  } else {
    console.log('\n✓ No migration needed - all phone numbers already in correct column');
  }

  // Create indexes if they don't exist
  console.log('\n📇 Creating indexes...');
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_phone_number_1 ON scraped_posts(phone_number_1)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_phone_number_2 ON scraped_posts(phone_number_2)');
    console.log('✓ Indexes created');
  } catch (error) {
    console.log('⚠ Indexes might already exist (this is fine)');
  }

  // Show summary
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN phone_number_1 IS NOT NULL AND phone_number_1 != '' THEN 1 ELSE 0 END) as with_phone1,
      SUM(CASE WHEN phone_number_2 IS NOT NULL AND phone_number_2 != '' THEN 1 ELSE 0 END) as with_phone2,
      SUM(CASE WHEN (phone_number_1 IS NOT NULL AND phone_number_1 != '')
                 OR (phone_number_2 IS NOT NULL AND phone_number_2 != '') THEN 1 ELSE 0 END) as with_any_phone
    FROM scraped_posts
  `).get();

  console.log('\n' + '='.repeat(60));
  console.log('  MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Total posts: ${stats.total}`);
  console.log(`  With phone_number_1: ${stats.with_phone1}`);
  console.log(`  With phone_number_2: ${stats.with_phone2}`);
  console.log(`  With any phone: ${stats.with_any_phone}`);
  console.log('='.repeat(60) + '\n');

  console.log('✅ Migration successful!');
  console.log('You can now:');
  console.log('  1. Run: npm run server');
  console.log('  2. Open: http://localhost:3002');
  console.log('  3. See phone numbers in the "Phone 2nd" column\n');

} catch (error) {
  console.error('\n❌ Migration error:', error);
  process.exit(1);
} finally {
  db.close();
}
