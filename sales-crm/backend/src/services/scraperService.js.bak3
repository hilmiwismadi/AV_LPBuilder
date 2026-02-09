import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { decrypt } from '../utils/encryptionService.js';

const prisma = new PrismaClient();

const activeConnections = new Map();
const activeDrivers = new Map();

function extractUsername(profileUrl) {
  const match = profileUrl.match(/instagram\.com\/([^\/]+)/);
  return match ? match[1].replace('/', '') : null;
}

function extractPhoneNumbers(text) {
  if (!text) return { phone1: null, phone2: null };

  const patterns = [
    /(\+62|62|0)[0-9]{9,12}/g,
    /\b[0-9]{10,14}\b/g
  ];

  const phones = new Set();

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(phone => phones.add(phone));
    }
  }

  const phoneArray = Array.from(phones);
  return {
    phone1: phoneArray[0] || null,
    phone2: phoneArray[1] || null
  };
}

function parsePostDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

function emitProgress(sessionId, data) {
  const connection = activeConnections.get(sessionId);
  if (connection && !connection.res.writableEnded) {
    connection.res.write("data: " + JSON.stringify(data) + "\n\n");
  }
}

function emitLog(sessionId, message, level = 'info') {
  // Also log to PM2 logs (will appear in /logs page)
  const shortId = sessionId.substring(0, 8);
  const logMessage = '[SCRAPER ' + shortId + '] [' + level.toUpperCase() + '] ' + message;
  console.log(logMessage);

  emitProgress(sessionId, {
    type: 'log',
    level,
    message,
    timestamp: new Date().toISOString()
  });
}

