import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image data

// GET all configurations
app.get('/api/configurations', async (req, res) => {
  try {
    const configurations = await prisma.configuration.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse JSON strings back to objects
    const parsedConfigurations = configurations.map((config) => ({
      ...config,
      customColors: JSON.parse(config.customColors),
      images: config.images ? JSON.parse(config.images) : null,
      layouts: JSON.parse(config.layouts),
      sectionVisibility: JSON.parse(config.sectionVisibility),
    }));

    res.json(parsedConfigurations);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

// GET single configuration by ID
app.get('/api/configurations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const configuration = await prisma.configuration.findUnique({
      where: { id },
    });

    if (!configuration) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Parse JSON strings back to objects
    const parsedConfiguration = {
      ...configuration,
      customColors: JSON.parse(configuration.customColors),
      images: configuration.images ? JSON.parse(configuration.images) : null,
      layouts: JSON.parse(configuration.layouts),
      sectionVisibility: JSON.parse(configuration.sectionVisibility),
    };

    res.json(parsedConfiguration);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// POST create new configuration
app.post('/api/configurations', async (req, res) => {
  try {
    const { name, customColors, images, layouts, sectionVisibility } = req.body;

    if (!name || !customColors || !layouts || !sectionVisibility) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const configuration = await prisma.configuration.create({
      data: {
        name,
        customColors: JSON.stringify(customColors),
        images: images ? JSON.stringify(images) : null,
        layouts: JSON.stringify(layouts),
        sectionVisibility: JSON.stringify(sectionVisibility),
      },
    });

    // Parse JSON strings back to objects for response
    const parsedConfiguration = {
      ...configuration,
      customColors: JSON.parse(configuration.customColors),
      images: configuration.images ? JSON.parse(configuration.images) : null,
      layouts: JSON.parse(configuration.layouts),
      sectionVisibility: JSON.parse(configuration.sectionVisibility),
    };

    res.status(201).json(parsedConfiguration);
  } catch (error) {
    console.error('Error creating configuration:', error);
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

// PUT update configuration
app.put('/api/configurations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customColors, images, layouts, sectionVisibility } = req.body;

    const configuration = await prisma.configuration.update({
      where: { id },
      data: {
        name,
        customColors: JSON.stringify(customColors),
        images: images ? JSON.stringify(images) : null,
        layouts: JSON.stringify(layouts),
        sectionVisibility: JSON.stringify(sectionVisibility),
      },
    });

    // Parse JSON strings back to objects for response
    const parsedConfiguration = {
      ...configuration,
      customColors: JSON.parse(configuration.customColors),
      images: configuration.images ? JSON.parse(configuration.images) : null,
      layouts: JSON.parse(configuration.layouts),
      sectionVisibility: JSON.parse(configuration.sectionVisibility),
    };

    res.json(parsedConfiguration);
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// DELETE configuration
app.delete('/api/configurations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.configuration.delete({
      where: { id },
    });

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
