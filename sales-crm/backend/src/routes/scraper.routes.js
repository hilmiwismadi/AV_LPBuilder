import express from 'express';
import {
  startSession,
  registerConnection,
  cancelSession,
  getSessionBySlug,
  getSessions,
  deleteSession
} from '../services/scraperService.js';

const router = express.Router();

/**
 * POST /api/scraper/start
 * Start a new scraping session
 */
router.post('/start', async (req, res) => {
  try {
    const {
      profileUrl,
      startPostIndex = 0,
      endPostIndex = 100,
      useAuth = false,
      instagramUsername,
      instagramPassword
    } = req.body;

    // Validate required fields
    if (!profileUrl) {
      return res.status(400).json({ error: 'Profile URL is required' });
    }

    if (!profileUrl.includes('instagram.com/')) {
      return res.status(400).json({ error: 'Invalid Instagram URL' });
    }

    if (startPostIndex < 0 || endPostIndex < startPostIndex) {
      return res.status(400).json({ error: 'Invalid post range' });
    }

    if (useAuth && (!instagramUsername || !instagramPassword)) {
      return res.status(400).json({ error: 'Instagram credentials required when useAuth is true' });
    }

    const session = await startSession({
      profileUrl,
      startPostIndex,
      endPostIndex,
      useAuth,
      instagramUsername,
      instagramPassword
    });

    res.json({
      sessionId: session.id,
      slug: session.slug,
      status: session.status
    });

  } catch (error) {
    console.error('Error starting scraper:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/sessions
 * Get all scraping sessions with pagination
 */
router.get('/sessions', async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const result = await getSessions({
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    res.json(result);

  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/sessions/:id
 * Get a specific session by ID
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const session = await getSessions({ limit: 1, offset: 0 });
    const found = session.sessions.find(s => s.id === id);

    if (!found) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(found);

  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/sessions/by-slug/:slug
 * Get a specific session by slug with posts
 */
router.get('/sessions/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const session = await getSessionBySlug(slug);

    // Don't send encrypted password in response
    const { instagramPassword, ...sessionData } = session;

    res.json(sessionData);

  } catch (error) {
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    console.error('Error fetching session by slug:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scraper/live/:sessionId
 * SSE endpoint for real-time updates
 */
router.get('/live/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Register connection
    registerConnection(sessionId, res);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      if (!res.writableEnded) {
        res.write(': keep-alive\n\n');
      } else {
        clearInterval(keepAlive);
      }
    }, 30000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
    });

  } catch (error) {
    console.error('Error setting up SSE:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * POST /api/scraper/sessions/:id/cancel
 * Cancel a running session
 */
router.post('/sessions/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    await cancelSession(id);

    res.json({ message: 'Session cancelled' });

  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/scraper/sessions/:id
 * Delete a session and all its posts
 */
router.delete('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await deleteSession(id);

    res.json({ message: 'Session deleted' });

  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