async function scrapeInstagram(sessionData) {
  const { sessionId, profileUrl, startPostIndex, endPostIndex, useAuth, instagramUsername, instagramPassword } = sessionData;

  let driver = null;

  try {
    emitLog(sessionId, '=== STARTING SCRAPING SESSION ===');
    emitLog(sessionId, 'Profile URL: ' + profileUrl);
    emitLog(sessionId, 'Post range: ' + startPostIndex + ' to ' + endPostIndex);
    emitLog(sessionId, 'Use authentication: ' + useAuth);

    emitLog(sessionId, 'Starting Selenium WebDriver in headless mode (VPS has no display)...');

    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    activeDrivers.set(sessionId, driver);
    emitLog(sessionId, 'Browser window opened successfully');

    emitLog(sessionId, 'Navigating to Instagram homepage...');
    await driver.get('https://www.instagram.com/');
    emitLog(sessionId, 'Loaded Instagram homepage');

    if (useAuth && instagramUsername && instagramPassword) {
      emitLog(sessionId, '=== LOGIN PROCESS ===');
      emitLog(sessionId, 'Username: ' + instagramUsername);

      try {
        const decryptedPassword = decrypt(instagramPassword);
        emitLog(sessionId, 'Password decrypted successfully');

        emitLog(sessionId, 'Looking for cookie consent dialog...');
        try {
          const acceptButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Accept')]")), 3000);
          await acceptButton.click();
          await driver.sleep(1000);
          emitLog(sessionId, 'Cookie consent accepted');
        } catch (e) {
          emitLog(sessionId, 'No cookie consent dialog found (continuing)', 'warning');
        }

        emitLog(sessionId, 'Waiting for login form...');
        const usernameInput = await driver.wait(until.elementLocated(By.name('username')), 10000);
        await usernameInput.sendKeys(instagramUsername);
        emitLog(sessionId, 'Username entered');

        const passwordInput = await driver.findElement(By.name('password'));
        await passwordInput.sendKeys(decryptedPassword);
        emitLog(sessionId, 'Password entered');

        const loginButton = await driver.findElement(By.xpath('//button[@type="submit"]'));
        await loginButton.click();
        emitLog(sessionId, 'Login button clicked');

        emitLog(sessionId, 'Waiting for login to complete...');
        await driver.sleep(5000);
        emitLog(sessionId, 'Login completed');

        try {
          const notNowButtons = await driver.findElements(By.xpath('//button[contains(text(), "Not Now")]'));
          emitLog(sessionId, 'Found ' + notNowButtons.length + ' Not Now buttons');
          for (const button of notNowButtons.slice(0, 2)) {
            await button.click();
            await driver.sleep(1000);
          }
          emitLog(sessionId, 'Dismissed Not Now prompts');
        } catch (e) {
          emitLog(sessionId, 'No Not Now prompts found', 'warning');
        }

        emitLog(sessionId, 'Successfully logged in to Instagram');
      } catch (error) {
        emitLog(sessionId, 'Login failed: ' + error.message, 'error');
        emitLog(sessionId, 'Continuing without login...', 'warning');
      }
    } else {
      emitLog(sessionId, 'Skipping authentication (not requested)');
    }

    const username = extractUsername(profileUrl);
    if (!username) {
      emitLog(sessionId, 'Invalid Instagram profile URL', 'error');
      throw new Error('Invalid Instagram profile URL');
    }

    emitLog(sessionId, '=== NAVIGATING TO PROFILE ===');
    emitLog(sessionId, 'Target profile: @' + username);
    await driver.get('https://www.instagram.com/' + username + '/');
    emitLog(sessionId, 'Navigated to profile page');

    emitLog(sessionId, 'Waiting for page to load...');
    await driver.sleep(5000);

    const pageText = await driver.findElement(By.tagName('body')).getText();
    if (pageText.includes('This Account is Private') || pageText.includes('Follow this account to see their photos and videos.')) {
      emitLog(sessionId, 'Profile is PRIVATE - login required', 'error');
      throw new Error('This profile is private. Please login to view posts.');
    }
    emitLog(sessionId, 'Profile is public (accessible)');

    emitLog(sessionId, '=== LOADING POSTS BY SCROLLING ===');
    const scrollIterations = 30;
    emitLog(sessionId, 'Will scroll ' + scrollIterations + ' times to load posts...');

    // Scroll to load posts
    for (let i = 0; i < scrollIterations; i++) {
      await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
      await driver.sleep(2000);

      if ((i + 1) % 5 === 0) {
        emitLog(sessionId, 'Scrolled ' + (i + 1) + '/' + scrollIterations + ' times');
      }

      emitProgress(sessionId, {
        type: 'progress',
        message: 'Scrolling to load more posts...',
        scrollCount: i + 1,
        totalScrolls: scrollIterations
      });
    }
    emitLog(sessionId, 'Scrolling completed');

    emitLog(sessionId, '=== EXTRACTING POST LINKS ===');

    // Get all post links
    const postElements = await driver.findElements(By.css('a[href*="/p/"]'));
    emitLog(sessionId, 'Found ' + postElements.length + ' post link elements');

    const postUrls = new Set();
    for (const element of postElements) {
      const href = await element.getAttribute('href');
      if (href && href.includes('/p/') && !postUrls.has(href)) {
        postUrls.add(href);
      }
    }
    emitLog(sessionId, 'Extracted ' + postUrls.size + ' unique post URLs');

    const postsArray = Array.from(postUrls);
    const postsToScrape = postsArray.slice(startPostIndex, Math.min(endPostIndex, postsArray.length));

    emitLog(sessionId, '=== SCRAPING CONFIGURATION ===');
    emitLog(sessionId, 'Total posts found: ' + postsArray.length);
    emitLog(sessionId, 'Start index: ' + startPostIndex);
    emitLog(sessionId, 'End index: ' + endPostIndex);
    emitLog(sessionId, 'Posts to scrape: ' + postsToScrape.length);

    let scrapedCount = 0;
    let phoneCount = 0;
    let skippedCount = 0;

    emitLog(sessionId, '=== STARTING POST SCRAPING ===');

    for (let i = 0; i < postsToScrape.length; i++) {
      const postUrl = postsToScrape[i];
      const actualIndex = startPostIndex + i;

      try {
        emitLog(sessionId, '--- Post ' + (actualIndex + 1) + '/' + endPostIndex + ' ---');
        emitLog(sessionId, 'URL: ' + postUrl);

        await driver.get(postUrl);
        await driver.sleep(3000);
        emitLog(sessionId, 'Page loaded');

        const pageSource = await driver.getPageSource();

        let caption = '';
        const captionPatterns = [
          /<h1[^>]*>([^<]+)<\/h1>/g,
          /<div[^>]*data-testid="post-comment-root"[^>]*>([^<]+)<\/div>/g,
          /<span[^>]*dir="auto"[^>]*>([^<]+)<\/span>/g
        ];

        for (const pattern of captionPatterns) {
          const match = pageSource.match(pattern);
          if (match && match[1] && match[1].length > 10) {
            caption = match[1].trim();
            break;
          }
        }
        emitLog(sessionId, 'Caption length: ' + caption.length + ' characters');

        const dateMatch = pageSource.match(/<time[^>]*datetime="([^"]+)"/);
        const postDate = dateMatch ? dateMatch[1] : null;
        emitLog(sessionId, 'Post date: ' + (postDate || 'N/A'));

        const imageMatch = pageSource.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
        const imageUrl = imageMatch ? imageMatch[1] : null;
        emitLog(sessionId, 'Image URL: ' + (imageUrl ? 'Found' : 'Not found'));

        const { phone1, phone2 } = extractPhoneNumbers(caption);
        emitLog(sessionId, 'Phone numbers: ' + (phone1 || 'None') + (phone2 ? ', ' + phone2 : ''));

        let eventTitle = null;
        let eventOrganizer = null;

        if (caption) {
          const lines = caption.split('\n').filter(l => l.trim());
          eventTitle = lines[0] || null;
          eventOrganizer = lines[1] || null;
        }
        emitLog(sessionId, 'Event title: ' + (eventTitle || 'N/A'));
        emitLog(sessionId, 'Organizer: ' + (eventOrganizer || 'N/A'));

        const scrapedPost = await prisma.scrapedPost.create({
          data: {
            sessionId,
            postIndex: actualIndex,
            postUrl,
            postDate: parsePostDate(postDate),
            eventTitle,
            eventOrganizer,
            phoneNumber1: phone1,
            phoneNumber2: phone2,
            imageUrl,
            caption: caption,
            rawSource: JSON.stringify({ pageSource })
          }
        });
        emitLog(sessionId, 'Saved to database (ID: ' + scrapedPost.id.substring(0, 8) + ')');

        scrapedCount++;
        if (phone1 || phone2) {
          phoneCount++;
          emitLog(sessionId, 'HAS PHONE NUMBER');
        } else {
          emitLog(sessionId, 'No phone number found', 'warning');
        }

        emitProgress(sessionId, {
          type: 'post_scraped',
          postIndex: actualIndex,
          eventTitle,
          hasPhone: !!(phone1 || phone2),
          stats: {
            total: scrapedCount,
            withPhone: phoneCount,
            skipped: skippedCount
          }
        });

        emitLog(sessionId, 'Post scraped successfully');

        const delay = 2000 + Math.random() * 2000;
        emitLog(sessionId, 'Waiting ' + Math.round(delay/1000) + 's before next post...');
        await driver.sleep(delay);

      } catch (error) {
        emitLog(sessionId, 'Failed to scrape post ' + (actualIndex + 1) + ': ' + error.message, 'error');
        skippedCount++;
      }
    }

    emitLog(sessionId, '=== SCRAPING SUMMARY ===');
    emitLog(sessionId, 'Total posts processed: ' + postsToScrape.length);
    emitLog(sessionId, 'Successfully scraped: ' + scrapedCount);
    emitLog(sessionId, 'Posts with phone numbers: ' + phoneCount);
    emitLog(sessionId, 'Skipped/Failed: ' + skippedCount);
    emitLog(sessionId, 'Scraping completed successfully!');

    await prisma.scrapingSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        totalPosts: postsArray.length,
        successfulPosts: scrapedCount,
        postsWithPhone: phoneCount,
        completedAt: new Date()
      }
    });

    emitProgress(sessionId, {
      type: 'completed',
      stats: {
        total: postsArray.length,
        successful: scrapedCount,
        withPhone: phoneCount,
        skipped: skippedCount
      }
    });

  } catch (error) {
    emitLog(sessionId, 'FATAL ERROR: ' + error.message, 'error');
    emitLog(sessionId, 'Error stack: ' + error.stack, 'error');

    await prisma.scrapingSession.update({
      where: { id: sessionId },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        completedAt: new Date()
      }
    });

    emitProgress(sessionId, {
      type: 'error',
      message: error.message
    });

  } finally {
    emitLog(sessionId, '=== CLEANING UP ===');
    if (driver) {
      emitLog(sessionId, 'Closing browser...');
      await driver.quit().catch(() => {});
      emitLog(sessionId, 'Browser closed');
    }
    activeDrivers.delete(sessionId);

    emitLog(sessionId, 'Closing SSE connection in 5 seconds...');
    setTimeout(() => {
      const connection = activeConnections.get(sessionId);
      if (connection && !connection.res.writableEnded) {
        connection.res.end();
      }
      activeConnections.delete(sessionId);
      emitLog(sessionId, 'Connection closed');
    }, 5000);

    emitLog(sessionId, '=== SESSION END ===');
  }
}

