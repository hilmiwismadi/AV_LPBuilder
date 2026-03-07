import getPrisma from '../lib/prisma.js';
import { extractDate } from '../utils/dateExtractor.js';

export const listClients = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { dealStage, riskLevel, sortBy, test } = req.query;
    const where = {};

    // Filter by isTest — default to real clients only
    where.isTest = test === 'true';

    if (dealStage) where.dealStage = dealStage;
    if (riskLevel) where.riskLevel = riskLevel;

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: { select: { clientNotes: true, deadlines: true } },
        clientNotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
        deadlines: {
          where: { completed: false, dueDate: { gte: new Date() } },
          orderBy: { dueDate: 'asc' },
          take: 1,
          select: { dueDate: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = clients.map(c => {
      const latestNote = c.clientNotes[0]?.createdAt || null;
      const lastActivity = latestNote && new Date(latestNote) > new Date(c.updatedAt)
        ? latestNote
        : c.updatedAt;
      const { clientNotes, _count, deadlines, ...rest } = c;
      return {
        ...rest,
        noteCount: _count.clientNotes,
        upcomingDeadlineCount: _count.deadlines,
        nextDeadline: deadlines[0]?.dueDate || null,
        lastActivity,
      };
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
    // Preserve isTest flag if provided
    if (data.isTest !== undefined) data.isTest = Boolean(data.isTest);
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
        deadlines: {
          orderBy: { dueDate: 'asc' },
          include: {
            task: { select: { id: true, title: true } },
            note: { select: { id: true, content: true } },
          },
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
    const data = { ...req.body };
    // Handle targetDate as ISO string
    if (data.targetDate !== undefined) {
      data.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data,
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
    let dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

    // Fallback: extract date from content if not explicitly provided
    if (!dueDate) {
      const extracted = extractDate(req.body.content);
      if (extracted) dueDate = extracted.date;
    }

    // Use transaction to create note + deadline atomically
    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          clientId: req.params.id,
          content: req.body.content,
          category: req.body.category || 'general',
          author: req.body.author || 'manual',
          pinned: req.body.pinned || false,
          dueDate: dueDate || null,
        },
      });

      // If there is a date, also create a Deadline row
      if (dueDate) {
        await tx.deadline.create({
          data: {
            title: req.body.content.slice(0, 100),
            dueDate,
            type: 'followup',
            clientId: req.params.id,
            noteId: note.id,
            createdBy: req.body.author || 'manual',
          },
        });
      }

      return note;
    });

    res.status(201).json(result);
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
    if (req.body.dueDate !== undefined) {
      data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    const note = await prisma.$transaction(async (tx) => {
      const updated = await tx.note.update({
        where: { id: req.params.noteId },
        data,
      });

      // Sync linked Deadline if dueDate changed
      if (req.body.dueDate !== undefined) {
        const existingDeadline = await tx.deadline.findFirst({
          where: { noteId: req.params.noteId },
        });

        if (data.dueDate) {
          if (existingDeadline) {
            await tx.deadline.update({
              where: { id: existingDeadline.id },
              data: {
                dueDate: data.dueDate,
                title: (req.body.content || updated.content).slice(0, 100),
              },
            });
          } else {
            await tx.deadline.create({
              data: {
                title: (req.body.content || updated.content).slice(0, 100),
                dueDate: data.dueDate,
                type: 'followup',
                clientId: updated.clientId,
                noteId: updated.id,
                createdBy: 'manual',
              },
            });
          }
        } else if (existingDeadline) {
          await tx.deadline.delete({ where: { id: existingDeadline.id } });
        }
      } else if (req.body.content !== undefined) {
        const existingDeadline = await tx.deadline.findFirst({
          where: { noteId: req.params.noteId },
        });
        if (existingDeadline) {
          await tx.deadline.update({
            where: { id: existingDeadline.id },
            data: { title: req.body.content.slice(0, 100) },
          });
        }
      }

      return updated;
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
