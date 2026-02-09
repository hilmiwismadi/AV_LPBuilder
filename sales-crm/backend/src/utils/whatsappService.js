import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { standardizePhoneNumber } from './phoneUtils.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.qrCode = null;
    this.qrCodeImage = null;
    this.readyPromise = null;
  }

  initialize() {
    if (this.isInitialized) {
      console.log('WhatsApp service already initialized');
      return;
    }

    console.log('Initializing WhatsApp service...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth_sales_crm'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });

    this.client.on('qr', async (qr) => {
      console.log('QR Code received, generating image...');
      this.qrCode = qr;
      this.qrCodeImage = await qrcode.toDataURL(qr);
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.qrCode = null;
      this.qrCodeImage = null;
      if (this.readyResolve) {
        this.readyResolve();
      }
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated!');
    });

    // IMPORTANT: Only save INCOMING messages automatically
    // Outgoing messages are saved by the chat route when user sends from CRM
    this.client.on('message', async (message) => {
      // Only process incoming messages (not fromMe)
      if (message.fromMe) {
        return;
      }

      try {
        const phoneNumber = message.from;
        const standardizedPhone = standardizePhoneNumber(phoneNumber);
        const phoneHash = crypto.createHash('md5').update(standardizedPhone).digest('hex');
        
        console.log('Incoming message from:', standardizedPhone, 'body:', message.body);
        
        // Find current client with this phone number
        const client = await prisma.client.findFirst({
          where: { phoneNumber: standardizedPhone }
        });
        
        let timestamp = message.timestamp;
        if (timestamp && timestamp < 10000000000) {
          timestamp = timestamp * 1000;
        }
        
        // Save incoming chat history
        await prisma.chatHistory.create({
          data: {
            phoneHash,
            clientId: client ? client.id : null,
            message: message.body,
            isOutgoing: false,
            timestamp: new Date(timestamp || Date.now())
          }
        });
        
        if (client) {
          console.log('✓ Saved incoming message for client:', client.eventOrganizer);
        } else {
          console.log('✓ Saved incoming orphan message for phone:', standardizedPhone);
        }
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });

    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });

    this.client.initialize();
    this.isInitialized = true;
  }

  async sendMessage(phoneNumber, message) {
    if (!this.client || !this.isInitialized) {
      throw new Error('WhatsApp service not initialized');
    }

    if (!this.client.info) {
      throw new Error('WhatsApp not ready. Please scan QR code first.');
    }

    const standardizedPhone = standardizePhoneNumber(phoneNumber);
    const formattedNumber = standardizedPhone + '@c.us';
    
    try {
      const sentMessage = await this.client.sendMessage(formattedNumber, message);
      console.log('Message sent successfully to', formattedNumber);
      
      return {
        success: true,
        messageId: sentMessage.id._serialized,
        timestamp: sentMessage.timestamp
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  isReady() {
    return this.client && this.client.info !== undefined;
  }

  isAuthenticated() {
    return this.client && this.client.info !== undefined;
  }

  getQRCode() {
    return this.qrCode;
  }

  getQRCodeImage() {
    return this.qrCodeImage;
  }

  getStatus() {
    if (!this.isInitialized) {
      return 'initializing';
    }
    if (this.isReady()) {
      return 'ready';
    }
    if (this.qrCode) {
      return 'qr_available';
    }
    return 'loading';
  }

  getClientInfo() {
    if (!this.client || !this.client.info) {
      return null;
    }
    return {
      id: this.client.info.wid.user,
      name: this.client.info.pushname,
      phone: this.client.info.wid._serialized
    };
  }

  getIncomingMessages() {
    return [];
  }

  async restart() {
    console.log('Restarting WhatsApp service...');
    this.isInitialized = false;
    this.qrCode = null;
    this.qrCodeImage = null;
    
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (error) {
        console.error('Error destroying client:', error);
      }
    }
    
    this.initialize();
  }
}

export default new WhatsAppService();
