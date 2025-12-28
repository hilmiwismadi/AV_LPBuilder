import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'crm-events.db');

// Improved Phone number patterns (Indonesian format)
// Supports: 08XX..., 628XX..., +628XX... with flexible separators
const PHONE_PATTERNS = [
  // Indonesian mobile starting with 08 (with any separators or none)
  /\b(08\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  // With country code 62 (no + sign)
  /\b(628\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  // With +62 prefix
  /(\+62[\s\-.]?8\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  // WA: or WhatsApp: prefix
  /(?:WA|WhatsApp|Whatsapp|wa)[\s:]*(\+?62|0)?[\s\-.]?(8\d{2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})/gi,
  // Just a sequence of 10-13 digits starting with 08 or 62
  /\b(0?8\d{9,11})\b/g,
  /\b(628\d{9,11})\b/g,
];

// Extract ALL phone numbers from text (returns array)
function extractAllPhoneNumbers(text) {
  if (!text) return [];

  const foundNumbers = new Set(); // Use Set to avoid duplicates

  for (const pattern of PHONE_PATTERNS) {
    // Reset regex lastIndex to avoid issues with global flag
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      let phone = match[1] || match[0];

      // Clean up the number
      phone = phone.replace(/[-.\s()\[\]]/g, '');
      phone = phone.replace(/^(WA|WhatsApp|Whatsapp|wa)[:]/gi, '');

      // Normalize to 62 format
      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      } else if (phone.startsWith('+62')) {
        phone = phone.substring(1);
      } else if (phone.startsWith('+')) {
        phone = phone.substring(1);
      } else if (phone.startsWith('8') && phone.length >= 10) {
        // If starts with 8 and long enough, assume it's missing 62
        phone = '62' + phone;
      }

      // Validate: Should be 11-13 digits starting with 62
      if (phone.startsWith('62') && phone.length >= 11 && phone.length <= 14) {
        foundNumbers.add(phone);
      }
    }
  }

  return Array.from(foundNumbers);
}

console.log('\n' + '='.repeat(60));
console.log('  📞 PHONE NUMBER RE-PARSING SCRIPT');
console.log('='.repeat(60));
console.log('This script will re-extract phone numbers from all posts');
console.log('using the improved extraction logic.\n');

// Open database
const db = new Database(dbPath);

// Get all posts
console.log('📊 Reading all posts from database...');
const allPosts = db.prepare('SELECT id, caption, phone_number_1, phone_number_2 FROM scraped_posts').all();
console.log(`✓ Found ${allPosts.length} posts\n`);

// Count before
const beforeStats = db.prepare(`
  SELECT
    SUM(CASE WHEN phone_number_1 IS NOT NULL AND phone_number_1 != '' THEN 1 ELSE 0 END) as with_phone1,
    SUM(CASE WHEN phone_number_2 IS NOT NULL AND phone_number_2 != '' THEN 1 ELSE 0 END) as with_phone2,
    SUM(CASE WHEN (phone_number_1 IS NOT NULL AND phone_number_1 != '')
               OR (phone_number_2 IS NOT NULL AND phone_number_2 != '') THEN 1 ELSE 0 END) as with_any_phone
  FROM scraped_posts
`).get();

console.log('📊 BEFORE re-parsing:');
console.log(`  - Posts with phone_number_1: ${beforeStats.with_phone1}`);
console.log(`  - Posts with phone_number_2: ${beforeStats.with_phone2}`);
console.log(`  - Posts with any phone: ${beforeStats.with_any_phone}`);
console.log(`  - Posts with NO phone: ${allPosts.length - beforeStats.with_any_phone}\n`);

// Prepare update statement
const updateStmt = db.prepare(`
  UPDATE scraped_posts
  SET phone_number_1 = ?, phone_number_2 = ?
  WHERE id = ?
`);

// Re-parse all posts
console.log('🔄 Re-parsing phone numbers...\n');
let updatedCount = 0;
let newPhoneCount = 0;

for (const post of allPosts) {
  const phoneNumbers = extractAllPhoneNumbers(post.caption);

  const newPhone1 = phoneNumbers[0] || null;
  const newPhone2 = phoneNumbers[1] || null;

  // Check if we found new phones for posts that didn't have any
  const hadPhone = (post.phone_number_1 || post.phone_number_2);
  const hasPhone = (newPhone1 || newPhone2);

  if (!hadPhone && hasPhone) {
    newPhoneCount++;
    console.log(`  ✓ Post ID ${post.id}: Found ${phoneNumbers.length} number(s) - ${phoneNumbers.join(', ')}`);
  }

  // Update if different
  if (newPhone1 !== post.phone_number_1 || newPhone2 !== post.phone_number_2) {
    updateStmt.run(newPhone1, newPhone2, post.id);
    updatedCount++;
  }
}

console.log(`\n✓ Updated ${updatedCount} posts`);
console.log(`✓ Found ${newPhoneCount} new phone numbers in posts that previously had none\n`);

// Count after
const afterStats = db.prepare(`
  SELECT
    SUM(CASE WHEN phone_number_1 IS NOT NULL AND phone_number_1 != '' THEN 1 ELSE 0 END) as with_phone1,
    SUM(CASE WHEN phone_number_2 IS NOT NULL AND phone_number_2 != '' THEN 1 ELSE 0 END) as with_phone2,
    SUM(CASE WHEN (phone_number_1 IS NOT NULL AND phone_number_1 != '')
               OR (phone_number_2 IS NOT NULL AND phone_number_2 != '') THEN 1 ELSE 0 END) as with_any_phone
  FROM scraped_posts
`).get();

console.log('📊 AFTER re-parsing:');
console.log(`  - Posts with phone_number_1: ${afterStats.with_phone1}`);
console.log(`  - Posts with phone_number_2: ${afterStats.with_phone2}`);
console.log(`  - Posts with any phone: ${afterStats.with_any_phone}`);
console.log(`  - Posts with NO phone: ${allPosts.length - afterStats.with_any_phone}\n`);

console.log('📈 IMPROVEMENT:');
console.log(`  - Phone_number_1: ${beforeStats.with_phone1} → ${afterStats.with_phone1} (+${afterStats.with_phone1 - beforeStats.with_phone1})`);
console.log(`  - Phone_number_2: ${beforeStats.with_phone2} → ${afterStats.with_phone2} (+${afterStats.with_phone2 - beforeStats.with_phone2})`);
console.log(`  - Posts with any phone: ${beforeStats.with_any_phone} → ${afterStats.with_any_phone} (+${afterStats.with_any_phone - beforeStats.with_any_phone})`);
console.log(`  - Improvement: ${((afterStats.with_any_phone - beforeStats.with_any_phone) / allPosts.length * 100).toFixed(1)}% more posts now have phone numbers\n`);

console.log('='.repeat(60));
console.log('  ✅ RE-PARSING COMPLETE');
console.log('='.repeat(60) + '\n');

db.close();
