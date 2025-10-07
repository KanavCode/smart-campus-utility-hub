const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const db = require('../config/db');

/**
 * Protect middleware - Verifies JWT token and adds user to request
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const currentUser = rows[0];

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Remove password from user object
    currentUser.password = undefined;

    // 5) Grant access to protected route
    req.user = currentUser;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again!'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your token has expired! Please log in again.'
      });
    }
    
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token or session expired.'
    });
  }
};

/**
 * Restrict middleware - Restricts access to specific roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'teacher']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

/**
 * Optional auth middleware - Adds user to request if token exists but doesn't require it
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      const currentUser = rows[0];
      
      if (currentUser) {
        currentUser.password = undefined;
        req.user = currentUser;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};