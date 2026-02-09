import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate unique slug with random suffix
// Generate clean slug from event name (no random suffix)
function generateSlug(name) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // Remove special characters
    .replace(/\s+/g, '-')          // Convert spaces to hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens

  return slug;
}

// Check if slug already exists
async function checkSlugExists(slug) {
  const existing = await prisma.configuration.findUnique({
    where: { slug }
  });
  return !!existing;
}

// GET all configurations (filtered by ownership for Event Organizers)
export async function getAllConfigurations(req, res) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Superadmin sees all configurations, Event Organizer sees only their own
    const where = userRole === 'SUPERADMIN' ? {} : { ownerId: userId };

    const configurations = await prisma.configuration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json(configurations);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
}

// GET single configuration by ID (with ownership check)
export async function getConfigurationById(req, res) {
  try {
    const { id } = req.params;

    const configuration = await prisma.configuration.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!configuration) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json(configuration);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
}

// GET configuration by slug (for preview page - with ownership check)
export async function getConfigurationBySlug(req, res) {
  try {
    const { slug } = req.params;

    const configuration = await prisma.configuration.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!configuration) {
      return res.status(404).json({
        error: 'Configuration not found',
        slug: slug,
        message: `No event found with slug: ${slug}`
      });
    }

    res.json(configuration);
  } catch (error) {
    console.error('Error fetching configuration by slug:', error);
    res.status(500).json({
      error: 'Failed to fetch configuration',
      details: error.message
    });
  }
}

// GET configuration by slug for PUBLIC subdomain (no authentication required)
export async function getPublicConfiguration(req, res) {
  try {
    const { slug } = req.params;

    const configuration = await prisma.configuration.findUnique({
      where: { slug: slug.toLowerCase() }
    });

    if (!configuration) {
      return res.status(404).json({
        error: 'Configuration not found',
        slug: slug,
        message: `No event found with slug: ${slug}`
      });
    }

    // Don't include owner information for public view
    res.json(configuration);
  } catch (error) {
    console.error('Error fetching public configuration:', error);
    res.status(500).json({
      error: 'Failed to fetch configuration',
      details: error.message
    });
  }
}

// POST create new configuration
export async function createConfiguration(req, res) {
  try {
    const userId = req.user.userId;
    const {
      name,
      customColors,
      images,
      layouts,
      sectionVisibility,
      heroText,
      aboutText,
      categoriesText,
      categoriesCards,
      timelineText,
      timelineCards,
      prizesText,
      juryText,
      documentationText,
      instagramText,
      sponsorsText,
      contactText,
      faqCards
    } = req.body;

    if (!name || !customColors || !layouts || !sectionVisibility) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate clean slug from name
    const slug = generateSlug(name);

    // Check if slug already exists
    if (await checkSlugExists(slug)) {
      return res.status(409).json({
        error: 'Event name already exists',
        message: `An event with the name "${name}" already exists. Please choose a different name.`,
        slug: slug
      });
    }

    const configuration = await prisma.configuration.create({
      data: {
        name,
        slug,
        customColors,
        images,
        layouts,
        sectionVisibility,
        heroText,
        aboutText,
        categoriesText,
        categoriesCards,
        timelineText,
        timelineCards,
        prizesText,
        juryText,
        documentationText,
        instagramText,
        sponsorsText,
        contactText,
        faqCards,
        ownerId: userId  // Assign to current user
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    const subdomainUrl = `https://${slug}.webbuild.arachnova.id`;

    res.status(201).json({
      ...configuration,
      subdomainUrl
    });
  } catch (error) {
    console.error('Error creating configuration:', error);
    res.status(500).json({ error: 'Failed to create configuration', details: error.message });
  }
}

// PUT update configuration (with ownership check via middleware)
export async function updateConfiguration(req, res) {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const {
      name,
      slug,
      customColors,
      images,
      layouts,
      sectionVisibility,
      heroText,
      aboutText,
      categoriesText,
      categoriesCards,
      timelineText,
      timelineCards,
      prizesText,
      juryText,
      documentationText,
      instagramText,
      sponsorsText,
      contactText,
      faqCards,
      ownerId  // NEW: Allow superadmin to change owner
    } = req.body;

    // If slug is being updated, ensure it's unique
    if (slug) {
      const existing = await prisma.configuration.findUnique({
        where: { slug }
      });

      if (existing && existing.id !== id) {
        return res.status(400).json({
          error: 'Slug already in use',
          slug: slug
        });
      }
    }

    // Build update data object
    const updateData = {
      name,
      slug,
      customColors,
      images,
      layouts,
      sectionVisibility,
      heroText,
      aboutText,
      categoriesText,
      categoriesCards,
      timelineText,
      timelineCards,
      prizesText,
      juryText,
      documentationText,
      instagramText,
      sponsorsText,
      contactText,
      faqCards
    };

    // Only allow superadmin to change ownerId
    if (ownerId !== undefined && userRole === 'SUPERADMIN') {
      // Validate that the new owner exists and is an EVENT_ORGANIZER
      if (ownerId) {
        const newOwner = await prisma.user.findUnique({
          where: { id: ownerId }
        });

        if (!newOwner) {
          return res.status(400).json({ error: 'Invalid owner ID' });
        }

        if (newOwner.role !== 'EVENT_ORGANIZER' && newOwner.role !== 'SUPERADMIN') {
          return res.status(400).json({ error: 'Owner must be an Event Organizer or Superadmin' });
        }
      }

      updateData.ownerId = ownerId;
    }

    const configuration = await prisma.configuration.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json(configuration);
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({ error: 'Failed to update configuration', details: error.message });
  }
}

// DELETE configuration (with ownership check via middleware)
export async function deleteConfiguration(req, res) {
  try {
    const { id } = req.params;

    await prisma.configuration.delete({
      where: { id }
    });

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
}
