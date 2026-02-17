import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/flow - Return saved canvas {nodes, edges}
router.get('/', async (req, res) => {
  try {
    const canvas = await prisma.flowCanvas.findUnique({ where: { id: 'main' } });
    if (!canvas) return res.json({ nodes: [], edges: [] });
    res.json({ nodes: canvas.nodes, edges: canvas.edges });
  } catch (error) {
    console.error('Error getting flow canvas:', error);
    res.status(500).json({ error: 'Failed to get flow canvas' });
  }
});

// POST /api/flow - Upsert canvas JSON
router.post('/', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    const canvas = await prisma.flowCanvas.upsert({
      where: { id: 'main' },
      update: { nodes, edges },
      create: { id: 'main', nodes, edges },
    });
    res.json({ success: true, updatedAt: canvas.updatedAt });
  } catch (error) {
    console.error('Error saving flow canvas:', error);
    res.status(500).json({ error: 'Failed to save flow canvas' });
  }
});

export default router;
