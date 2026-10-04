const jwt = require('jsonwebtoken');
const dataStore = require('../config/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'asha-smart-secret-jwt-key-2026';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await dataStore.users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact Administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token', error: err.message });
  }
};

module.exports = { authenticate, JWT_SECRET };
