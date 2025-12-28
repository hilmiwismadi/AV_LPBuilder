import puppeteer from 'puppeteer';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'events.db');
const cookiesPath = join(__dirname, 'instagram-cookies.json');
const configPath = join(__dirname, 'config.json');

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load configuration
let config = {
  instagram: { username: '', password: '' },
  scraping: {
    targetAccounts: ['infolomba.sch'],
    startDate: '2024-12-01',
    endDate: '2025-05-31',
    maxScrolls: 30
  }
};

if (existsSync(configPath)) {
  config = JSON.parse(readFileSync(configPath, 'utf-8'));
}

const TARGET_ACCOUNTS = config.scraping.targetAccounts;
const START_DATE = new Date(config.scraping.startDate);
const END_DATE = new Date(config.scraping.endDate);
const MAX_SCROLLS = config.scraping.maxScrolls;

// Phone number patterns (Indonesian format)
const PHONE_PATTERNS = [
  /\b(0\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4})\b/g,
  /\b(62\s?8\d{2}[-.\s]?\d{3,4}[-.\s]?\d{3,4})\b/g,
  /\b(\+62\s?8\d{2}[-.\s]?\d{3,4}[-.\s]?\d{3,4})\b/g,
  /\b(08\d{2}[-.\s]?\d{3,4}[-.\s]?\d{3,4})\b/g,
  /\b(WA:?\s*0?8\d{9,11})\b/gi,
];

// Free event keywords
const FREE_KEYWORDS = [
  'free registration',
  'free entry',
  'gratis',
  'tanpa biaya',
  'bebas biaya',
];

class InstagramScraper {
  constructor() {
    this.db = new Database(dbPath);
    this.browser = null;
    this.page = null;
  }

  // Save cookies to file
  async saveCookies() {
    const cookies = await this.page.cookies();
    writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log('✓ Session saved!\n');
  }

  // Load cookies from file
  async loadCookies() {
    if (existsSync(cookiesPath)) {
      const cookies = JSON.parse(readFileSync(cookiesPath, 'utf-8'));
      await this.page.setCookie(...cookies);
      console.log('✓ Previous session loaded');
      return true;
    }
    return false;
  }

  // Check if logged in
  async isLoggedIn() {
    try {
      await delay(2000);

      // Check if we're on login page or see login button
      const loginButton = await this.page.$('a[href="/accounts/login/"]');
      const loginForm = await this.page.$('input[name="username"]');

      return !loginButton && !loginForm;
    } catch (error) {
      return false;
    }
  }

