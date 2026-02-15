import { verifyAccessToken } from '../utils/jwt.js';

// Authentication middleware - verifies JWT token from cookie OR Authorization header
export function authenticate(req, res, next) {
  try {
    // Try to get token from httpOnly cookie first
    let token = req.cookies.accessToken;

    // If no cookie token, try Authorization header (for API-to-API communication)
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

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
    let token = req.cookies.accessToken;

    // Try Authorization header if no cookie
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

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
