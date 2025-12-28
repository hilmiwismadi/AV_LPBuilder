import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cookiesPath = join(__dirname, 'instagram-cookies.json');
const configPath = join(__dirname, 'config.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load configuration
let config = {
  instagram: { username: '', password: '' }
};

if (existsSync(configPath)) {
  config = JSON.parse(readFileSync(configPath, 'utf-8'));
}

class TaggedScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

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

  async init() {
    console.log('\n🔄 Starting Tagged Person Scraper Test...\n');
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

  async closePopups() {
    try {
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
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  // Get profile name from an Instagram account
  async getProfileName(username) {
    try {
      const profileUrl = `https://www.instagram.com/${username}/`;
      console.log(`      → Visiting profile: ${profileUrl}`);

      await this.page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await delay(2000);

      // Extract profile name
      const profileData = await this.page.evaluate(() => {
        // Try to get the name from the header
        const nameSelectors = [
          'header section h2',
          'header section span',
          'section span[dir="auto"]',
        ];

        let name = '';
        for (const selector of nameSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = element.textContent?.trim();
            if (text && text.length > 0 && text !== 'Posts' && text !== 'Followers' && text !== 'Following') {
              if (text.length > name.length) {
                name = text;
              }
            }
          }
        }

        // If no name found, try getting from meta tags
        if (!name) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            const content = metaDescription.content;
            // Format: "X Followers, Y Following, Z Posts - See Instagram photos..."
            // or "Name (@username) • Instagram photos..."
            const match = content.match(/^([^(•]+)/);
            if (match) {
              name = match[1].trim();
            }
          }
        }

        return { name };
      });

      console.log(`      ✓ Name: ${profileData.name || 'Not found'}`);
      return profileData.name || null;

    } catch (error) {
      console.error(`      ✗ Error getting profile name: ${error.message}`);
      return null;
    }
  }

  // Scrape a single post for tagged people and @mentions
  async scrapePost(postUrl) {
    try {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📍 Scraping: ${postUrl}`);
      console.log('='.repeat(70));

      await this.page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await delay(3000);

      await this.closePopups();
      await delay(1000);

      const results = {
        postUrl,
        taggedAccounts: [],
        mentionedAccounts: []
      };

      // 1. Extract tagged people from the post
      console.log('\n📌 Looking for TAGGED people in post...');

      const taggedPeople = await this.page.evaluate(() => {
        const tagged = [];

        // Look for tagged people indicators
        const tagLinks = document.querySelectorAll('a[href*="/"]');

        for (const link of tagLinks) {
          const href = link.getAttribute('href');
          if (href && href.startsWith('/') && !href.includes('/p/') && !href.includes('/reel/')) {
            const username = href.replace('/', '').split('/')[0];
            if (username && username.length > 0 && !username.includes('?')) {
              // Check if this is near an image or in a tagged context
              const parent = link.closest('article');
              if (parent) {
                tagged.push(username);
              }
            }
          }
        }

        return [...new Set(tagged)]; // Remove duplicates
      });

      console.log(`   Found ${taggedPeople.length} potentially tagged account(s)`);

      // 2. Extract @mentions from caption
      console.log('\n@ Looking for @MENTIONS in caption...');

      const mentions = await this.page.evaluate(() => {
        const mentionedUsers = [];

        // Look for @username in caption
        const allLinks = document.querySelectorAll('a[href*="/"]');

        for (const link of allLinks) {
          const href = link.getAttribute('href');
          const text = link.textContent?.trim();

          if (text && text.startsWith('@')) {
            const username = text.substring(1); // Remove @
            if (username && username.length > 0) {
              mentionedUsers.push(username);
            }
          } else if (href && href.startsWith('/') && !href.includes('/p/') && !href.includes('/reel/')) {
            const username = href.replace('/', '').split('/')[0].split('?')[0];
            if (username && username.length > 0) {
              // Check if this link is in the caption area
              const article = link.closest('article');
              if (article) {
                const captionContainer = link.closest('div[class*="Caption"]') ||
                                       link.closest('h1') ||
                                       link.closest('span[dir="auto"]');
                if (captionContainer) {
                  mentionedUsers.push(username);
                }
              }
            }
          }
        }

        return [...new Set(mentionedUsers)]; // Remove duplicates
      });

      console.log(`   Found ${mentions.length} @mention(s) in caption`);

      // 3. Get profile names for tagged accounts
      if (taggedPeople.length > 0) {
        console.log('\n🔍 Getting names for TAGGED accounts...');
        for (const username of taggedPeople.slice(0, 3)) { // Limit to first 3 to avoid rate limiting
          const name = await this.getProfileName(username);
          if (name) {
            results.taggedAccounts.push({
              username,
              profileUrl: `https://www.instagram.com/${username}/`,
              name
            });
          }
          await delay(2000); // Be respectful
        }
      }

      // 4. Get profile names for mentioned accounts
      if (mentions.length > 0) {
        console.log('\n🔍 Getting names for @MENTIONED accounts...');
        for (const username of mentions.slice(0, 3)) { // Limit to first 3
          const name = await this.getProfileName(username);
          if (name) {
            results.mentionedAccounts.push({
              username,
              profileUrl: `https://www.instagram.com/${username}/`,
              name
            });
          }
          await delay(2000); // Be respectful
        }
      }

      console.log('\n✅ Scraping complete for this post\n');
      return results;

    } catch (error) {
      console.error('Error scraping post:', error.message);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Test with the 3 provided links
async function runTest() {
  const scraper = new TaggedScraper();

  try {
    await scraper.init();

    const loginSuccess = await scraper.handleLogin();
    if (!loginSuccess) {
      console.log('\n❌ Cannot proceed without login. Exiting...\n');
      return;
    }

    const testUrls = [
      'https://www.instagram.com/medialombaplus/p/DJWu8MXTB4y/',
      'https://www.instagram.com/infolomba.sch/p/DJUEzfIzr0N/',
      'https://www.instagram.com/infolomba.sch/p/DJTLtX7zSX7/'
    ];

    const allResults = [];

    for (const url of testUrls) {
      const result = await scraper.scrapePost(url);
      if (result) {
        allResults.push(result);
      }
      await delay(3000); // Wait between posts
    }

    // Generate markdown report
    let markdown = '# Tagged Person Scraping Test Results\n\n';
    markdown += `Test run: ${new Date().toISOString()}\n\n`;
    markdown += '---\n\n';

    for (let i = 0; i < allResults.length; i++) {
      const result = allResults[i];

      markdown += `## Test ${i + 1}\n\n`;
      markdown += `**Link:** ${result.postUrl}\n\n`;

      if (result.taggedAccounts.length > 0) {
        markdown += `### Tagged Accounts:\n\n`;
        result.taggedAccounts.forEach(account => {
          markdown += `- **IG Account:** ${account.profileUrl}\n`;
          markdown += `  **Name:** ${account.name}\n\n`;
        });
      }

      if (result.mentionedAccounts.length > 0) {
        markdown += `### @Mentioned Accounts:\n\n`;
        result.mentionedAccounts.forEach(account => {
          markdown += `- **IG Account:** ${account.profileUrl}\n`;
          markdown += `  **Name:** ${account.name}\n\n`;
        });
      }

      if (result.taggedAccounts.length === 0 && result.mentionedAccounts.length === 0) {
        markdown += `*No tagged accounts or @mentions found*\n\n`;
      }

      markdown += '---\n\n';
    }

    // Save results to markdown file
    const outputPath = join(__dirname, 'tagged-scraping-results.md');
    writeFileSync(outputPath, markdown);
    console.log(`\n✅ Results saved to: ${outputPath}\n`);

    // Also print to console
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY OF RESULTS');
    console.log('='.repeat(70) + '\n');
    console.log(markdown);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await scraper.close();
  }
}

// Run the test
runTest();
