import getPrisma from '../lib/prisma.js';

export const listDeadlines = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { clientId, type, from, to, completed } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (type) where.type = type;
    if (completed !== undefined) where.completed = completed === 'true';
    if (from || to) {
      where.dueDate = {};
      if (from) where.dueDate.gte = new Date(from);
      if (to) where.dueDate.lte = new Date(to);
    }
    const deadlines = await prisma.deadline.findMany({
      where,
      include: {
        client: { select: { id: true, clientName: true } },
        task: { select: { id: true, title: true } },
        note: { select: { id: true, content: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(deadlines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCalendarFeed = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { from, to, test } = req.query;
    const where = {};
    if (from || to) {
      where.dueDate = {};
      if (from) where.dueDate.gte = new Date(from);
      if (to) where.dueDate.lte = new Date(to);
    }

    // Filter by client isTest flag
    if (test !== undefined) {
      where.client = { isTest: test === 'true' };
    }

    const deadlines = await prisma.deadline.findMany({
      where,
      include: {
        client: { select: { id: true, clientName: true, isTest: true } },
        task: { select: { id: true, title: true } },
        note: { select: { id: true, content: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(deadlines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createDeadline = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { title, description, dueDate, type, clientId, taskId, noteId, createdBy } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ error: 'title and dueDate are required' });
    }
    const deadline = await prisma.deadline.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        type: type || 'general',
        clientId: clientId || null,
        taskId: taskId || null,
        noteId: noteId || null,
        createdBy: createdBy || 'manual',
      },
      include: {
        client: { select: { id: true, clientName: true } },
      },
    });
    res.status(201).json(deadline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDeadline = async (req, res) => {
  const prisma = getPrisma();
  try {
    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.dueDate !== undefined) data.dueDate = new Date(req.body.dueDate);
    if (req.body.type !== undefined) data.type = req.body.type;
    if (req.body.completed !== undefined) data.completed = req.body.completed;
    const deadline = await prisma.deadline.update({
      where: { id: req.params.id },
      data,
      include: {
        client: { select: { id: true, clientName: true } },
      },
    });
    res.json(deadline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDeadline = async (req, res) => {
  const prisma = getPrisma();
  try {
    await prisma.deadline.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
