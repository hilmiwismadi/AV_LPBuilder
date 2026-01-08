import express from 'express';
import { login, logout, refresh, verify } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login - Login with email and password
router.post('/login', login);

// POST /api/auth/logout - Logout and revoke refresh token
router.post('/logout', logout);

// POST /api/auth/refresh - Refresh access token using refresh token
router.post('/refresh', refresh);

// GET /api/auth/verify - Verify current user (requires authentication)
router.get('/verify', authenticate, verify);

export default router;
