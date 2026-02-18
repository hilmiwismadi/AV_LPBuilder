import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import getPrisma from '../lib/prisma.js';

export const listClients = async (req, res) => {
  const prisma = getPrisma();
  try {
    const { dealStage, riskLevel } = req.query;
    const where = {};
    if (dealStage) where.dealStage = dealStage;
    if (riskLevel) where.riskLevel = riskLevel;

    const clients = await prisma.client.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createClient = async (req, res) => {
  const prisma = getPrisma();
  try {
    const client = await prisma.client.create({
      data: { ...req.body, notes: req.body.notes || [] }
    });
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
      include: { tasks: true, mouDrafts: true }
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
      data: req.body
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
    const client = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const notes = Array.isArray(client.notes) ? client.notes : [];
    const newNote = {
      id: uuidv4(),
      content: req.body.content,
      category: req.body.category || 'general',
      resolved: false,
      createdAt: new Date().toISOString()
    };
    notes.push(newNote);

    await prisma.client.update({
      where: { id: req.params.id },
      data: { notes }
    });
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNote = async (req, res) => {
  const prisma = getPrisma();
  try {
    const client = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const notes = Array.isArray(client.notes) ? client.notes : [];
    const idx = notes.findIndex(n => n.id === req.params.noteId);
    if (idx === -1) return res.status(404).json({ error: 'Note not found' });

    notes[idx] = { ...notes[idx], ...req.body };

    await prisma.client.update({
      where: { id: req.params.id },
      data: { notes }
    });
    res.json(notes[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteNote = async (req, res) => {
  const prisma = getPrisma();
  try {
    const client = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    let notes = Array.isArray(client.notes) ? client.notes : [];
    notes = notes.filter(n => n.id !== req.params.noteId);

    await prisma.client.update({
      where: { id: req.params.id },
      data: { notes }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFlaggedTech = async (req, res) => {
  const prisma = getPrisma();
  try {
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    const flagged = clients.filter(c => {
      const notes = Array.isArray(c.notes) ? c.notes : [];
      return notes.some(n => n.category === 'tech_requirement' && !n.resolved);
    });
    res.json(flagged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
