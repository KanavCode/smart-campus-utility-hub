const jwt = require('jsonwebtoken');

// Middleware to verify if a valid token is present
const verifyToken = (req, res, next) => {
  // Get the token from the request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token.' });
    }
    // If the token is valid, attach the decoded payload to the request object
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  });
};

// Middleware to verify if the user is an admin
// This middleware MUST run AFTER verifyToken
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    return res.status(403).json({ message: 'Forbidden: Requires admin privileges.' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};