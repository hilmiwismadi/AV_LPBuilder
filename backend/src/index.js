import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clientRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import whatsappService from './whatsappService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CRM Backend is running' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Initialize WhatsApp
  console.log('Initializing WhatsApp service...');
  try {
    await whatsappService.initialize();
  } catch (error) {
    console.error('Failed to initialize WhatsApp:', error);
  }
});
