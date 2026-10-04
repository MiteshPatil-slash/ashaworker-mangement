const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../config/dataStore');
const { JWT_SECRET } = require('../middleware/auth');
const { logAudit } = require('../services/audit');
const { MODULES } = require('../config/constants');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await dataStore.users.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, workerId: user.workerId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let workerDetails = null;
    if (user.workerId) {
      workerDetails = await dataStore.workers.findOne({ workerId: user.workerId });
    }

    await logAudit({
      user,
      action: 'USER_LOGIN',
      module: MODULES.SYSTEM,
      recordId: user._id,
      details: { role: user.role, username: user.username },
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        workerId: user.workerId,
        mustChangePassword: user.mustChangePassword || false,
        workerDetails
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    let workerDetails = null;
    if (user.workerId) {
      workerDetails = await dataStore.workers.findOne({ workerId: user.workerId });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        workerId: user.workerId,
        mustChangePassword: user.mustChangePassword || false,
        workerDetails
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dataStore.users.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      mustChangePassword: false
    });

    await logAudit({
      user,
      action: 'PASSWORD_CHANGED',
      module: MODULES.SYSTEM,
      recordId: user._id,
      details: { username: user.username },
      ip: req.ip
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login, getMe, changePassword };
