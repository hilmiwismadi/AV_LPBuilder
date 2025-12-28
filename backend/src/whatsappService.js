import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import prisma from './db.js';
import { formatPhoneForWhatsApp } from './utils/phoneParser.js';

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
    this.whitelist = new Set();
  }

  async initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      console.log('QR Code received, scan with WhatsApp:');
      qrcode.generate(qr, { small: true });
      this.qrCode = qr;
    });

    this.client.on('ready', async () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
      await this.updateWhitelist();
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp authenticated');
    });

    this.client.on('message', async (message) => {
      await this.handleIncomingMessage(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp disconnected:', reason);
      this.isReady = false;
    });

    await this.client.initialize();
  }

  async updateWhitelist() {
    try {
      const clients = await prisma.client.findMany({
        select: { phoneNumber: true }
      });

      this.whitelist = new Set(clients.map(c => formatPhoneForWhatsApp(c.phoneNumber)));
      console.log(`Whitelist updated: ${this.whitelist.size} numbers`);
    } catch (error) {
      console.error('Error updating whitelist:', error);
    }
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    const formattedNumber = formatPhoneForWhatsApp(phoneNumber);

    if (!this.whitelist.has(formattedNumber)) {
      throw new Error('Phone number is not whitelisted');
    }

    try {
      await this.client.sendMessage(formattedNumber, message);

      // Save to chat history for ALL clients with this phone number (both startups)
      const clients = await prisma.client.findMany({
        where: { phoneNumber }
      });

      // Create chat history for each client (NovaGate and NovaTix)
      for (const client of clients) {
        await prisma.chatHistory.create({
          data: {
            clientId: client.id,
            message,
            isOutgoing: true
          }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async handleIncomingMessage(message) {
    try {
      const phoneNumber = message.from.replace('@c.us', '');

      if (!this.whitelist.has(message.from)) {
        console.log('Message from non-whitelisted number:', phoneNumber);
        return;
      }

      // Find ALL clients with this phone number (for both NovaGate and NovaTix)
      const clients = await prisma.client.findMany({
        where: {
          phoneNumber: {
            contains: phoneNumber.substring(phoneNumber.length - 10) // Match last 10 digits
          }
        }
      });

      // Save message to chat history for ALL matching clients
      for (const client of clients) {
        await prisma.chatHistory.create({
          data: {
            clientId: client.id,
            message: message.body,
            isOutgoing: false
          }
        });

        console.log(`Saved incoming message from ${client.eventOrganizer} (${client.startup})`);
      }

      if (clients.length === 0) {
        console.log(`No client found for phone number: ${phoneNumber}`);
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      whitelistCount: this.whitelist.size,
      qrCode: this.qrCode
    };
  }
}

// Singleton instance
const whatsappService = new WhatsAppService();

export default whatsappService;
