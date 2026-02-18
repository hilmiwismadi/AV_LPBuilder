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
    this.lastReadyTime = 0; // track last ready for stability grace period
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
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      },
      // Disable auto-marking as read to avoid WhatsApp Web.js errors
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
      }
    });

    this.client.on('qr', async (qr) => {
      console.log('QR Code received, generating image...');
      this.qrCode = qr;
      this.qrCodeImage = await qrcode.toDataURL(qr);
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.lastReadyTime = Date.now();
      this.qrCode = null;
      this.qrCodeImage = null;
      if (this.readyResolve) {
        this.readyResolve();
      }
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failure:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isInitialized = false;
    });

    // METHOD 1: Using message_create event (captures ALL messages including from phone)
    this.client.on('message_create', async (message) => {
      try {
        // Skip group messages and status updates
        if (message.from && (message.from.includes('@g.us') || message.from.includes('status@broadcast'))) {
          return;
        }
        if (message.to && (message.to.includes('@g.us') || message.to.includes('status@broadcast'))) {
          return;
        }

        const isOutgoing = message.fromMe;
        const phoneNumber = isOutgoing ? message.to : message.from;
        const standardizedPhone = standardizePhoneNumber(phoneNumber);
        const phoneHash = crypto.createHash('md5').update(standardizedPhone).digest('hex');

        console.log(
          '[WA-CREATE]',
          isOutgoing ? 'Outgoing message to:' : 'Incoming message from:',
          standardizedPhone,
          'body:',
          message.body || '[no text]'
        );

        // Skip media-only messages or empty messages
        if (!message.body || message.body.trim() === '') {
          console.log('[WA-CREATE] Skipping message without text content');
          return;
        }

        // Find client with this phone number
        const client = await prisma.client.findFirst({
          where: { phoneNumber: standardizedPhone }
        });

        let timestamp = message.timestamp;
        if (timestamp && timestamp < 10000000000) {
          timestamp = timestamp * 1000;
        }

        // Check for duplicates within 10 seconds
        const recentMessage = await prisma.chatHistory.findFirst({
          where: {
            phoneHash,
            message: message.body,
            isOutgoing,
            timestamp: {
              gte: new Date(Date.now() - 10000)
            }
          },
          orderBy: { timestamp: 'desc' }
        });

        if (recentMessage) {
          console.log('[WA-CREATE] ✓ Message already exists, skipping duplicate');
          return;
        }

        // Save to database
        await prisma.chatHistory.create({
          data: {
            phoneHash,
            clientId: client ? client.id : null,
            message: message.body,
            isOutgoing,
            timestamp: new Date(timestamp || Date.now())
          }
        });

        if (client) {
          console.log(
            '[WA-CREATE] ✓ Saved',
            isOutgoing ? 'outgoing' : 'incoming',
            'message for client:',
            client.eventOrganizer
          );
        } else {
          console.log(
            '[WA-CREATE] ✓ Saved',
            isOutgoing ? 'outgoing' : 'incoming',
            'orphan message for phone:',
            standardizedPhone
          );
        }
      } catch (error) {
        console.error('[WA-CREATE] Error in message_create handler:', error);
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
      return {
        success: false,
        error: 'WhatsApp service not initialized'
      };
    }

    if (!this.client.info) {
      return {
        success: false,
        error: 'WhatsApp not ready. Please scan QR code first.'
      };
    }

    const standardizedPhone = standardizePhoneNumber(phoneNumber);
    const formattedNumber = standardizedPhone + '@c.us';

    try {
      console.log('Sending message to:', formattedNumber);

      // Grace period: wait until 4s after last ready event so page internals fully stabilize
      const timeSinceReady = Date.now() - this.lastReadyTime;
      if (timeSinceReady < 4000) {
        const wait = 4000 - timeSinceReady;
        console.log('[WA] Waiting ' + wait + 'ms for client to stabilize after reconnect...');
        await new Promise(resolve => setTimeout(resolve, wait));
      }

      // Check if number exists on WhatsApp
      const numberId = await this.client.getNumberId(formattedNumber).catch((err) => {
        console.log('Number ID check failed, trying anyway:', err.message);
        return { _serialized: formattedNumber };
      });

      if (!numberId) {
        return {
          success: false,
          error: 'Phone number not registered on WhatsApp'
        };
      }

      // Send the message with retry logic
      let sentMessage;
      let lastError;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          sentMessage = await this.client.sendMessage(numberId._serialized, message);
          console.log('✓ Message sent successfully to', formattedNumber, 'on attempt', attempt);

          return {
            success: true,
            messageId: sentMessage.id?._serialized || 'unknown',
            timestamp: sentMessage.timestamp || Date.now()
          };
        } catch (sendError) {
          lastError = sendError;
          console.log(`Attempt ${attempt} failed:`, sendError.message);

          // If it's the markedUnread error, wait and retry
          if (sendError.message.includes('markedUnread') || sendError.message.includes('Cannot read properties')) {
            if (attempt < 3) {
              console.log('Retrying after 3 seconds...');
              await new Promise(resolve => setTimeout(resolve, 3000));
              continue;
            }
          } else {
            // For other errors, don't retry
            break;
          }
        }
      }

      // If all attempts failed
      console.error('All send attempts failed. Last error:', lastError);
      return {
        success: false,
        error: lastError?.message || 'Failed to send message after multiple attempts'
      };

    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message'
      };
    }
  }

  parsePhoneNumber(phoneNumber) {
    const standardized = standardizePhoneNumber(phoneNumber);
    return standardized + '@c.us';
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
