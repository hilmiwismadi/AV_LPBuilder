import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'events.db');

try {
  const db = new Database(dbPath, { readonly: true });

  console.log('\n=== EVENT DATABASE VIEWER ===\n');

  // Get statistics
  const total = db.prepare('SELECT COUNT(*) as count FROM events').get();
  const withPhone = db.prepare('SELECT COUNT(*) as count FROM events WHERE phone_number IS NOT NULL').get();
  const bySource = db.prepare('SELECT source_account, COUNT(*) as count FROM events GROUP BY source_account').all();

  console.log('📊 Statistics:');
  console.log(`   Total events: ${total.count}`);
  console.log(`   Events with phone: ${withPhone.count}`);
  console.log('\n   By source account:');
  bySource.forEach(row => {
    console.log(`   - ${row.source_account}: ${row.count} events`);
  });

  // Get all events (excluding free events)
  const events = db.prepare(`
    SELECT * FROM events
    WHERE is_free_event = 0
    ORDER BY post_date DESC
  `).all();

  console.log('\n\n📋 Events (Non-Free):');
  console.log('='.repeat(80));

  if (events.length === 0) {
    console.log('No events found in database.');
  } else {
    events.forEach((event, index) => {
      console.log(`\n[${index + 1}] ${event.event_title}`);
      console.log(`    🔗 Link: ${event.instagram_link}`);
      console.log(`    📅 Date: ${event.post_date ? new Date(event.post_date).toLocaleDateString() : 'Unknown'}`);
      console.log(`    📱 Phone: ${event.phone_number || 'Not found'}`);
      console.log(`    📍 Source: @${event.source_account}`);

      if (event.caption && event.caption.length > 0) {
        const shortCaption = event.caption.substring(0, 150).replace(/\n/g, ' ');
        console.log(`    📝 Caption: ${shortCaption}${event.caption.length > 150 ? '...' : ''}`);
      }
      console.log('    ' + '-'.repeat(76));
    });
  }

  console.log('\n\n💡 Tips:');
  console.log('   - Events marked as "free" are automatically filtered out');
  console.log('   - Phone numbers are automatically formatted to +62 format');
  console.log('   - Click the links to view the full Instagram post and poster');
  console.log('\n');

  db.close();

} catch (error) {
  if (error.code === 'SQLITE_CANTOPEN') {
    console.error('\n❌ Database not found!');
    console.error('   Please run: npm run init-db');
    console.error('   Then run: npm start\n');
  } else {
    console.error('Error:', error.message);
  }
}
