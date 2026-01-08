import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Role-based authorization middleware
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Authorization failed',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

// Check if user owns the configuration
export async function checkConfigOwnership(req, res, next) {
  try {
    const { slug, id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Superadmin can access all configurations
    if (userRole === 'SUPERADMIN') {
      return next();
    }

    // Get configuration by slug or id
    const configuration = await prisma.configuration.findUnique({
      where: slug ? { slug } : { id },
      select: { ownerId: true }
    });

    if (!configuration) {
      return res.status(404).json({ 
        error: 'Configuration not found',
        message: 'The requested configuration does not exist'
      });
    }

    // Check if user owns this configuration
    if (configuration.ownerId !== userId) {
      return res.status(403).json({ 
        error: 'Authorization failed',
        message: 'You do not have permission to access this configuration'
      });
    }

    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to verify ownership'
    });
  }
}
