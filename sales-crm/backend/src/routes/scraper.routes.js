import express from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import {
  startSession,
  registerConnection,
  cancelSession,
  getSessionBySlug,
  getSessions,
  deleteSession
} from '../services/scraperService.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/scraper/local-session
 * Create a session from local scraper data
 */
router.post('/local-session', async (req, res) => {
  try {
    const {
      profileUrl,
      startPostIndex = 0,
      endPostIndex = 100,
      useAuth = false
    } = req.body;

    console.log('[VPS] Receiving local scraper session creation request');
    console.log('[VPS] Profile URL:', profileUrl);
    console.log('[VPS] Post range:', startPostIndex, '-', endPostIndex);

    // Validate required fields
    if (!profileUrl) {
      return res.status(400).json({ error: 'Profile URL is required' });
    }

    if (!profileUrl.includes('instagram.com/')) {
      return res.status(400).json({ error: 'Invalid Instagram URL' });
    }

    // Extract username from profile URL
    const usernameMatch = profileUrl.match(/instagram\.com\/([^\/]+)/);
    const username = usernameMatch ? usernameMatch[1].replace('/', '') : 'unknown';

    // Create session in database
    const slug = nanoid(10);

    const session = await prisma.scrapingSession.create({
      data: {
        slug,
        profileUrl,
        username,
        startPostIndex,
        endPostIndex,
        status: 'PENDING',
        useAuth,
        totalPosts: 0,
        successfulPosts: 0,
        postsWithPhone: 0
      }
    });

    console.log('[VPS] ✓ Session created with slug:', slug);

    res.json({
      success: true,
      sessionId: session.id,
      slug: session.slug,
      status: session.status
    });

  } catch (error) {
    console.error('[VPS] Error creating local session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scraper/posts
 * Upload scraped posts from local scraper
 */
router.post('/posts', async (req, res) => {
  try {
    const { sessionId, posts } = req.body;

    console.log('[VPS] Receiving posts upload request');
    console.log('[VPS] Session ID:', sessionId);
    console.log('[VPS] Number of posts:', posts?.length || 0);

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    if (!posts || !Array.isArray(posts)) {
      return res.status(400).json({ error: 'posts must be an array' });
    }

    // Find the session
    const session = await prisma.scrapingSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Insert all posts
    let successCount = 0;
    let postsWithPhoneCount = 0;

    for (const post of posts) {
      try {
        await prisma.scrapedPost.create({
          data: {
            sessionId: session.id,
            postIndex: post.postIndex,
            postUrl: post.postUrl,
            postDate: post.postDate ? new Date(post.postDate) : null,
            eventTitle: post.eventTitle || null,
            eventOrganizer: post.eventOrganizer || null,
            phoneNumber1: post.phoneNumber1 || null,
            phoneNumber2: post.phoneNumber2 || null,
            location: post.location || null,
            nextEventDate: post.nextEventDate ? new Date(post.nextEventDate) : null,
            imageUrl: post.imageUrl || null,
            caption: post.caption || null,
            rawSource: post.rawSource || null
          }
        });

        successCount++;

        if (post.phoneNumber1 || post.phoneNumber2) {
          postsWithPhoneCount++;
        }
      } catch (insertError) {
        console.error('[VPS] Error inserting post:', insertError);
      }
    }

    // Update session with results
    await prisma.scrapingSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        totalPosts: posts.length,
        successfulPosts: successCount,
        postsWithPhone: postsWithPhoneCount,
        startedAt: new Date(),
        completedAt: new Date()
      }
    });

    console.log('[VPS] ✓ Uploaded', successCount, '/', posts.length, 'posts');
    console.log('[VPS] ✓ Posts with phone:', postsWithPhoneCount);

    res.json({
      success: true,
      message: 'Posts uploaded successfully',
      uploaded: successCount,
      total: posts.length,
      postsWithPhone: postsWithPhoneCount
    });

  } catch (error) {
    console.error('[VPS] Error uploading posts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scraper/start
 * Start a new scraping session (VPS-based scraping)
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
