import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'temp-access-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'temp-refresh-secret-change-me';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Generate access token
export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  );
}

// Generate refresh token and store in database
export async function generateRefreshToken(user) {
  const token = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );

  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt
    }
  });

  return token;
}

// Verify access token
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

// Revoke refresh token (logout)
export async function revokeRefreshToken(token) {
  try {
    await prisma.refreshToken.delete({
      where: { token }
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if refresh token exists in database and is not expired
export async function validateRefreshToken(token) {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!refreshToken) {
    return null;
  }

  // Check if token is expired
  if (refreshToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { token }
    });
    return null;
  }

  return refreshToken.user;
}

// Clean up expired refresh tokens (call this periodically)
export async function cleanupExpiredTokens() {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}