export async function startSession(sessionData) {
  const { profileUrl, startPostIndex, endPostIndex, useAuth, instagramUsername, instagramPassword } = sessionData;

  const username = extractUsername(profileUrl);
  if (!username) {
    throw new Error('Invalid Instagram profile URL');
  }

  const slug = nanoid(10);

  console.log('[SCRAPER] Creating new scraping session for profile: ' + username);

  const session = await prisma.scrapingSession.create({
    data: {
      slug,
      profileUrl,
      username,
      startPostIndex,
      endPostIndex,
      useAuth,
      instagramUsername: useAuth ? instagramUsername : null,
      instagramPassword: useAuth ? instagramPassword : null,
      status: 'PENDING'
    }
  });

  console.log('[SCRAPER] Session created with ID: ' + session.id + ', Slug: ' + slug);

  setImmediate(() => {
    scrapeInstagram({
      sessionId: session.id,
      profileUrl,
      startPostIndex,
      endPostIndex,
      useAuth,
      instagramUsername,
      instagramPassword
    });
  });

  return session;
}

export function registerConnection(sessionId, res) {
  activeConnections.set(sessionId, { res, startTime: Date.now() });

  console.log('[SCRAPER] SSE connection registered for session: ' + sessionId);

  const sendStatus = async () => {
    const session = await prisma.scrapingSession.findUnique({
      where: { id: sessionId }
    });

    if (session) {
      emitProgress(sessionId, {
        type: 'status',
        status: session.status,
        stats: {
          total: session.totalPosts,
          successful: session.successfulPosts,
          withPhone: session.postsWithPhone
        }
      });
    }
  };

  sendStatus();

  prisma.scrapingSession.update({
    where: { id: sessionId },
    data: { status: 'RUNNING', startedAt: new Date() }
  }).catch(() => {});
}

