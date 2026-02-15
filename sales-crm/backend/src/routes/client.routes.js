import express from 'express';
import { PrismaClient } from '@prisma/client';
import { standardizePhoneNumber } from '../utils/phoneUtils.js';
import { authenticate } from '../middleware/auth.middleware.js';
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

    // Check if client exists for this phone
    const phoneToUse = scrapedPost.phoneNumber1 || scrapedPost.phoneNumber2;
    if (!phoneToUse) {
      return res.json({ assigned: false, reason: 'no_phone' });
    }

    const standardizedPhone = standardizePhoneNumber(phoneToUse);

    const client = await prisma.client.findFirst({
      where: {
        phoneNumber: standardizedPhone,
        startup: 'NOVAGATE'
      },
      include: {
        // We'll manually fetch admin details
      }
    });

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
          // Other error, don't retry
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
