import express from 'express';
import whatsappService from '../utils/whatsappService.js';

const router = express.Router();

router.get('/status', (req, res) => {
  try {
    const status = whatsappService.getStatus();
    const qrCodeImage = whatsappService.getQRCodeImage();
    const clientInfo = whatsappService.getClientInfo();
    const incomingMessages = whatsappService.getIncomingMessages();
    
    res.json({
      status,
      isReady: whatsappService.isReady(),
      isAuthenticated: whatsappService.isAuthenticated(),
      qrCodeImage,
      clientInfo,
      incomingMessages
    });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp status' });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'phoneNumber and message are required' });
    }
    
    if (!whatsappService.isReady()) {
      return res.status(503).json({ 
        error: 'WhatsApp is not ready. Please scan QR code first.' 
      });
    }
    
    const result = await whatsappService.sendMessage(phoneNumber, message);
    
    if (result.success) {
      res.json({ 
        success: true,
        message: 'Message sent successfully', 
        messageId: result.messageId,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/restart', async (req, res) => {
  try {
    await whatsappService.restart();
    res.json({ message: 'WhatsApp service restarted successfully' });
  } catch (error) {
    console.error('Error restarting WhatsApp service:', error);
    res.status(500).json({ error: 'Failed to restart WhatsApp service' });
  }
});

router.get('/client-info', (req, res) => {
  try {
    const clientInfo = whatsappService.getClientInfo();
    
    if (!clientInfo) {
      return res.status(503).json({ error: 'WhatsApp client not ready' });
    }
    
    res.json(clientInfo);
  } catch (error) {
    console.error('Error getting client info:', error);
    res.status(500).json({ error: 'Failed to get client info' });
  }
});

router.post('/parse-number', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }
    
    const formatted = whatsappService.parsePhoneNumber(phoneNumber);
    
    res.json({
      original: phoneNumber,
      formatted,
      valid: formatted.includes('@c.us')
    });
  } catch (error) {
    console.error('Error parsing phone number:', error);
    res.status(500).json({ error: 'Failed to parse phone number' });
  }
});

export default router;
