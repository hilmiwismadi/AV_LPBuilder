import { verifyAccessToken } from '../utils/jwt.js';

// Authentication middleware - verifies JWT token from cookie
export function authenticate(req, res, next) {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No access token provided'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid or expired access token'
      });
    }

    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Token verification failed'
    });
  }
}

// Optional authentication - doesn't fail if no token
export function optionalAuthenticate(req, res, next) {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}
