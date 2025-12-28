import puppeteer from 'puppeteer';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'crm-events.db');
const cookiesPath = join(__dirname, 'instagram-cookies.json');
const configPath = join(__dirname, 'config.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load configuration
let config = {
  instagram: { username: '', password: '' },
  scraping: {
    targetAccounts: ['infolomba.sch'],
    startDate: '2024-12-01',
    endDate: '2025-05-31',
    skipFirstN: 1000,
    scrapeCount: 100
  }
};

if (existsSync(configPath)) {
  config = JSON.parse(readFileSync(configPath, 'utf-8'));
}

// Improved Phone number patterns
const PHONE_PATTERNS = [
  /\b(08\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  /\b(628\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  /(\+62[\s\-.]?8\d{1,2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})\b/g,
  /(?:WA|WhatsApp|Whatsapp|wa)[\s:]*(\+?62|0)?[\s\-.]?(8\d{2}[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}[\s\-.]?\d{0,4})/gi,
  /\b(0?8\d{9,11})\b/g,
  /\b(628\d{9,11})\b/g,
];

class RevisitScraper {
  constructor() {
    this.db = new Database(dbPath);
    this.browser = null;
    this.page = null;
  }

  // Extract ALL phone numbers
  extractAllPhoneNumbers(text) {
    if (!text) return [];

    const foundNumbers = new Set();

    for (const pattern of PHONE_PATTERNS) {
      pattern.lastIndex = 0;

      let match;
      while ((match = pattern.exec(text)) !== null) {
        let phone = match[1] || match[0];

        phone = phone.replace(/[-.\s()\[\]]/g, '');
        phone = phone.replace(/^(WA|WhatsApp|Whatsapp|wa)[:]/gi, '');

        if (phone.startsWith('0')) {
          phone = '62' + phone.substring(1);
        } else if (phone.startsWith('+62')) {
          phone = phone.substring(1);
        } else if (phone.startsWith('+')) {
          phone = phone.substring(1);
        } else if (phone.startsWith('8') && phone.length >= 10) {
          phone = '62' + phone;
        }

        if (phone.startsWith('62') && phone.length >= 11 && phone.length <= 14) {
          foundNumbers.add(phone);
        }
      }
    }

    return Array.from(foundNumbers);
  }

  // Save/load cookies
  async saveCookies() {
    const cookies = await this.page.cookies();
    writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
  }

  async loadCookies() {
    if (existsSync(cookiesPath)) {
      const cookies = JSON.parse(readFileSync(cookiesPath, 'utf-8'));
      await this.page.setCookie(...cookies);
      return true;
    }
    return false;
  }

  // Check if logged in
  async isLoggedIn() {
    try {
      await delay(2000);
      const loginButton = await this.page.$('a[href="/accounts/login/"]');
      const loginForm = await this.page.$('input[name="username"]');
      return !loginButton && !loginForm;
    } catch (error) {
      return false;
    }
  }

  // Initialize browser
  async init() {
    console.log('\n🔄 Starting Re-Visit Scraper...\n');
    console.log('Launching browser...');

    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });

    console.log('✓ Browser launched\n');
  }

  // Handle login
  async handleLogin() {
    console.log('Checking login status...');

    await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

    const hasCookies = await this.loadCookies();
    if (hasCookies) {
      await this.page.reload({ waitUntil: 'networkidle2' });
      const loggedIn = await this.isLoggedIn();

      if (loggedIn) {
        console.log('✓ Already logged in (using saved cookies)\n');
        return true;
      }
    }

    console.log('⚠ Not logged in - attempting login...');

    await this.page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
    await delay(2000);

    try {
      await this.page.type('input[name="username"]', config.instagram.username, { delay: 100 });
      await this.page.type('input[name="password"]', config.instagram.password, { delay: 100 });

      await Promise.all([
        this.page.click('button[type="submit"]'),
        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
      ]);

      await delay(3000);

      const loggedIn = await this.isLoggedIn();

      if (loggedIn) {
        console.log('✓ Login successful!\n');
        await this.saveCookies();
        return true;
      } else {
        console.log('❌ Login failed\n');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  }

  // Close Instagram popups
  async closePopups() {
    try {
      // Close "Turn on notifications" popup
      const notNowButtons = [
        'button:has-text("Not Now")',
        'button:has-text("Not now")',
        'button[class*="aOOlW"]',
        '[role="button"]:has-text("Not Now")'
      ];

      for (const selector of notNowButtons) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            await delay(500);
            console.log('    ✓ Closed popup');
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (error) {
      // Ignore popup errors
    }
  }

  // Scrape a single post with retry logic
  async scrapePost(postUrl, retryCount = 0) {
    try {
      // Navigate to post
      await this.page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await delay(3000); // Wait for page to stabilize

      // Close any popups
      await this.closePopups();
      await delay(1000);

      // Scroll down to load more content
      try {
        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await delay(1500);
      } catch (e) {
        console.log('    ⚠ Could not scroll, continuing...');
      }

      // Try to click "more" button to expand caption
      try {
        const moreButtonSelectors = [
          'span:has-text("more")',
          'div[role="button"]:has-text("more")',
          '._a9ze',
          'button._acan._acap._acas._aj1-',
        ];

        for (const selector of moreButtonSelectors) {
          try {
            const elements = await this.page.$$(selector);
            for (const element of elements) {
              const text = await element.evaluate(el => el.textContent);
              if (text && text.toLowerCase().includes('more')) {
                await element.click();
                await delay(1500);
                console.log('    ✓ Clicked "more" button to expand caption');
                break;
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }
      } catch (error) {
        console.log('    ⚠ No "more" button found');
      }

      // Extract caption with multiple attempts
      const data = await this.page.evaluate(() => {
        let caption = '';

        // Try multiple selectors in order of reliability
        const captionSelectors = [
          // Most reliable - full caption container
          'div[class*="_a9zs"] h1',
          'h1[dir="auto"]',
          'h1',
          // Fallback to spans
          'span[dir="auto"]',
          'div[data-testid="post-comment-root"] span',
          // Last resort - any text container
          '[class*="Caption"]',
          'div[style*="word-wrap"] span'
        ];

        for (const selector of captionSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = element.textContent || element.innerText;
            if (text && text.length > caption.length) {
              caption = text;
            }
          }
        }

        // If still nothing, try getting all text from article
        if (!caption || caption.length < 50) {
          const article = document.querySelector('article');
          if (article) {
            const allText = article.innerText || article.textContent;
            if (allText && allText.length > caption.length) {
              caption = allText;
            }
          }
        }

        return {
          caption: caption.trim()
        };
      });

      console.log(`    📝 Extracted ${data.caption.length} characters`);
      if (data.caption.length > 0) {
        // Show first 150 chars of caption
        const preview = data.caption.substring(0, 150).replace(/\n/g, ' ');
        console.log(`    📄 Caption preview: "${preview}${data.caption.length > 150 ? '...' : ''}"`);
      }

      return data.caption;

    } catch (error) {
      console.error('  ⚠ Error scraping post:', error.message);

      // Retry once if detached frame error
      if (error.message.includes('detached') && retryCount < 2) {
        console.log(`  🔄 Retrying (attempt ${retryCount + 2}/3)...`);
        await delay(3000);
        return await this.scrapePost(postUrl, retryCount + 1);
      }

      return null;
    }
  }

  // Update post in database
  updatePost(postId, caption, phone1, phone2) {
    const stmt = this.db.prepare(`
      UPDATE scraped_posts
      SET caption = ?, phone_number_1 = ?, phone_number_2 = ?
      WHERE id = ?
    `);

    try {
      const result = stmt.run(caption, phone1, phone2, postId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating post:', error.message);
      return false;
    }
  }

  // Main revisit function
  async revisit() {
    try {
      await this.init();

      const loginSuccess = await this.handleLogin();
      if (!loginSuccess) {
        console.log('\n❌ Cannot proceed without login. Exiting...\n');
        return;
      }

      // Get posts without phone numbers only
      const posts = this.db.prepare(`
        SELECT id, post_url FROM scraped_posts
        WHERE (phone_number_1 IS NULL OR phone_number_1 = '')
          AND (phone_number_2 IS NULL OR phone_number_2 = '')
        ORDER BY id
      `).all();

      const totalPosts = this.db.prepare('SELECT COUNT(*) as count FROM scraped_posts').get();

      console.log('='.repeat(60));
      console.log(`  📋 Total posts in database: ${totalPosts.count}`);
      console.log(`  🔍 Posts WITHOUT phone numbers: ${posts.length}`);
      console.log(`  ✅ Posts WITH phone numbers: ${totalPosts.count - posts.length}`);
      console.log('='.repeat(60) + '\n');

      let successCount = 0;
      let failedCount = 0;
      let newPhoneCount = 0;

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        console.log('\n' + '='.repeat(60));
        console.log(`  [${i + 1}/${posts.length}] RE-VISITING POST ID ${post.id}`);
        console.log('='.repeat(60));
        console.log(`  🔗 URL: ${post.post_url}`);

        const caption = await this.scrapePost(post.post_url);

        if (caption && caption.length > 0) {
          // Extract phone numbers with detailed logging
          const phoneNumbers = this.extractAllPhoneNumbers(caption);

          console.log('\n  ╔════════════════════════════════════════════════════════╗');
          console.log('  ║              PHONE NUMBER EXTRACTION                   ║');
          console.log('  ╚════════════════════════════════════════════════════════╝');

          if (phoneNumbers.length > 0) {
            console.log(`  ✅ FOUND ${phoneNumbers.length} PHONE NUMBER(S):`);
            phoneNumbers.forEach((phone, idx) => {
              console.log(`     ${idx + 1}. ⭐ ${phone} ⭐`);
            });

            // Show where in caption the numbers were found
            phoneNumbers.forEach(phone => {
              const searchPattern = phone.replace('62', '0');
              if (caption.includes(searchPattern)) {
                const index = caption.indexOf(searchPattern);
                const start = Math.max(0, index - 30);
                const end = Math.min(caption.length, index + searchPattern.length + 30);
                const context = caption.substring(start, end);
                console.log(`     📍 Context: "...${context}..."`);
              }
            });
            newPhoneCount++;
          } else {
            console.log(`  ❌ NO PHONE NUMBERS FOUND`);
            console.log(`  📋 Caption (first 300 chars):`);
            console.log(`     "${caption.substring(0, 300)}${caption.length > 300 ? '...' : ''}"`);
          }

          const phone1 = phoneNumbers[0] || null;
          const phone2 = phoneNumbers[1] || null;

          const updated = this.updatePost(post.id, caption, phone1, phone2);

          if (updated) {
            console.log('\n  ✓ DATABASE UPDATED');
            console.log(`  💾 Saved: phone_number_1=${phone1 || 'NULL'}, phone_number_2=${phone2 || 'NULL'}`);
            successCount++;
          } else {
            console.log('\n  ✗ DATABASE UPDATE FAILED');
            failedCount++;
          }
        } else {
          console.log('\n  ✗ FAILED - Could not extract caption');
          failedCount++;
        }

        // Add delay to avoid rate limiting
        if (i < posts.length - 1) {
          console.log(`\n  ⏱️  Waiting 2 seconds before next post...`);
          await delay(2000);
        }
      }

      console.log('='.repeat(60));
      console.log('  RE-VISIT COMPLETE');
      console.log('='.repeat(60));
      console.log(`  Posts processed: ${posts.length}`);
      console.log(`  Successfully updated: ${successCount}`);
      console.log(`  Failed: ${failedCount}`);
      console.log(`  Posts with new phones: ${newPhoneCount}`);
      console.log('='.repeat(60) + '\n');

      // Show final statistics
      const stats = this.db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN phone_number_1 IS NOT NULL AND phone_number_1 != '' THEN 1 ELSE 0 END) as with_phone1,
          SUM(CASE WHEN phone_number_2 IS NOT NULL AND phone_number_2 != '' THEN 1 ELSE 0 END) as with_phone2,
          SUM(CASE WHEN (phone_number_1 IS NOT NULL AND phone_number_1 != '')
                     OR (phone_number_2 IS NOT NULL AND phone_number_2 != '') THEN 1 ELSE 0 END) as with_any_phone
        FROM scraped_posts
      `).get();

      console.log('📊 Final Statistics:');
      console.log(`  Total posts: ${stats.total}`);
      console.log(`  With phone_number_1: ${stats.with_phone1}`);
      console.log(`  With phone_number_2: ${stats.with_phone2}`);
      console.log(`  With any phone: ${stats.with_any_phone}`);
      console.log(`  Coverage: ${(stats.with_any_phone / stats.total * 100).toFixed(1)}%\n`);

    } catch (error) {
      console.error('Error during re-visit:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      this.db.close();
    }
  }
}

// Run the scraper
const scraper = new RevisitScraper();
scraper.revisit();
