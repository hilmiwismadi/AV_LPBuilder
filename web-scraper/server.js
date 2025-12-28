import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Scraping status tracking
let scrapingStatus = {
  isRunning: false,
  currentAccount: '',
  totalCollected: 0,
  currentProcessing: 0,
  totalToProcess: 0,
  successCount: 0,
  failCount: 0,
  startTime: null,
  logs: []
};

// Store current scraper process for stopping
let currentScraperProcess = null;

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Database connection
const dbPath = join(__dirname, 'crm-events.db');
const db = new Database(dbPath);

// API Routes

// Get all posts with pagination
app.get('/api/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const posts = db.prepare(`
      SELECT * FROM scraped_posts
      ORDER BY post_date DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM scraped_posts').get();

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post by ID
app.get('/api/posts/:id', (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM scraped_posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post (for CRM fields)
app.put('/api/posts/:id', (req, res) => {
  try {
    const {
      event_title,
      phone_number_1,
      phone_number_2,
      event_organizer,
      contact_person_1,
      contact_person_2,
      event_type,
      location,
      next_event_date,
      price_range,
      status,
      notes,
      last_contact_date
    } = req.body;

    const stmt = db.prepare(`
      UPDATE scraped_posts
      SET event_title = ?,
          phone_number_1 = ?,
          phone_number_2 = ?,
          event_organizer = ?,
          contact_person_1 = ?,
          contact_person_2 = ?,
          event_type = ?,
          location = ?,
          next_event_date = ?,
          price_range = ?,
          status = ?,
          notes = ?,
          last_contact_date = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      event_title,
      phone_number_1,
      phone_number_2,
      event_organizer,
      contact_person_1,
      contact_person_2,
      event_type,
      location,
      next_event_date,
      price_range,
      status,
      notes,
      last_contact_date,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updated = db.prepare('SELECT * FROM scraped_posts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM scraped_posts WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM scraped_posts').get();
    const withPhone = db.prepare(`
      SELECT COUNT(*) as count
      FROM scraped_posts
      WHERE (phone_number_1 IS NOT NULL AND phone_number_1 != '')
         OR (phone_number_2 IS NOT NULL AND phone_number_2 != '')
    `).get();
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM scraped_posts
      GROUP BY status
    `).all();

    res.json({
      total: total.count,
      withPhone: withPhone.count,
      byStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter posts
app.get('/api/posts/filter/:field/:value', (req, res) => {
  try {
    const { field, value } = req.params;
    const allowedFields = ['status', 'event_type', 'source_account'];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid filter field' });
    }

    const posts = db.prepare(`
      SELECT * FROM scraped_posts
      WHERE ${field} = ?
      ORDER BY post_date DESC
    `).all(value);

    res.json({ posts, count: posts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search posts
app.get('/api/posts/search/:query', (req, res) => {
  try {
    const query = `%${req.params.query}%`;

    const posts = db.prepare(`
      SELECT * FROM scraped_posts
      WHERE caption LIKE ?
         OR event_title LIKE ?
         OR event_organizer LIKE ?
         OR phone_number_1 LIKE ?
         OR phone_number_2 LIKE ?
      ORDER BY post_date DESC
      LIMIT 100
    `).all(query, query, query, query, query);

    res.json({ posts, count: posts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraper configuration
app.get('/api/config', (req, res) => {
  try {
    const configPath = join(__dirname, 'config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    // Don't send the actual password, just a masked version
    const safeConfig = {
      ...config,
      instagram: {
        ...config.instagram,
        password: config.instagram.password ? '********' : ''
      }
    };

    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update scraper configuration
app.put('/api/config', (req, res) => {
  try {
    const configPath = join(__dirname, 'config.json');
    const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const {
      instagram,
      scraping
    } = req.body;

    // Build updated config
    const updatedConfig = {
      instagram: {
        username: instagram.username || currentConfig.instagram.username,
        // Only update password if it's not the masked version
        password: instagram.password && instagram.password !== '********'
          ? instagram.password
          : currentConfig.instagram.password
      },
      scraping: {
        targetAccounts: scraping.targetAccounts || currentConfig.scraping.targetAccounts,
        startDate: scraping.startDate || currentConfig.scraping.startDate,
        endDate: scraping.endDate || currentConfig.scraping.endDate,
        maxScrolls: scraping.maxScrolls !== undefined ? scraping.maxScrolls : currentConfig.scraping.maxScrolls,
        skipFirstN: scraping.skipFirstN !== undefined ? scraping.skipFirstN : currentConfig.scraping.skipFirstN,
        scrapeCount: scraping.scrapeCount !== undefined ? scraping.scrapeCount : currentConfig.scraping.scrapeCount
      }
    };

    // Write updated config
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));

    // Return safe config (masked password)
    const safeConfig = {
      ...updatedConfig,
      instagram: {
        ...updatedConfig.instagram,
        password: '********'
      }
    };

    res.json({
      message: 'Configuration updated successfully',
      config: safeConfig
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraping status
app.get('/api/scrape/status', (req, res) => {
  res.json(scrapingStatus);
});

// Start scraping
app.post('/api/scrape/start', (req, res) => {
  if (scrapingStatus.isRunning) {
    return res.status(400).json({ error: 'Scraping is already in progress' });
  }

  // Reset status
  scrapingStatus = {
    isRunning: true,
    currentAccount: '',
    totalCollected: 0,
    currentProcessing: 0,
    totalToProcess: 0,
    successCount: 0,
    failCount: 0,
    startTime: new Date().toISOString(),
    logs: ['Starting scraper...']
  };

  // Spawn the scraper process
  const scraperProcess = spawn('node', ['scraper-improved.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Store process for stopping
  currentScraperProcess = scraperProcess;

  // Capture stdout
  scraperProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    // Parse output for status updates
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        scrapingStatus.logs.push(line.trim());

        // Keep only last 50 logs
        if (scrapingStatus.logs.length > 50) {
          scrapingStatus.logs.shift();
        }

        // Extract progress information
        if (line.includes('Scraping account:')) {
          const match = line.match(/@(\w+)/);
          if (match) scrapingStatus.currentAccount = match[1];
        }

        if (line.includes('posts collected')) {
          const match = line.match(/(\d+) posts collected/);
          if (match) scrapingStatus.totalCollected = parseInt(match[1]);
        }

        if (line.includes('Scraping posts:')) {
          const match = line.match(/Scraping posts: (\d+)/);
          if (match) scrapingStatus.totalToProcess = parseInt(match[1]);
        }

        if (line.match(/\[(\d+)\/(\d+)\]/)) {
          const match = line.match(/\[(\d+)\/(\d+)\]/);
          if (match) {
            scrapingStatus.currentProcessing = parseInt(match[1]);
          }
        }

        if (line.includes('SAVED')) {
          scrapingStatus.successCount++;
        }

        if (line.includes('FAILED')) {
          scrapingStatus.failCount++;
        }
      }
    });
  });

  // Capture stderr
  scraperProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error(error);
    scrapingStatus.logs.push(`ERROR: ${error.trim()}`);

    if (scrapingStatus.logs.length > 50) {
      scrapingStatus.logs.shift();
    }
  });

  // Handle process completion
  scraperProcess.on('close', (code) => {
    scrapingStatus.isRunning = false;
    currentScraperProcess = null;
    if (code === 0) {
      scrapingStatus.logs.push('Scraping completed successfully!');
    } else if (code === null) {
      scrapingStatus.logs.push('Scraping stopped by user');
    } else {
      scrapingStatus.logs.push(`Scraping failed with code ${code}`);
    }
  });

  res.json({
    message: 'Scraping started',
    status: scrapingStatus
  });
});

// Stop scraping
app.post('/api/scrape/stop', (req, res) => {
  if (!scrapingStatus.isRunning) {
    return res.status(400).json({ error: 'No scraping process is running' });
  }

  try {
    if (currentScraperProcess) {
      // Kill the process
      currentScraperProcess.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (currentScraperProcess) {
          currentScraperProcess.kill('SIGKILL');
        }
      }, 5000);

      scrapingStatus.logs.push('Stop requested - terminating process...');
      res.json({ message: 'Stop signal sent, process will terminate shortly' });
    } else {
      scrapingStatus.isRunning = false;
      scrapingStatus.logs.push('No active process found - marking as stopped');
      res.json({ message: 'Marked as stopped' });
    }
  } catch (error) {
    console.error('Error stopping process:', error);
    scrapingStatus.isRunning = false;
    res.status(500).json({ error: 'Error stopping process' });
  }
});

// Start re-visit scraping
app.post('/api/scrape/revisit', (req, res) => {
  if (scrapingStatus.isRunning) {
    return res.status(400).json({ error: 'Scraping is already in progress' });
  }

  // Reset status
  scrapingStatus = {
    isRunning: true,
    currentAccount: 'Revisiting existing posts',
    totalCollected: 0,
    currentProcessing: 0,
    totalToProcess: 0,
    successCount: 0,
    failCount: 0,
    startTime: new Date().toISOString(),
    logs: ['Starting re-visit scraper...', 'This will re-fetch captions from Instagram for all existing posts']
  };

  // Spawn the revisit scraper process
  const scraperProcess = spawn('node', ['scraper-revisit.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Store process for stopping
  currentScraperProcess = scraperProcess;

  // Capture stdout
  scraperProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    // Parse output for status updates
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        scrapingStatus.logs.push(line.trim());

        // Keep only last 50 logs
        if (scrapingStatus.logs.length > 50) {
          scrapingStatus.logs.shift();
        }

        // Extract progress information from re-visit scraper
        if (line.match(/\[(\d+)\/(\d+)\]/)) {
          const match = line.match(/\[(\d+)\/(\d+)\]/);
          if (match) {
            scrapingStatus.currentProcessing = parseInt(match[1]);
            scrapingStatus.totalToProcess = parseInt(match[2]);
          }
        }

        if (line.includes('UPDATED')) {
          scrapingStatus.successCount++;
        }

        if (line.includes('FAILED') || line.includes('Failed')) {
          scrapingStatus.failCount++;
        }

        if (line.includes('Found') && line.includes('posts to re-visit')) {
          const match = line.match(/(\d+) posts to re-visit/);
          if (match) scrapingStatus.totalToProcess = parseInt(match[1]);
        }
      }
    });
  });

  // Capture stderr
  scraperProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error(error);
    scrapingStatus.logs.push(`ERROR: ${error.trim()}`);

    if (scrapingStatus.logs.length > 50) {
      scrapingStatus.logs.shift();
    }
  });

  // Handle process completion
  scraperProcess.on('close', (code) => {
    scrapingStatus.isRunning = false;
    currentScraperProcess = null;
    if (code === 0) {
      scrapingStatus.logs.push('Re-visit completed successfully!');
    } else if (code === null) {
      scrapingStatus.logs.push('Re-visit stopped by user');
    } else {
      scrapingStatus.logs.push(`Re-visit failed with code ${code}`);
    }
  });

  res.json({
    message: 'Re-visit scraping started',
    status: scrapingStatus
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  🚀 CRM Events Server Running`);
  console.log('='.repeat(60));
  console.log(`  Local:            http://localhost:${PORT}`);
  console.log(`  API Endpoints:    http://localhost:${PORT}/api/posts`);
  console.log(`  Frontend:         http://localhost:${PORT}`);
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
