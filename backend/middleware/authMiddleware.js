const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Safety check: is this user still in OUR current database?
    // We'll do this check lazily or for critical routes, but here is safest.
    const pool = require('../config/db');
    pool.execute('SELECT id FROM users WHERE id = ?', [decoded.id]).then(([rows]) => {
      if (rows.length === 0) {
          // User exists in JWT but not in DB -> Force logout
          return res.status(401).json({ message: 'User session invalid. Please log in again.' });
      }
      req.user = decoded;
      next();
    }).catch(err => {
        req.user = decoded; // Fallback to decoded if DB is slow but at least decoded ok
        next();
    });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = { authenticate, authorizeAdmin };
