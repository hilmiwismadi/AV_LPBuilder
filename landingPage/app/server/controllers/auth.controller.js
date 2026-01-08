import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  validateRefreshToken,
  revokeRefreshToken
} from '../utils/jwt.js';

const prisma = new PrismaClient();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: process.env.COOKIE_DOMAIN || undefined,
  path: '/',
};

// Login controller
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data (without password)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to login'
    });
  }
}

// Logout controller
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Revoke refresh token from database
      await revokeRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to logout'
    });
  }
}

// Refresh token controller
export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Token verification failed'
      });
    }

    // Validate refresh token exists in database
    const user = await validateRefreshToken(refreshToken);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Token not found or expired'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to refresh token'
    });
  }
}

// Verify current user controller
export async function verify(req, res) {
  try {
    // req.user is set by authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'No valid session'
      });
    }

    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify user'
    });
  }
}
