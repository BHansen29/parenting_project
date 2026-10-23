const User = require('../models/User');

async function requireAdmin(req, res, next) {
  if (!req.user || req.user.email_verified !== true || !req.user.email) {
    return res.status(403).json({ error: 'Administrator access required' });
  }

  try {
    const email = req.user.email.trim().toLowerCase();
    const user = await User.findOne({
      firebaseUid: req.user.uid,
      email,
      emailVerified: true,
      role: 'admin'
    }).select('_id');

    if (!user) {
      return res.status(403).json({ error: 'Administrator access required' });
    }

    return next();
  } catch (error) {
    console.error('Could not verify administrator role:', error);
    return res.status(500).json({ error: 'Could not verify administrator access' });
  }
}

module.exports = requireAdmin;
