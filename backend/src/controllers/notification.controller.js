const dataStore = require('../config/dataStore');
const { ROLES } = require('../config/constants');

const getNotifications = async (req, res) => {
  try {
    const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : req.query.workerId || null;
    let filter = {};

    if (workerId) {
      filter.$or = [{ workerId }, { workerId: null }]; // includes system-wide notifications
    }

    const notifications = await dataStore.notifications.find(filter);
    notifications.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'mark-all') {
      const workerId = req.user.role === ROLES.ASHA ? req.user.workerId : null;
      const notifs = await dataStore.notifications.find(workerId ? { workerId } : {});
      for (const n of notifs) {
        await dataStore.notifications.findByIdAndUpdate(n._id, { isRead: true });
      }
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const notif = await dataStore.notifications.findByIdAndUpdate(id, { isRead: true });
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read', notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNotifications, markAsRead };
