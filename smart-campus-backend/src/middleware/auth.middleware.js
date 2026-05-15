const jwt = require('jsonwebtoken');
const { logger } = require('../config/db');
const AUTH_COOKIE_NAME = 'authToken';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  
  if (process.env.NODE_ENV === 'test') {
    return 'test-jwt-secret';
  }

  throw new Error('JWT_SECRET is not configured');
};

const extractTokenFromCookieHeader = (cookieHeader) => {
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;

  const cookies = cookieHeader.split(';');
  for (const cookieEntry of cookies) {
    const [rawName, ...rawValueParts] = cookieEntry.trim().split('=');
    if (rawName === AUTH_COOKIE_NAME) {
      return decodeURIComponent(rawValueParts.join('='));
    }
  }

  return null;
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.split(' ')[1];

  if (bearerToken) {
    return bearerToken;
  }

  return extractTokenFromCookieHeader(req.headers.cookie);
};

/**
 * Middleware to verify JWT token
 * Attaches decoded user info to req.user
 */
const verifyToken = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided.',
      });
    }

    // Verify token
    jwt.verify(token, getJwtSecret(), (err, decoded) => {
      if (err) {
        logger.warn('JWT verification failed', {
          errorType: err.name,
          message: err.message,
          url: req.originalUrl,
          method: req.method,
          ip: req.ip,
        });

        const message =
          err.name === 'TokenExpiredError'
            ? 'Unauthorized: Token has expired.'
            : 'Unauthorized: Invalid token.';

        return res.status(401).json({
          success: false,
          message,
        });
      }

      // Attach user info to request
      req.user = decoded;
      logger.debug('Token verified', {
        userId: decoded.id,
        role: decoded.role,
      });
      next();
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

/**
 * Middleware to verify if user is an admin
 * Must be used AFTER verifyToken
 */
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required.',
    });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    logger.warn('Non-admin access attempt', {
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Requires admin privileges.',
    });
  }
};

/**
 * Middleware to verify if user is a student
 * Must be used AFTER verifyToken
 */
const verifyStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required.',
    });
  }

  if (req.user.role === 'student' || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Requires student privileges.',
    });
  }
};

/**
 * Middleware to verify if user is faculty
 * Must be used AFTER verifyToken
 */
const verifyFaculty = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required.',
    });
  }

  if (req.user.role === 'faculty' || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Requires faculty privileges.',
    });
  }
};

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || '7d',
) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
const optionalAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }

    next();
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyStudent,
  verifyFaculty,
  generateToken,
  optionalAuth,
};
