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
    console.log('\n🔍 Instagram Date Checker\n');
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

  async collectPosts(targetCount) {
    const posts = [];
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrolls = 200; // Increased to get more posts

    console.log(`Collecting posts (targeting ${targetCount}+)...`);

    while (scrollAttempts < maxScrolls && posts.length < targetCount + 50) {
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
      await delay(1000);

      const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
      if (currentHeight === previousHeight) {
        console.log('\nReached end of page');
        break;
      }
      previousHeight = currentHeight;
      scrollAttempts++;

      if (scrollAttempts % 10 === 0) {
        console.log(`  Scrolled ${scrollAttempts} times, collected ${posts.length} posts...`);
      }

      if (posts.length >= targetCount + 50) {
        break;
      }
    }

    return posts;
  }

  async checkDate(postUrl) {
    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1500);

      const data = await this.page.evaluate(() => {
        const timeElement = document.querySelector('time');
        const dateStr = timeElement?.getAttribute('datetime') || null;
        return { date: dateStr };
      });

      return data.date;
    } catch (error) {
      return null;
    }
  }

  async run() {
    try {
      await this.init();
      await this.handleLogin();

      const url = `https://www.instagram.com/${TARGET_ACCOUNT}/`;
      console.log(`Navigating to @${TARGET_ACCOUNT}...`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await delay(3000);

      const posts = await this.collectPosts(1001);

      console.log(`\n${'='.repeat(60)}`);
      console.log(`Total posts collected: ${posts.length}`);
      console.log('='.repeat(60));

      if (posts.length < 1001) {
        console.log(`\n⚠ Only found ${posts.length} posts total.`);
        console.log('The account may not have 1000+ posts.\n');

        // Show last post date
        if (posts.length > 0) {
          console.log(`Checking last post (${posts.length})...`);
          const lastPostDate = await this.checkDate(posts[posts.length - 1].url);
          if (lastPostDate) {
            console.log(`Last post date: ${new Date(lastPostDate).toLocaleDateString()}`);
          }
        }
      } else {
        // Check post 1001
        console.log(`\nChecking post #1001...`);
        const post1001 = posts[1000]; // Index 1000 = post 1001
        console.log(`URL: ${post1001.url}`);

        const dateStr = await this.checkDate(post1001.url);

        if (dateStr) {
          const postDate = new Date(dateStr);
          console.log(`\n📅 Post #1001 Date: ${postDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`);
          console.log(`   ISO Format: ${dateStr}`);
          console.log(`   Readable: ${postDate.toLocaleString()}`);
        } else {
          console.log('\n⚠ Could not extract date from post');
        }

        // Show some sample posts around 1001
        console.log(`\n${'='.repeat(60)}`);
        console.log('Sample posts around #1001:');
        console.log('='.repeat(60));

        for (let i = 995; i < Math.min(1005, posts.length); i++) {
          console.log(`\nPost #${i + 1}: ${posts[i].url}`);
          if (posts[i].time) {
            const date = new Date(posts[i].time);
            console.log(`  Date: ${date.toLocaleDateString()}`);
          } else {
            console.log(`  Date: Not available in feed (need to open post)`);
          }
        }
      }

      console.log(`\n${'='.repeat(60)}\n`);

    } catch (error) {
      console.error('\n❌ Error:', error.message);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

const checker = new DateChecker();
checker.run();
