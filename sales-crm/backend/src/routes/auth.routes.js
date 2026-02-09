import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', domain: process.env.COOKIE_DOMAIN || 'localhost', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ message: 'Login successful', user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (error) { res.status(500).json({ error: 'Login failed' }); }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { domain: process.env.COOKIE_DOMAIN || 'localhost' });
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id }, select: { id: true, email: true, name: true, role: true } });
    if (!admin) return res.status(401).json({ error: 'User not found' });
    res.json(admin);
  } catch (error) { res.status(401).json({ error: 'Invalid token' }); }
});

export default router;
