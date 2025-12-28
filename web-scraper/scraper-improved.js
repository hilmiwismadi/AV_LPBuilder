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
    skipFirstN: 1000,  // NEW: Skip first N posts
    scrapeCount: 100   // NEW: How many posts to scrape
  }
};

if (existsSync(configPath)) {
  config = JSON.parse(readFileSync(configPath, 'utf-8'));
}

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

class ImprovedInstagramScraper {
  constructor() {
    this.db = this.initDatabase();
    this.browser = null;
    this.page = null;
  }

  // Initialize database with new schema
  initDatabase() {
    const db = new Database(dbPath);

    // Read and execute schema
    const schemaPath = join(__dirname, 'schema.sql');
    if (existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
      console.log('✓ Database initialized with new schema');
    }

    return db;
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

  // Extract ALL phone numbers from text (returns array)
  extractAllPhoneNumbers(text) {
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

  // Extract phone number (backwards compatibility - returns first number)
  extractPhoneNumber(text) {
    const numbers = this.extractAllPhoneNumbers(text);
    return numbers.length > 0 ? numbers[0] : null;
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

  // Get profile name from an Instagram account
  async getProfileName(username) {
    try {
      const profileUrl = `https://www.instagram.com/${username}/`;

      // Create a new page to avoid interfering with main scraping
      const profilePage = await this.browser.newPage();
      await profilePage.setViewport({ width: 1280, height: 800 });

      await profilePage.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await delay(2000);

      // Extract profile name/bio
      const profileData = await profilePage.evaluate(() => {
        // Try to get the name from header or meta tags
        let name = '';

        // Method 1: From header sections
        const headerSpans = document.querySelectorAll('header section span[dir="auto"]');
        for (const span of headerSpans) {
          const text = span.textContent?.trim();
          if (text && text.length > 0 && !['Posts', 'Followers', 'Following'].includes(text)) {
            if (text.length > name.length) {
              name = text;
            }
          }
        }

        // Method 2: From meta description
        if (!name || name === 'Follow to see their photos and videos.') {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            const content = metaDescription.content;
            const match = content.match(/^([^(•]+)/);
            if (match) {
              name = match[1].trim();
            }
          }
        }

        return { name: name || null };
      });

      await profilePage.close();
      return profileData.name;

    } catch (error) {
      console.error(`    ⚠ Error getting profile name for @${username}:`, error.message);
      return null;
    }
  }

  // Extract @mentioned accounts from current page
  async extractMentionedAccounts() {
    try {
      const mentions = await this.page.evaluate(() => {
        const mentionedUsers = [];
        const allLinks = document.querySelectorAll('a[href*="/"]');

        for (const link of allLinks) {
          const href = link.getAttribute('href');
          const text = link.textContent?.trim();

          // Check for @username text
          if (text && text.startsWith('@')) {
            const username = text.substring(1);
            if (username && username.length > 0 && username.length < 30) {
              mentionedUsers.push(username);
            }
          } else if (href && href.startsWith('/') && !href.includes('/p/') && !href.includes('/reel/')) {
            // Check if link is in caption area
            const article = link.closest('article');
            if (article) {
              const captionContainer = link.closest('div[class*="Caption"]') ||
                                     link.closest('h1') ||
                                     link.closest('span[dir="auto"]');
              if (captionContainer) {
                const username = href.replace('/', '').split('/')[0].split('?')[0];
                if (username && username.length > 0 && username.length < 30) {
                  mentionedUsers.push(username);
                }
              }
            }
          }
        }

        return [...new Set(mentionedUsers)]; // Remove duplicates
      });

      if (mentions.length === 0) {
        return [];
      }

      console.log(`    📌 Found ${mentions.length} @mention(s): ${mentions.slice(0, 3).join(', ')}${mentions.length > 3 ? '...' : ''}`);

      // Get profile names for first 2 mentions (to avoid rate limiting)
      const taggedAccounts = [];
      for (const username of mentions.slice(0, 2)) {
        const name = await this.getProfileName(username);
        if (name && name !== 'Follow to see their photos and videos.') {
          taggedAccounts.push({
            username,
            name,
            profileUrl: `https://www.instagram.com/${username}/`
          });
          console.log(`      ✓ @${username}: ${name.substring(0, 60)}${name.length > 60 ? '...' : ''}`);
        }
        await delay(1500); // Be respectful with rate limiting
      }

      return taggedAccounts;

    } catch (error) {
      console.error('    ⚠ Error extracting mentions:', error.message);
      return [];
    }
  }

  // Save post to database
  savePost(postData) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO scraped_posts (
        post_url, post_date, caption, phone_number_1, phone_number_2, event_title,
        source_account, image_url, tagged_accounts, organizer_ig, organizer_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      // Prepare tagged accounts as JSON
      const taggedAccountsJson = postData.taggedAccounts && postData.taggedAccounts.length > 0
        ? JSON.stringify(postData.taggedAccounts)
        : null;

      // First tagged account becomes the organizer
      const organizerIg = postData.taggedAccounts && postData.taggedAccounts.length > 0
        ? postData.taggedAccounts[0].username
        : null;

      const organizerName = postData.taggedAccounts && postData.taggedAccounts.length > 0
        ? postData.taggedAccounts[0].name
        : null;

      const result = stmt.run(
        postData.url,
        postData.date,
        postData.caption,
        postData.phone1 || null,
        postData.phone2 || null,
        postData.title,
        postData.sourceAccount,
        postData.imageUrl,
        taggedAccountsJson,
        organizerIg,
        organizerName
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Error saving post:', error.message);
      return false;
    }
  }

  // Initialize browser
  async init() {
    console.log('\n🚀 Starting Improved Instagram Scraper...\n');
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

  // Automatic login
  async loginWithCredentials(username, password) {
    console.log('Attempting automatic login...');

    try {
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await delay(1000);

      await this.page.type('input[name="username"]', username, { delay: 100 });
      await delay(500);
      await this.page.type('input[name="password"]', password, { delay: 100 });
      await delay(500);

      const loginButton = await this.page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        await delay(5000);

        // Skip dialogs
        try {
          const notNowButtons = await this.page.$x("//button[contains(text(), 'Not Now')]");
          for (const button of notNowButtons) {
            await button.click();
            await delay(1000);
          }
        } catch (e) {}

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  }

  // Handle login
  async handleLogin() {
    console.log('Navigating to Instagram...');
    await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2', timeout: 60000 });

    const cookiesLoaded = await this.loadCookies();

    if (cookiesLoaded) {
      await this.page.reload({ waitUntil: 'networkidle2' });
      await delay(3000);

      if (await this.isLoggedIn()) {
        console.log('✓ Already logged in!\n');
        return true;
      }
    }

    if (config.instagram.username && config.instagram.password) {
      const loginSuccess = await this.loginWithCredentials(
        config.instagram.username,
        config.instagram.password
      );

      if (loginSuccess && await this.isLoggedIn()) {
        console.log('✓ Login successful!\n');
        await this.saveCookies();
        return true;
      }
    }

    console.log('❌ Login failed');
    return false;
  }

  // Collect posts with aggressive scrolling
  async collectPosts(targetCount) {
    const posts = new Map();
    let scrollAttempts = 0;
    let noNewPostsCount = 0;
    const maxScrolls = 500;
    const maxNoNewPosts = 5;

    console.log(`\n📜 Scrolling to collect ${targetCount}+ posts...\n`);

    while (scrollAttempts < maxScrolls && posts.size < targetCount) {
      const previousSize = posts.size;

      // Triple scroll method
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(2000);

      await this.page.evaluate(() => window.scrollBy(0, 3000));
      await delay(1500);

      try {
        await this.page.evaluate(() => {
          const articles = document.querySelectorAll('article');
          if (articles.length > 0) {
            articles[articles.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        });
        await delay(1500);
      } catch (e) {}

      // Collect posts
      const newPosts = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
        return links.map(link => link.href);
      });

      for (const url of newPosts) {
        posts.set(url, { url });
      }

      scrollAttempts++;

      if (posts.size === previousSize) {
        noNewPostsCount++;
        if (noNewPostsCount >= maxNoNewPosts) {
          console.log(`\n⚠ No new posts after ${maxNoNewPosts} attempts\n`);
          break;
        }
      } else {
        noNewPostsCount = 0;
      }

      if (scrollAttempts % 10 === 0) {
        console.log(`  📊 Progress: ${scrollAttempts} scrolls | ${posts.size} posts collected`);
      }

      if (scrollAttempts % 50 === 0) {
        console.log(`  ⏸  Taking a break...`);
        await delay(5000);
      }

      if (posts.size >= targetCount) {
        console.log(`\n✓ Collected ${posts.size} posts!\n`);
        break;
      }
    }

    return Array.from(posts.values());
  }

  // Scrape individual post with proper date extraction
  async scrapePost(postUrl, sourceAccount) {
    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(2000);

      const data = await this.page.evaluate(() => {
        // Extract date from time element
        const timeElement = document.querySelector('time');
        const dateStr = timeElement?.getAttribute('datetime') || null;

        // Extract caption
        let caption = '';
        const captionSelectors = [
          'h1',
          '[class*="Caption"]',
          'span[dir="auto"]',
          'div[data-testid="post-comment-root"] span'
        ];

        for (const selector of captionSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (element && element.textContent && element.textContent.length > 20) {
              caption = element.textContent;
              break;
            }
          }
          if (caption) break;
        }

        // Extract image URL
        let imageUrl = null;
        const imgElement = document.querySelector('article img[src*="instagram"]');
        if (imgElement) {
          imageUrl = imgElement.src;
        }

        return {
          caption: caption.trim(),
          date: dateStr,
          imageUrl: imageUrl
        };
      });

      // Format date nicely
      let formattedDate = data.date;
      if (data.date) {
        const d = new Date(data.date);
        formattedDate = d.toISOString();
      }

      const title = this.extractEventTitle(data.caption);
      const phoneNumbers = this.extractAllPhoneNumbers(data.caption);

      // Extract tagged/mentioned accounts
      const taggedAccounts = await this.extractMentionedAccounts();

      return {
        url: postUrl,
        date: formattedDate,
        caption: data.caption,
        phone1: phoneNumbers[0] || null,
        phone2: phoneNumbers[1] || null,
        title,
        sourceAccount,
        imageUrl: data.imageUrl,
        taggedAccounts: taggedAccounts || []
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

      const account = config.scraping.targetAccounts[0];
      const skipFirst = config.scraping.skipFirstN || 1000;
      const scrapeCount = config.scraping.scrapeCount || 100;

      console.log(`\n${'='.repeat(70)}`);
      console.log(`  Scraping account: @${account}`);
      console.log(`  Strategy: Skip first ${skipFirst} posts, then scrape ${scrapeCount} posts`);
      console.log('='.repeat(70) + '\n');

      const url = `https://www.instagram.com/${account}/`;
      console.log(`Navigating to ${url}...`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(5000);

      // Collect enough posts to skip and scrape
      const totalNeeded = skipFirst + scrapeCount;
      console.log(`Need to collect ${totalNeeded} posts total...\n`);

      const allPosts = await this.collectPosts(totalNeeded);

      if (allPosts.length < totalNeeded) {
        console.log(`\n⚠ Warning: Only collected ${allPosts.length} posts (needed ${totalNeeded})`);
        console.log(`Will proceed with available posts...\n`);
      }

      // Skip first N and take next scrapeCount
      const postsToScrape = allPosts.slice(skipFirst, skipFirst + scrapeCount);
      console.log(`\n✓ Posts collected: ${allPosts.length}`);
      console.log(`✓ Skipping first: ${skipFirst}`);
      console.log(`✓ Scraping posts: ${postsToScrape.length} (from #${skipFirst + 1} to #${skipFirst + postsToScrape.length})\n`);

      let savedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < postsToScrape.length; i++) {
        const postNum = skipFirst + i + 1;
        console.log(`\n[${i + 1}/${postsToScrape.length}] Processing post #${postNum}...`);
        console.log(`  URL: ${postsToScrape[i].url}`);

        const postData = await this.scrapePost(postsToScrape[i].url, account);

        if (postData && postData.date) {
          const saved = this.savePost(postData);
          if (saved) {
            console.log(`  ✓ SAVED`);
            console.log(`  📅 Date: ${new Date(postData.date).toLocaleDateString()}`);
            console.log(`  📌 Title: ${postData.title}`);
            const phones = [postData.phone1, postData.phone2].filter(p => p).join(', ');
            console.log(`  📱 Phones: ${phones || 'None'}`);
            if (postData.taggedAccounts && postData.taggedAccounts.length > 0) {
              console.log(`  🏢 Organizer: @${postData.taggedAccounts[0].username} (${postData.taggedAccounts[0].name.substring(0, 40)}...)`);
            }
            savedCount++;
          } else {
            console.log(`  - Already exists in database`);
          }
        } else {
          console.log(`  ✗ FAILED - Could not extract data`);
          failedCount++;
        }

        await delay(1000);
      }

      console.log(`\n${'='.repeat(70)}`);
      console.log(`  SCRAPING COMPLETE!`);
      console.log('='.repeat(70));
      console.log(`  Posts processed: ${postsToScrape.length}`);
      console.log(`  Successfully saved: ${savedCount}`);
      console.log(`  Failed: ${failedCount}`);
      console.log('='.repeat(70) + '\n');

    } catch (error) {
      console.error('\n❌ Scraping error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      this.db.close();
    }
  }
}

// Run scraper
const scraper = new ImprovedInstagramScraper();
scraper.scrape();