  // Extract phone numbers from text
  extractPhoneNumber(text) {
    if (!text) return null;

    for (const pattern of PHONE_PATTERNS) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        let phone = matches[0].replace(/[-.\s]/g, '');

        if (phone.startsWith('0')) {
          phone = '62' + phone.substring(1);
        } else if (phone.startsWith('+')) {
          phone = phone.substring(1);
        }

        return phone;
      }
    }

    return null;
  }

  // Check if event is free
  isFreeEvent(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return FREE_KEYWORDS.some(keyword => lowerText.includes(keyword));
  }

  // Extract event title from caption
  extractEventTitle(caption) {
    if (!caption) return 'Untitled Event';

    const lines = caption.split('\n');
    const firstLine = lines[0].trim();
    let title = firstLine.replace(/[#@]/g, '').trim();

    if (title.length > 100) {
      title = title.substring(0, 100) + '...';
    }

    return title || 'Untitled Event';
  }

  // Save event to database
  saveEvent(eventData) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO events (
        event_title, instagram_link, post_date, caption,
        phone_number, is_free_event, source_account
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        eventData.title,
        eventData.link,
        eventData.date,
        eventData.caption,
        eventData.phone,
        eventData.isFree ? 1 : 0,
        eventData.sourceAccount
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error saving event:', error.message);
      return false;
    }
  }

  // Initialize browser
  async init() {
    console.log('\n🚀 Starting Instagram Scraper...\n');
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
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    console.log('✓ Browser launched\n');
  }

  // Automatic login with credentials
  async loginWithCredentials(username, password) {
    console.log('Attempting automatic login...');

    try {
      // Wait for login form
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await delay(1000);

      // Type username
      await this.page.type('input[name="username"]', username, { delay: 100 });
      await delay(500);

      // Type password
      await this.page.type('input[name="password"]', password, { delay: 100 });
      await delay(500);

      // Click login button
      const loginButton = await this.page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        console.log('Login button clicked, waiting for response...');

        // Wait for navigation
        await delay(5000);

        // Check for "Save Your Login Info" dialog and skip it
        try {
          const notNowButton = await this.page.$x("//button[contains(text(), 'Not Now')]");
          if (notNowButton.length > 0) {
            await notNowButton[0].click();
            console.log('Skipped "Save Login Info" dialog');
            await delay(2000);
          }
        } catch (e) {
          // Dialog might not appear
        }

        // Check for "Turn on Notifications" dialog and skip it
        try {
          const notNowButton2 = await this.page.$x("//button[contains(text(), 'Not Now')]");
          if (notNowButton2.length > 0) {
            await notNowButton2[0].click();
            console.log('Skipped "Turn on Notifications" dialog');
            await delay(2000);
          }
        } catch (e) {
          // Dialog might not appear
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Auto-login error:', error.message);
      return false;
    }
  }

  // Handle login
  async handleLogin() {
    console.log('Navigating to Instagram...');
    await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2', timeout: 60000 });

    // Try to load saved cookies
    const cookiesLoaded = await this.loadCookies();

    if (cookiesLoaded) {
      await this.page.reload({ waitUntil: 'networkidle2' });
      await delay(3000);

      const loggedIn = await this.isLoggedIn();

      if (loggedIn) {
        console.log('✓ Already logged in!\n');
        return true;
      } else {
        console.log('⚠ Previous session expired, logging in again...\n');
      }
    }

    // Check if credentials are provided in config
    if (config.instagram.username && config.instagram.password &&
        config.instagram.username !== 'YOUR_INSTAGRAM_USERNAME') {

      console.log(`Logging in as: ${config.instagram.username}`);

      const loginSuccess = await this.loginWithCredentials(
        config.instagram.username,
        config.instagram.password
      );

      if (loginSuccess) {
        await delay(3000);
        const loggedIn = await this.isLoggedIn();

        if (loggedIn) {
          console.log('✓ Login successful!\n');
          await this.saveCookies();
          return true;
        }
      }

      console.log('❌ Automatic login failed.');
      console.log('   Please check your credentials in config.json\n');
      return false;
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('  ⚠ NO CREDENTIALS FOUND IN config.json');
      console.log('='.repeat(60));
      console.log('\nPlease edit config.json and add your Instagram credentials:');
      console.log('{\n  "instagram": {');
      console.log('    "username": "your_username",');
      console.log('    "password": "your_password"');
      console.log('  }\n}\n');
      return false;
    }
  }

  // Scrape a single account
  async scrapeAccount(accountName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Scraping account: @${accountName}`);
    console.log('='.repeat(60) + '\n');

    const url = `https://www.instagram.com/${accountName}/`;

    try {
      console.log(`Navigating to ${url}...`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(3000);

      console.log('Starting to collect posts...');

      const posts = await this.collectPosts();

      console.log(`\n✓ Found ${posts.length} posts total`);
      console.log('Now filtering by date range and processing...\n');

      let savedCount = 0;
      let skippedFree = 0;
      let skippedDate = 0;

      for (let i = 0; i < posts.length; i++) {
        console.log(`[${i + 1}/${posts.length}] Processing post...`);
        const postData = await this.scrapePost(posts[i], accountName);

        if (postData === 'DATE_OUT_OF_RANGE') {
          skippedDate++;
        } else if (postData) {
          if (postData.isFree) {
            console.log('  ⊘ Skipped: Free event detected');
            skippedFree++;
          } else {
            const saved = this.saveEvent(postData);
            if (saved) {
              console.log('  ✓ SAVED to database');
              console.log(`    📌 ${postData.title}`);
              console.log(`    📱 ${postData.phone || 'No phone number'}`);
              savedCount++;
            } else {
              console.log('  - Already in database');
            }
          }
        }

        await delay(800);
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`  Summary for @${accountName}`);
      console.log('='.repeat(60));
      console.log(`  Posts collected: ${posts.length}`);
      console.log(`  Outside date range: ${skippedDate}`);
      console.log(`  Free events filtered: ${skippedFree}`);
      console.log(`  NEW events saved: ${savedCount}`);
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      console.error(`❌ Error scraping ${accountName}:`, error.message);
    }
  }

  // Collect post links by scrolling
  async collectPosts() {
    const posts = [];
    let previousHeight = 0;
    let scrollAttempts = 0;

    while (scrollAttempts < MAX_SCROLLS) {
      const newPosts = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
        return links.map(link => ({
          url: link.href,
          time: link.closest('article')?.querySelector('time')?.getAttribute('datetime') || null
        }));
      });

      for (const post of newPosts) {
        if (!posts.find(p => p.url === post.url)) {
          posts.push(post);
        }
      }

      await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(1500);

      const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
      if (currentHeight === previousHeight) {
        console.log('  Reached end of page');
        break;
      }
      previousHeight = currentHeight;
      scrollAttempts++;

      if (scrollAttempts % 5 === 0) {
        console.log(`  Scrolled ${scrollAttempts} times, collected ${posts.length} posts...`);
      }
    }

    return posts;
  }

  // Scrape individual post
  async scrapePost(post, sourceAccount) {
    try {
      await this.page.goto(post.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1500);

      const data = await this.page.evaluate(() => {
        let caption = '';
        const captionSelectors = [
          'h1',
          '[class*="Caption"]',
          'span[dir="auto"]',
          'div[data-testid="post-comment-root"]'
        ];

        for (const selector of captionSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            caption = element.textContent;
            break;
          }
        }

        const timeElement = document.querySelector('time');
        const dateStr = timeElement?.getAttribute('datetime') || null;

        return {
          caption: caption.trim(),
          date: dateStr
        };
      });

      if (data.date) {
        const postDate = new Date(data.date);
        if (postDate < START_DATE || postDate > END_DATE) {
          console.log(`  ⊘ Skipped: Outside date range (${postDate.toLocaleDateString()})`);
          return 'DATE_OUT_OF_RANGE';
        }
      }

      const title = this.extractEventTitle(data.caption);
      const phone = this.extractPhoneNumber(data.caption);
      const isFree = this.isFreeEvent(data.caption);

      return {
        title,
        link: post.url,
        date: data.date,
        caption: data.caption,
        phone,
        isFree,
        sourceAccount
      };

    } catch (error) {
      console.error('  ⚠ Error scraping post:', error.message);
      return null;
    }
  }

  // Main scraping function
  async scrape() {
    try {
      await this.init();

      const loginSuccess = await this.handleLogin();

      if (!loginSuccess) {
        console.log('\n❌ Cannot proceed without login. Exiting...\n');
        return;
      }

      for (const account of TARGET_ACCOUNTS) {
        await this.scrapeAccount(account);
      }

      console.log('\n' + '='.repeat(60));
      console.log('  🎉 SCRAPING COMPLETE!');
      console.log('='.repeat(60));
      this.showStats();
      console.log('='.repeat(60) + '\n');

      console.log('💡 Tip: Run "npm run view" to see all scraped events\n');

    } catch (error) {
      console.error('\n❌ Scraping error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      this.db.close();
    }
  }

  // Show statistics
  showStats() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM events').get();
    const withPhone = this.db.prepare('SELECT COUNT(*) as count FROM events WHERE phone_number IS NOT NULL').get();
    const freeEvents = this.db.prepare('SELECT COUNT(*) as count FROM events WHERE is_free_event = 1').get();

    console.log('\n📊 Database Statistics:');
    console.log(`   Total events: ${total.count}`);
    console.log(`   Events with phone: ${withPhone.count}`);
    console.log(`   Free events (auto-filtered): ${freeEvents.count}`);
  }
}

// Run scraper
const scraper = new InstagramScraper();
scraper.scrape();