export async function cancelSession(sessionId) {
  console.log('[SCRAPER] Cancelling session: ' + sessionId);

  const driver = activeDrivers.get(sessionId);
  if (driver) {
    await driver.quit().catch(() => {});
    activeDrivers.delete(sessionId);
  }

  await prisma.scrapingSession.update({
    where: { id: sessionId },
    data: {
      status: 'CANCELLED',
      completedAt: new Date()
    }
  });

  const connection = activeConnections.get(sessionId);
  if (connection && !connection.res.writableEnded) {
    emitProgress(sessionId, { type: 'cancelled' });
    connection.res.end();
  }
  activeConnections.delete(sessionId);

  console.log('[SCRAPER] Session cancelled: ' + sessionId);
}

export async function getSessionBySlug(slug) {
  const session = await prisma.scrapingSession.findUnique({
    where: { slug },
    include: {
      scrapedPosts: {
        orderBy: { postIndex: 'asc' }
      }
    }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  return session;
}

export async function getSessions(options = {}) {
  const { status, limit = 20, offset = 0 } = options;

  const where = status ? { status } : {};

  const [sessions, total] = await Promise.all([
    prisma.scrapingSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.scrapingSession.count({ where })
  ]);

  return { sessions, total, limit, offset };
}

export async function deleteSession(sessionId) {
  console.log("[SCRAPER] Deleting session: " + sessionId);
  await prisma.scrapingSession.delete({
    where: { id: sessionId }
  });
  console.log("[SCRAPER] Session deleted: " + sessionId);
}

export default {
  startSession,
  registerConnection,
  cancelSession,
  getSessionBySlug,
  getSessions,
  deleteSession
};
