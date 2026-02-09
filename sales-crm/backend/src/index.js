import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import whatsappService from './utils/whatsappService.js';
import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/client.routes.js';
import chatRoutes from './routes/chat.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import templateRoutes from './routes/template.routes.js';
import scraperRoutes from './routes/scraper.routes.js';
import logsRoutes from './routes/logs.routes.js';
import monitorRoutes from './routes/monitor.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5174',
      'https://localhost:5174',
      'http://sales.arachnova.id',
      'https://sales.arachnova.id',
      'http://sales.webbuild.arachnova.id',
      'https://sales.webbuild.arachnova.id',
      'http://webbuild.arachnova.id',
      'https://webbuild.arachnova.id',
      'http://103.175.218.159:5174',
      'https://103.175.218.159:5174',
    ];
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.endsWith('.webbuild.arachnova.id') || origin.endsWith('.arachnova.id')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/monitor', monitorRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    whatsapp: whatsappService.isReady() ? 'connected' : 'disconnected'
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Cannot ' + req.method + ' ' + req.path
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Sales CRM API server running on http://0.0.0.0:' + PORT);
  console.log('Access via IP: http://103.175.218.159:' + PORT);
  console.log('Database: PostgreSQL (sales_crm_db)');
  whatsappService.initialize();
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
