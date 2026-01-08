import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Event Organizer (superadmin only)
export async function createEventOrganizer(req, res) {
  try {
    const { email, password, name } = req.body;
    const createdById = req.user.userId;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'EVENT_ORGANIZER',
        createdById
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Event Organizer created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create user'
    });
  }
}

// Get all Event Organizers (superadmin only)
export async function listEventOrganizers(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'EVENT_ORGANIZER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            configurations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      users,
      count: users.length
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve users'
    });
  }
}

// Update Event Organizer (superadmin only)
export async function updateEventOrganizer(req, res) {
  try {
    const { id } = req.params;
    const { email, name, password } = req.body;

    const updateData = {};

    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update user'
    });
  }
}

// Delete Event Organizer (superadmin only)
export async function deleteEventOrganizer(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists and is not a superadmin
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    if (user.role === 'SUPERADMIN') {
      return res.status(403).json({
        error: 'Cannot delete superadmin',
        message: 'Superadmin users cannot be deleted'
      });
    }

    // Delete user (configurations will cascade delete due to schema)
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete user'
    });
  }
}
