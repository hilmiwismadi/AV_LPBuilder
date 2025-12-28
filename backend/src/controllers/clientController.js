import prisma from '../db.js';
import whatsappService from '../whatsappService.js';
import { parsePhoneNumber } from '../utils/phoneParser.js';

export const getAllClients = async (req, res) => {
  try {
    const { startup } = req.query;

    const where = {};
    if (startup && (startup === 'NOVAGATE' || startup === 'NOVATIX')) {
      where.startup = startup;
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        chatHistory: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const data = { ...req.body };

    // Auto-parse phone number to standard format
    if (data.phoneNumber) {
      data.phoneNumber = parsePhoneNumber(data.phoneNumber);
    }

    const client = await prisma.client.create({
      data
    });

    // Update WhatsApp whitelist
    await whatsappService.updateWhitelist();

    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Auto-parse phone number to standard format
    if (data.phoneNumber) {
      data.phoneNumber = parsePhoneNumber(data.phoneNumber);
    }

    const client = await prisma.client.update({
      where: { id },
      data
    });

    // Update WhatsApp whitelist if phone number changed
    if (req.body.phoneNumber) {
      await whatsappService.updateWhitelist();
    }

    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id }
    });

    // Update WhatsApp whitelist
    await whatsappService.updateWhitelist();

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
