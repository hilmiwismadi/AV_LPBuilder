import puppeteer from 'puppeteer';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cookiesPath = join(__dirname, 'instagram-cookies.json');
const configPath = join(__dirname, 'config.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load config
const config = JSON.parse(readFileSync(configPath, 'utf-8'));
const TARGET_ACCOUNT = config.scraping.targetAccounts[0];

class DateChecker {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('\n🔍 Instagram Deep Scroll Date Checker\n');
    console.log('Launching browser...');

    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    // Increase timeout
    this.page.setDefaultTimeout(60000);

    console.log('✓ Browser launched\n');
  }

  async loadCookies() {
    if (existsSync(cookiesPath)) {
      const cookies = JSON.parse(readFileSync(cookiesPath, 'utf-8'));
      await this.page.setCookie(...cookies);
      console.log('✓ Session loaded');
      return true;
    }
    return false;
  }

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
        console.log('Login button clicked, waiting...');
        await delay(5000);

        // Skip dialogs
        try {
          const notNowButton = await this.page.$x("//button[contains(text(), 'Not Now')]");
          if (notNowButton.length > 0) {
            await notNowButton[0].click();
            await delay(2000);
          }
        } catch (e) {}

        try {
          const notNowButton2 = await this.page.$x("//button[contains(text(), 'Not Now')]");
          if (notNowButton2.length > 0) {
            await notNowButton2[0].click();
            await delay(2000);
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

  async handleLogin() {
    console.log('Navigating to Instagram...');
    await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2', timeout: 60000 });

    const cookiesLoaded = await this.loadCookies();

    if (cookiesLoaded) {
      await this.page.reload({ waitUntil: 'networkidle2' });
      await delay(3000);
      console.log('✓ Logged in!\n');
      return true;
    }

    // Login with credentials
    if (config.instagram.username && config.instagram.password) {
      await this.loginWithCredentials(config.instagram.username, config.instagram.password);
      await delay(3000);
      console.log('✓ Logged in!\n');
      return true;
    }

    return false;
  }

  async collectPostsAggressive(targetCount) {
    const posts = new Map(); // Use Map to avoid duplicates
    let scrollAttempts = 0;
    let noNewPostsCount = 0;
    const maxScrolls = 500; // Much higher limit
    const maxNoNewPosts = 5; // Stop if no new posts after 5 scrolls

    console.log(`\n📜 Starting aggressive scroll (targeting ${targetCount} posts)...\n`);
    console.log('⏳ This will take several minutes. Please be patient...\n');

    while (scrollAttempts < maxScrolls && posts.size < targetCount + 50) {
      const previousSize = posts.size;

      // Method 1: Scroll to bottom
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await delay(2000); // Longer delay

      // Method 2: Scroll by large amount
      await this.page.evaluate(() => {
        window.scrollBy(0, 3000);
      });
      await delay(1500);

      // Method 3: Scroll to last article element
      try {
        await this.page.evaluate(() => {
          const articles = document.querySelectorAll('article');
          if (articles.length > 0) {
            articles[articles.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        });
        await delay(1500);
      } catch (e) {
        // Continue if this fails
      }

      // Collect new posts
      const newPosts = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
        return links.map(link => {
          const article = link.closest('article');
          const time = article?.querySelector('time')?.getAttribute('datetime') || null;
          return {
            url: link.href,
            time: time
          };
        });
      });

      // Add to Map (automatically handles duplicates)
      for (const post of newPosts) {
        if (!posts.has(post.url)) {
          posts.set(post.url, post);
        }
      }

      scrollAttempts++;

      // Check if we got new posts
      if (posts.size === previousSize) {
        noNewPostsCount++;
        if (noNewPostsCount >= maxNoNewPosts) {
          console.log(`\n⚠ No new posts loaded after ${maxNoNewPosts} scroll attempts`);
          console.log('Instagram may have reached the limit or is rate limiting.\n');
          break;
        }
      } else {
        noNewPostsCount = 0; // Reset counter
      }

      // Progress update every 10 scrolls
      if (scrollAttempts % 10 === 0) {
        console.log(`  📊 Progress: Scrolled ${scrollAttempts}x | Collected ${posts.size} posts | Target: ${targetCount}`);
      }

      // Extra long delay every 50 scrolls to avoid detection
      if (scrollAttempts % 50 === 0) {
        console.log(`  ⏸  Taking a short break to avoid rate limiting...`);
        await delay(5000);
      }

      // Stop if we have enough
      if (posts.size >= targetCount + 50) {
        console.log(`\n✓ Target reached! Collected ${posts.size} posts`);
        break;
      }
    }

    console.log(`\n📊 Final count: ${posts.size} posts collected after ${scrollAttempts} scroll attempts\n`);

    return Array.from(posts.values());
  }

  async checkDate(postUrl) {
    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1500);

      const data = await this.page.evaluate(() => {
        const timeElement = document.querySelector('time');
        const dateStr = timeElement?.getAttribute('datetime') || null;

        // Also try to get caption
        let caption = '';
        const captionSelectors = ['h1', '[class*="Caption"]', 'span[dir="auto"]'];
        for (const selector of captionSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            caption = element.textContent.substring(0, 100);
            break;
          }
        }

        return { date: dateStr, caption };
      });

      return data;
    } catch (error) {
      return { date: null, caption: null };
    }
  }

  async run() {
    try {
      await this.init();
      await this.handleLogin();

      const url = `https://www.instagram.com/${TARGET_ACCOUNT}/`;
      console.log(`Navigating to @${TARGET_ACCOUNT}...`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(5000); // Wait longer for initial load

      const posts = await this.collectPostsAggressive(1001);

      console.log(`\n${'='.repeat(70)}`);
      console.log(`  RESULTS FOR @${TARGET_ACCOUNT}`);
      console.log('='.repeat(70));
      console.log(`  Total posts collected: ${posts.length}`);
      console.log('='.repeat(70));

      if (posts.length < 1001) {
        console.log(`\n⚠ Only collected ${posts.length} posts.`);
        console.log(`   Instagram may be rate limiting, or the account has fewer posts.`);

        // Show last 5 posts
        console.log(`\n📅 Last 5 posts collected:\n`);
        const lastFive = posts.slice(-5);
        for (let i = 0; i < lastFive.length; i++) {
          const post = lastFive[i];
          const postNum = posts.length - (lastFive.length - i - 1);
          console.log(`Post #${postNum}:`);
          console.log(`  URL: ${post.url}`);
          if (post.time) {
            const date = new Date(post.time);
            console.log(`  📅 Date: ${date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`);
          } else {
            console.log(`  📅 Date: Need to check post individually`);
          }
          console.log('');
        }

        // Check the last post individually
        if (posts.length > 0) {
          console.log(`\nFetching detailed info for last post (#${posts.length})...`);
          const lastPostData = await this.checkDate(posts[posts.length - 1].url);
          if (lastPostData.date) {
            const date = new Date(lastPostData.date);
            console.log(`\n📅 Last Post (#${posts.length}) Date: ${date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`);
            console.log(`   Time: ${date.toLocaleTimeString()}`);
            if (lastPostData.caption) {
              console.log(`   Caption: ${lastPostData.caption}...`);
            }
          }
        }

      } else {
        // We got 1001+ posts!
        console.log(`\n✅ SUCCESS! Collected enough posts to reach #1001\n`);

        const post1001 = posts[1000]; // Index 1000 = post 1001
        console.log(`Checking post #1001...`);
        console.log(`URL: ${post1001.url}`);

        const postData = await this.checkDate(post1001.url);

        if (postData.date) {
          const postDate = new Date(postData.date);
          console.log(`\n${'='.repeat(70)}`);
          console.log(`  📅 POST #1001 DATE`);
          console.log('='.repeat(70));
          console.log(`  Date: ${postDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`);
          console.log(`  Time: ${postDate.toLocaleTimeString()}`);
          console.log(`  ISO: ${postData.date}`);
          if (postData.caption) {
            console.log(`  Caption Preview: ${postData.caption}...`);
          }
          console.log('='.repeat(70));
        } else {
          console.log(`\n⚠ Could not extract date from post #1001`);
        }

        // Show posts around 1001
        console.log(`\n📋 Posts around #1001 (samples):\n`);
        for (let i = 996; i < Math.min(1006, posts.length); i++) {
          const post = posts[i];
          console.log(`Post #${i + 1}:`);
          if (post.time) {
            const date = new Date(post.time);
            console.log(`  📅 ${date.toLocaleDateString()} - ${post.url}`);
          } else {
            console.log(`  📅 Unknown date - ${post.url}`);
          }
        }
      }

      console.log(`\n${'='.repeat(70)}\n`);
      console.log('💡 Tip: If you need to scrape from a specific post number,');
      console.log('   we can modify the scraper to skip the first N posts.\n');

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
    } finally {
      if (this.browser) {
        console.log('\nClosing browser...');
        await this.browser.close();
      }
    }
  }
}

const checker = new DateChecker();
checker.run();
