const jwt = require('jsonwebtoken');
const { logger } = require('../config/db');

/**
 * Middleware to verify JWT token
 * Attaches decoded user info to req.user
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized: No token provided.' 
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn('Invalid token attempt', { error: err.message });
        return res.status(403).json({ 
          success: false,
          message: 'Forbidden: Invalid or expired token.' 
        });
      }

      // Attach user info to request
      req.user = decoded;
      logger.debug('Token verified', { userId: decoded.id, role: decoded.role });
      next();
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication.' 
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
      message: 'Unauthorized: Authentication required.' 
    });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    logger.warn('Non-admin access attempt', { 
      userId: req.user.id, 
      role: req.user.role 
    });
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden: Requires admin privileges.' 
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
      message: 'Unauthorized: Authentication required.' 
    });
  }

  if (req.user.role === 'student' || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden: Requires student privileges.' 
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
      message: 'Unauthorized: Authentication required.' 
    });
  }

  if (req.user.role === 'faculty' || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden: Requires faculty privileges.' 
    });
  }
};

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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
  optionalAuth
};
