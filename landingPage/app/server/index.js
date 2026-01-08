import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import configRoutes from './routes/config.routes.js';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// CORS Configuration - Allow main domain and all subdomains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'https://localhost:5173',
      'http://webbuild.arachnova.id',
      'https://webbuild.arachnova.id',
    ];

    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check if origin matches wildcard subdomain pattern: *.webbuild.arachnova.id
    const subdomainPattern = /^https?:\/\/[\w-]+\.webbuild\.arachnova\.id$/;
    if (subdomainPattern.test(origin)) {
      return callback(null, true);
    }

    // Origin not allowed
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true // Allow cookies
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increased limit for image data
app.use(cookieParser()); // Parse cookies for JWT tokens

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/configurations', configRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    subdomain: '*.webbuild.arachnova.id'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Start server - bind to 0.0.0.0 for external IP access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
  console.log(`Access via IP: http://103.175.218.159:${PORT}`);
  console.log(`Database: PostgreSQL (lpbuilder_db)`);
  console.log(`Subdomain routing enabled: *.webbuild.arachnova.id`);
  console.log(`Authentication: JWT with httpOnly cookies`);
  console.log(`CORS: Allowing main domain + wildcard subdomains`);
});

// Graceful shutdown
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
