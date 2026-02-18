import getPrisma from '../lib/prisma.js';

function getWeekRange(weekStr) {
  if (!weekStr) return null;
  const [year, week] = weekStr.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const start = new Date(startOfWeek1);
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const listTasks = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { assignedTo, status, clientId, week } = req.query;
    const where = { parentId: null };
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (week) {
      const range = getWeekRange(week);
      if (range) where.deadline = { gte: range.start, lte: range.end };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: { subtasks: true, client: { select: { clientName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTask = async (req, res) => {
  const prisma = getPrisma();
  try {
    const task = await prisma.task.create({
      data: req.body,
      include: { client: { select: { clientName: true } } }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTask = async (req, res) => {
  const prisma = getPrisma();
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        subtasks: true,
        client: { select: { clientName: true } },
        parent: { select: { id: true, title: true } }
      }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
  const prisma = getPrisma();
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
      include: { client: { select: { clientName: true } } }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  const prisma = getPrisma();
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWorkload = async (req, res) => {
  const prisma = getPrisma();
  try {
    const tasks = await prisma.task.findMany({
      select: { assignedTo: true, status: true }
    });

    const workload = {};
    for (const task of tasks) {
      const person = task.assignedTo || 'Unassigned';
      if (!workload[person]) workload[person] = { TODO: 0, IN_PROGRESS: 0, DONE: 0, BLOCKED: 0 };
      workload[person][task.status]++;
    }

    res.json(workload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCalendar = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { week } = req.query;
    const range = week ? getWeekRange(week) : null;

    const where = { deadline: { not: null } };
    if (range) where.deadline = { gte: range.start, lte: range.end };

    const tasks = await prisma.task.findMany({
      where,
      include: { client: { select: { clientName: true } } },
      orderBy: { deadline: 'asc' }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
