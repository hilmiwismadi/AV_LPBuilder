import express from 'express';
import { PrismaClient } from '@prisma/client';
import whatsappService from '../utils/whatsappService.js';
import { standardizePhoneNumber } from '../utils/phoneUtils.js';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/chat/:clientId - Get chat history for a client
// Also includes orphan messages (messages with no clientId but matching phone)
router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Get client to find their phone number
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });
    
    if (!client) {
      return res.json({ messages: [] });
    }
    
    // Standardize phone number and create hash
    const standardizedPhone = standardizePhoneNumber(client.phoneNumber);
    const phoneHash = crypto.createHash('md5').update(standardizedPhone).digest('hex');
    
    // Get all messages for this phone (both linked and orphan)
    const linkedMessages = await prisma.chatHistory.findMany({
      where: { 
        clientId,
        phoneHash
      },
      orderBy: { timestamp: 'asc' }
    });
    
    // Also get any orphan messages with this phoneHash
    const orphanMessages = await prisma.chatHistory.findMany({
      where: {
        phoneHash,
        clientId: null // Orphan messages
      },
      orderBy: { timestamp: 'asc' }
    });
    
    // Combine and format messages
    const allMessages = [...linkedMessages, ...orphanMessages]
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(chat => ({
        id: chat.id,
        text: chat.message,
        isOutgoing: chat.isOutgoing,
        sender: chat.isOutgoing ? 'user' : 'client',
        timestamp: chat.timestamp
      }));
    
    res.json({ messages: allMessages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /api/chat - Add chat message
router.post('/', async (req, res) => {
  try {
    const { clientId, message, isOutgoing = true, sendViaWhatsApp = false } = req.body;
    
    if (!clientId || !message) {
      return res.status(400).json({ error: 'clientId and message are required' });
    }
    
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const standardizedPhone = standardizePhoneNumber(client.phoneNumber);
    const phoneHash = crypto.createHash('md5').update(standardizedPhone).digest('hex');
    
    let whatsappResult = null;
    if (isOutgoing && sendViaWhatsApp) {
      if (!whatsappService.isReady()) {
        return res.status(503).json({ 
          error: 'WhatsApp is not ready. Please scan QR code first.' 
        });
      }
      
      whatsappResult = await whatsappService.sendMessage(client.phoneNumber, message);
      
      if (!whatsappResult.success) {
        return res.status(500).json({ error: whatsappResult.error });
      }
    }
    
    const chat = await prisma.chatHistory.create({
      data: {
        clientId,
        phoneHash,
        message,
        isOutgoing
      }
    });
    
    if (isOutgoing) {
      await prisma.client.update({
        where: { id: clientId },
        data: { lastContact: new Date() }
      });
    }
    
    res.json({
      id: chat.id,
      message: chat.message,
      isOutgoing: chat.isOutgoing,
      sender: chat.isOutgoing ? 'user' : 'client',
      timestamp: chat.timestamp,
      whatsappResult
    });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// GET /api/chat/history/phone/:phoneNumber - Get chat history by phone number only
// Useful for re-linking orphan messages when client is re-added
router.get('/history/phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const standardizedPhone = standardizePhoneNumber(phoneNumber);
    const phoneHash = crypto.createHash('md5').update(standardizedPhone).digest('hex');
    
    const chatHistory = await prisma.chatHistory.findMany({
      where: { phoneHash },
      orderBy: { timestamp: 'asc' }
    });
    
    const messages = chatHistory.map(chat => ({
      id: chat.id,
      text: chat.message,
      isOutgoing: chat.isOutgoing,
      sender: chat.isOutgoing ? 'user' : 'client',
      timestamp: chat.timestamp
    }));
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history by phone:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
