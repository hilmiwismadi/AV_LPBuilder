import getPrisma from '../lib/prisma.js';

export const listMous = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { clientId } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;

    const mous = await prisma.mouDraft.findMany({
      where,
      include: { client: { select: { clientName: true, eventName: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(mous);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMou = async (req, res) => {
  const prisma = getPrisma();
  try {
    const mou = await prisma.mouDraft.create({
      data: req.body,
      include: { client: { select: { clientName: true } } }
    });
    res.status(201).json(mou);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMou = async (req, res) => {
  const prisma = getPrisma();
  try {
    const mou = await prisma.mouDraft.findUnique({
      where: { id: req.params.id },
      include: { client: true }
    });
    if (!mou) return res.status(404).json({ error: 'MoU not found' });
    res.json(mou);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMou = async (req, res) => {
  const prisma = getPrisma();
  try {
    const mou = await prisma.mouDraft.update({
      where: { id: req.params.id },
      data: req.body,
      include: { client: { select: { clientName: true } } }
    });
    res.json(mou);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMou = async (req, res) => {
  const prisma = getPrisma();
  try {
    await prisma.mouDraft.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
