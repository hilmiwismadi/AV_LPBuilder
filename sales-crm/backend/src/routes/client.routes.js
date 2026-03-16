import axios from 'axios';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { standardizePhoneNumber } from '../utils/phoneUtils.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createConfiguration, buildDemoConfiguration, generateSlug } from '../services/landingPageService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to standardize phone number in requests
const standardizePhoneMiddleware = (req, res, next) => {
  if (req.body.phoneNumber) {
    req.body.phoneNumber = standardizePhoneNumber(req.body.phoneNumber);
  }
  next();
};

// Helper function to update client OTW status
const updateClientOtwStatus = async (clientId, status, reason) => {
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        otwStatus: status,
        ...(reason && { otwReason: reason })
      }
    });
    return true;
  } catch (error) {
    console.error('Error updating client OTW status:', error);
    throw error;
  }
};

router.get('/', authenticate, async (req, res) => {
  try {
    const { startup = 'NOVAGATE', status, search } = req.query;
    const currentUser = req.user;

    const where = {
      startup: startup,
      ...(status && { status: status }),
      ...(search && {
        OR: [
          { eventOrganizer: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search.replace(/\D/g, '') } },
          { notes: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // ROLE-BASED FILTERING: Non-superadmin only see their assigned clients
    if (currentUser.role !== 'SUPERADMIN') {
      where.pic = currentUser.id;
    }

    // Get all PIC IDs from clients to fetch admin details
    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Collect unique PIC IDs
    const picIds = [...new Set(clients.map(c => c.pic).filter(Boolean))];

    // Fetch admin details for all PICs
    let adminMap = {};
    if (picIds.length > 0) {
      const admins = await prisma.admin.findMany({
        where: { id: { in: picIds } },
        select: { id: true, name: true, email: true, role: true }
      });
      adminMap = admins.reduce((acc, admin) => {
        acc[admin.id] = admin;
        return acc;
      }, {});
    }

    // Attach admin details to each client
    const clientsWithPic = clients.map(client => ({
      ...client,
      picAdmin: client.pic ? adminMap[client.pic] || null : null
    }));

    res.json(clientsWithPic);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// PATCH /api/clients/internal/clear-demo/:slug
// Internal endpoint: called by LP backend when a DEMO config is deleted from /saved
// Clears demo-related fields on the matching CRM client - never touches other data
router.patch("/internal/clear-demo/:slug", async (req, res) => {
  const serviceSecret = req.headers["x-service-secret"];
  if (!serviceSecret || serviceSecret !== process.env.INTERNAL_SERVICE_SECRET) {
    return res.status(401).json({ error: "Unauthorized - internal endpoint" });
  }

  try {
    const { slug } = req.params;
    const demoUrl = `https://${slug}.webbuild.arachnova.id`;

    // Clear ONLY demo fields - never touches eventOrganizer, phone, status, etc.
    const result = await prisma.client.updateMany({
      where: { linkDemo: demoUrl },
      data: {
        linkDemo: null,
        imgLogo: null,
        imgPoster: null,
        colorPalette: null,
        eventType: null
      }
    });

    console.log(`[Internal] Cleared demo for slug: ${slug}, affected: ${result.count} clients`);
    res.json({ success: true, affectedClients: result.count });
  } catch (error) {
    console.error("[Internal] Error clearing demo data:", error);
    res.status(500).json({ error: "Failed to clear demo data" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { chatHistory: true }
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

router.post('/', standardizePhoneMiddleware, async (req, res) => {
  try {
    const client = await prisma.client.create({
      data: req.body
    });
    res.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.put('/:id', standardizePhoneMiddleware, async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.client.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// POST /api/clients/assign - Assign scraped post to client (creates client with PIC)
router.post('/assign', authenticate, async (req, res) => {
  try {
    const { postId, picId } = req.body;
    const currentUser = req.user; // from auth middleware

    // Validate input
    if (!postId) {
      return res.status(400).json({ error: 'postId is required' });
    }

    // If not superadmin, can only assign to self
    if (currentUser.role !== 'SUPERADMIN' && picId && picId !== currentUser.id) {
      return res.status(403).json({ error: 'Can only assign to yourself' });
    }

    // Default PIC to current user if not specified (for regular sales)
    const finalPicId = picId || currentUser.id;

    // Fetch the scraped post
    const scrapedPost = await prisma.scrapedPost.findUnique({
      where: { id: postId }
    });

    if (!scrapedPost) {
      return res.status(404).json({ error: 'Scraped post not found' });
    }

    // Check if client already exists for this phone
    const phoneToUse = scrapedPost.phoneNumber1 || scrapedPost.phoneNumber2;
    if (!phoneToUse) {
      return res.status(400).json({ error: 'No phone number found in scraped post' });
    }

    // Standardize phone number
    const standardizedPhone = standardizePhoneNumber(phoneToUse);

    // Check for existing client
    let client = await prisma.client.findFirst({
      where: {
        phoneNumber: standardizedPhone,
        startup: 'NOVAGATE'
      }
    });

    if (client) {
      // Update existing client's PIC if different
      if (client.pic !== finalPicId) {
        client = await prisma.client.update({
          where: { id: client.id },
          data: {
            pic: finalPicId,
            assignedBy: currentUser.id,
            assignedAt: new Date()
          }
        });
      }
    } else {
      // Create new client from scraped data
      client = await prisma.client.create({
        data: {
          phoneNumber: standardizedPhone,
          eventOrganizer: scrapedPost.eventOrganizer || '',
          igLink: scrapedPost.postUrl || '',
          cp1st: scrapedPost.phoneNumber1 || '',
          cp2nd: scrapedPost.phoneNumber2 || '',
          location: scrapedPost.location || '',
          nextEventDate: scrapedPost.nextEventDate || null,
          eventType: scrapedPost.eventTitle || '',
          pic: finalPicId,
          assignedBy: currentUser.id,
          assignedAt: new Date(),
          status: 'TODO',
          startup: 'NOVAGATE'
        }
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error assigning client:', error);
    res.status(500).json({ error: 'Failed to assign client' });
  }
});

// GET /api/clients/check-assignment/:postId - Check if a scraped post is already assigned
router.get('/check-assignment/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;

    // Fetch the scraped post
    const scrapedPost = await prisma.scrapedPost.findUnique({
      where: { id: postId }
    });

    if (!scrapedPost) {
      return res.status(404).json({ error: 'Scraped post not found' });
    }

    // Check if client exists - always use scrapedPostId as lookup key
    const phoneToUse = scrapedPost.phoneNumber1 || scrapedPost.phoneNumber2;
    let client;

    if (!phoneToUse) {
      // For posts without phone, check by scrapedPostId
      client = await prisma.client.findFirst({
        where: {
          scrapedPostId: scrapedPost.id,
          startup: 'NOVAGATE'
        }
      });
    } else {
      // For posts with phone, check by phone number
      const standardizedPhone = standardizePhoneNumber(phoneToUse);
      client = await prisma.client.findFirst({
        where: {
          phoneNumber: standardizedPhone,
          startup: 'NOVAGATE'
        }
      });
    }

    if (!client || !client.pic) {
      return res.json({ assigned: false });
    }

    // Fetch PIC details
    const picAdmin = await prisma.admin.findUnique({
      where: { id: client.pic },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({
      assigned: true,
      clientId: client.id,
      pic: picAdmin
    });
  } catch (error) {
    console.error('Error checking assignment:', error);
    res.status(500).json({ error: 'Failed to check assignment' });
  }
});

// POST /api/clients/bulk-assign - Bulk assign ALL scraped posts to CS team members
router.post('/bulk-assign', authenticate, authorize('SUPERADMIN'), async (req, res) => {
  try {
    const { sessionSlug, csIds } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!sessionSlug) {
      return res.status(400).json({ error: 'sessionSlug is required' });
    }
    if (!csIds || !Array.isArray(csIds) || csIds.length === 0) {
      return res.status(400).json({ error: 'csIds is required and must be a non-empty array' });
    }

    // Fetch the scraping session with ALL posts (no phone filter)
    const session = await prisma.scrapingSession.findUnique({
      where: { slug: sessionSlug },
      include: {
        scrapedPosts: {
          orderBy: { postIndex: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Scraping session not found' });
    }

    const postsToAssign = session.scrapedPosts;
    if (postsToAssign.length === 0) {
      return res.status(400).json({ error: 'No posts found in this session' });
    }

    // Distribute posts evenly among CS members using round-robin
    const results = {
      totalPosts: postsToAssign.length,
      assigned: 0,
      skipped: 0,
      updated: 0,
      noPhone: 0,
      assignments: {},
      errors: []
    };

    // Initialize assignment counts for each CS
    csIds.forEach(csId => {
      results.assignments[csId] = 0;
    });

    for (let i = 0; i < postsToAssign.length; i++) {
      const post = postsToAssign[i];
      const csId = csIds[i % csIds.length]; // Round-robin distribution

      try {
        const phoneToUse = post.phoneNumber1 || post.phoneNumber2;
        let client;

        // Track if post has no phone
        if (!phoneToUse) {
          results.noPhone++;
        }

        // ALWAYS use scrapedPostId as the lookup key for ALL posts
        client = await prisma.client.findFirst({
          where: {
            scrapedPostId: post.id,
            startup: 'NOVAGATE'
          }
        });

        if (client) {
          // Update existing client's PIC if different, AND update phone if it changed
          const updateData = {
            pic: csId,
            assignedBy: currentUser.id,
            assignedAt: new Date()
          };

          // Update phone number if available (in case it changed from original scrape)
          if (phoneToUse) {
            updateData.phoneNumber = standardizePhoneNumber(phoneToUse);
            updateData.cp1st = post.phoneNumber1 || '';
            updateData.cp2nd = post.phoneNumber2 || '';
          }

          // Also update other fields that might have changed
          updateData.eventOrganizer = post.eventOrganizer || client.eventOrganizer;
          updateData.igLink = post.postUrl || client.igLink;
          updateData.location = post.location || client.location;
          updateData.nextEventDate = post.nextEventDate || client.nextEventDate;
          updateData.eventType = post.eventTitle || client.eventType;

          if (client.pic !== csId || phoneToUse) {
            client = await prisma.client.update({
              where: { id: client.id },
              data: updateData
            });
            results.updated++;
          } else {
            results.skipped++;
            continue;
          }
        } else {
          // Create new client from scraped data
          client = await prisma.client.create({
            data: {
              phoneNumber: phoneToUse ? standardizePhoneNumber(phoneToUse) : null,
              scrapedPostId: post.id,
              eventOrganizer: post.eventOrganizer || '',
              igLink: post.postUrl || '',
              cp1st: post.phoneNumber1 || '',
              cp2nd: post.phoneNumber2 || '',
              location: post.location || '',
              nextEventDate: post.nextEventDate || null,
              eventType: post.eventTitle || '',
              pic: csId,
              assignedBy: currentUser.id,
              assignedAt: new Date(),
              status: 'TODO',
              startup: 'NOVAGATE',
              otwStatus: 'NOT_CHECKED',
              otwReason: '',
              previousPhone: ''
            }
          });
        }

        results.assigned++;
        results.assignments[csId]++;
      } catch (error) {
        console.error('Error assigning post ' + post.id + ':', error);
        results.errors.push({
          postId: post.id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk assign:', error);
    res.status(500).json({ error: 'Failed to bulk assign clients' });
  }
});

// POST /api/clients/bulk-unassign - Clear assignment status for clients from a session
router.post('/bulk-unassign', authenticate, authorize('SUPERADMIN'), async (req, res) => {
  try {
    const { sessionSlug } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!sessionSlug) {
      return res.status(400).json({ error: 'sessionSlug is required' });
    }

    // Fetch the scraping session
    const session = await prisma.scrapingSession.findUnique({
      where: { slug: sessionSlug },
      include: {
        scrapedPosts: {
          orderBy: { postIndex: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Scraping session not found' });
    }

    const posts = session.scrapedPosts;
    if (posts.length === 0) {
      return res.status(400).json({ error: 'No posts found in this session' });
    }

    // Results tracking
    const results = {
      totalPosts: posts.length,
      unassigned: 0,
      notAssigned: 0,
      noPhone: 0,
      errors: []
    };

    for (const post of posts) {
      try {
        const phoneToUse = post.phoneNumber1 || post.phoneNumber2;

        // Track if post has no phone
        if (!phoneToUse) {
          results.noPhone++;
        }

        // ALWAYS use scrapedPostId as the lookup key for ALL posts
        const client = await prisma.client.findFirst({
          where: {
            scrapedPostId: post.id,
            startup: 'NOVAGATE'
          }
        });

        if (!client) {
          results.notAssigned++;
          continue;
        }

        if (!client.pic) {
          results.notAssigned++;
          continue;
        }

        // Clear assignment
        const updated = await prisma.client.update({
          where: { id: client.id },
          data: {
            pic: null,
            assignedBy: null,
            assignedAt: null,
            otwStatus: 'NOT_CHECKED',
            otwReason: ''
          }
        });

        results.unassigned++;
      } catch (error) {
        console.error('Error unassigning post ' + post.id + ':', error);
        results.errors.push({
          postId: post.id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk unassign:', error);
    res.status(500).json({ error: 'Failed to bulk unassign clients' });
  }
});

// POST /api/clients/update-otw-status - Update OTW status for a client
router.post('/update-otw-status', authenticate, async (req, res) => {
  try {
    const { clientId, status, reason } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    // SUPERADMIN can change any status, others can only mark as OTW_PROSPECT
    if (currentUser.role !== 'SUPERADMIN' && status !== 'OTW_PROSPECT') {
      return res.status(403).json({ error: 'Only SUPERADMIN can set OTW_PROSPECT status' });
    }

    const success = await updateClientOtwStatus(clientId, status, reason);

    if (success) {
      res.json({ success: true, message: 'OTW status updated successfully' });
    } else {
      res.status(400).json({ error: 'Failed to update OTW status' });
    }
  } catch (error) {
    console.error('Error updating client OTW status:', error);
    res.status(500).json({ error: 'Failed to update OTW status' });
  }
});

// POST /api/clients/update-previous-phone - Set previous phone number
router.post('/update-previous-phone', authenticate, async (req, res) => {
  try {
    const { clientId, previousPhone } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    // Validate phone format (should be a number)
    if (previousPhone && !/^\d+$/.test(previousPhone)) {
      return res.status(400).json({ error: 'Previous phone number must contain only digits' });
    }

    const success = await updateClientOtwStatus(
      clientId,
      'OTW_PROSPECT',
      previousPhone || 'Previous Phone Number = ' + previousPhone
    );

    if (success) {
      res.json({ success: true, message: 'Previous phone number saved' });
    } else {
      res.status(400).json({ error: 'Failed to save previous phone number' });
    }
  } catch (error) {
    console.error('Error updating previous phone:', error);
    res.status(500).json({ error: 'Failed to save previous phone number' });
  }
});

// POST /api/clients/:id/build-demo - Build demo landing page for client
router.post('/:id/build-demo', authenticate, async (req, res) => {
  try {
    const clientId = req.params.id;
    const {
      eventName,
      eventType,
      logoImage,
      posterImage,
      color1,
      color2,
      eventDescription,
    } = req.body;

    // Validate required fields
    if (!eventName || !eventType || !logoImage || !posterImage) {
      return res.status(400).json({
        error: 'Missing required fields: eventName, eventType, logoImage, posterImage'
      });
    }

    // Fetch client to ensure it exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Build configuration object
    const demoData = {
      eventName,
      eventType,
      logoImage,
      posterImage,
      color1,
      color2,
      eventDescription,
    };

    const configData = buildDemoConfiguration(demoData);

    console.log('[Build Demo] Creating configuration for:', eventName);

    // Try to create configuration, retry with suffix if slug exists
    let attempt = 0;
    let landingPageResponse;
    let lastError;

    while (attempt < 5) {
      try {
        landingPageResponse = await createConfiguration(configData);
        break; // Success, exit loop
      } catch (error) {
        lastError = error;

        if (error.response?.status === 409) {
          // Slug conflict, try with suffix
          attempt++;
          console.log(`[Build Demo] Slug conflict, retrying with suffix (attempt ${attempt})`);

          const newSlug = generateSlug(eventName, attempt);
          configData.name = `${eventName} (${attempt})`;

          // Update eventName in heroText to match
          if (configData.heroText) {
            configData.heroText.title = configData.name;
          }
        } else {
          throw error;
        }
      }
    }

    if (!landingPageResponse) {
      throw lastError || new Error('Failed to create configuration after multiple attempts');
    }

    console.log('[Build Demo] Landing page created:', landingPageResponse);

    // Extract subdomain URL from response
    const subdomainUrl = landingPageResponse.subdomainUrl ||
                         `https://${landingPageResponse.slug}.webbuild.arachnova.id`;

    // Update client with demo info
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        imgLogo: logoImage,
        imgPoster: posterImage,
        linkDemo: subdomainUrl,
        colorPalette: JSON.stringify({ color1, color2 }),
        eventType: eventType
      }
    });

    console.log('[Build Demo] Client updated with demo link:', subdomainUrl);

    res.json({
      success: true,
      linkDemo: subdomainUrl,
      slug: landingPageResponse.slug,
      client: updatedClient
    });

  } catch (error) {
    console.error('[Build Demo] Error:', error);

    if (error.response?.status === 409) {
      return res.status(409).json({
        error: 'Event name already exists. Please modify the name.'
      });
    } else if (error.response?.status === 413) {
      return res.status(413).json({
        error: 'Images are too large. Please use smaller files.'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Landing Page service is unavailable. Please try again later.'
      });
    } else {
      return res.status(500).json({
        error: 'Failed to create demo landing page',
        details: error.message
      });
    }
  }
});

export default router;
