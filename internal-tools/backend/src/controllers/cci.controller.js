import getPrisma from '../lib/prisma.js';

export const listClients = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { dealStage, riskLevel, sortBy } = req.query;
    const where = {};
    if (dealStage) where.dealStage = dealStage;
    if (riskLevel) where.riskLevel = riskLevel;

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: { select: { clientNotes: true } },
        clientNotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = clients.map(c => {
      const latestNote = c.clientNotes[0]?.createdAt || null;
      const lastActivity = latestNote && new Date(latestNote) > new Date(c.updatedAt)
        ? latestNote
        : c.updatedAt;
      const { clientNotes, _count, ...rest } = c;
      return { ...rest, noteCount: _count.clientNotes, lastActivity };
    });

    // Sort
    if (sortBy === 'lastActivity') {
      result.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    } else if (sortBy === 'urgency') {
      result.sort((a, b) => new Date(a.lastActivity) - new Date(b.lastActivity));
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createClient = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { notes, ...data } = req.body;
    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getClient = async (req, res) => {
  const prisma = getPrisma();
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: true,
        mouDrafts: true,
        clientNotes: {
          orderBy: [
            { pinned: 'desc' },
            { resolved: 'asc' },
            { createdAt: 'desc' },
          ],
        },
        links: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateClient = async (req, res) => {
  const prisma = getPrisma();
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteClient = async (req, res) => {
  const prisma = getPrisma();
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addNote = async (req, res) => {
  const prisma = getPrisma();
  try {
    const note = await prisma.note.create({
      data: {
        clientId: req.params.id,
        content: req.body.content,
        category: req.body.category || 'general',
        author: req.body.author || 'manual',
        pinned: req.body.pinned || false,
      },
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNote = async (req, res) => {
  const prisma = getPrisma();
  try {
    const data = {};
    if (req.body.content !== undefined) data.content = req.body.content;
    if (req.body.resolved !== undefined) data.resolved = req.body.resolved;
    if (req.body.pinned !== undefined) data.pinned = req.body.pinned;
    if (req.body.category !== undefined) data.category = req.body.category;

    const note = await prisma.note.update({
      where: { id: req.params.noteId },
      data,
    });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteNote = async (req, res) => {
  const prisma = getPrisma();
  try {
    await prisma.note.delete({ where: { id: req.params.noteId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFlaggedTech = async (req, res) => {
  const prisma = getPrisma();
  try {
    const notes = await prisma.note.findMany({
      where: { category: 'tech_requirement', resolved: false },
      include: { client: { select: { id: true, clientName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Group by client
    const map = {};
    for (const note of notes) {
      if (!map[note.clientId]) {
        map[note.clientId] = { id: note.client.id, clientName: note.client.clientName, techNotes: [] };
      }
      map[note.clientId].techNotes.push(note);
    }
    res.json(Object.values(map));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchNotes = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { q, category } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

    const where = { content: { contains: q, mode: 'insensitive' } };
    if (category) where.category = category;

    const notes = await prisma.note.findMany({
      where,
      include: { client: { select: { id: true, clientName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addLink = async (req, res) => {
  const prisma = getPrisma();
  try {
    const link = await prisma.clientLink.create({
      data: {
        clientId: req.params.id,
        name: req.body.name,
        linkType: req.body.linkType,
        url: req.body.url,
        description: req.body.description || null,
      },
    });
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLink = async (req, res) => {
  const prisma = getPrisma();
  try {
    const data = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.linkType !== undefined) data.linkType = req.body.linkType;
    if (req.body.url !== undefined) data.url = req.body.url;
    if (req.body.description !== undefined) data.description = req.body.description;

    const link = await prisma.clientLink.update({
      where: { id: req.params.linkId },
      data,
    });
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLink = async (req, res) => {
  const prisma = getPrisma();
  try {
    await prisma.clientLink.delete({ where: { id: req.params.linkId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
