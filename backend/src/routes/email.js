const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { sendExampleEmail } = require('../services/emailService');

const router = express.Router();

// POST /api/email/test - send a sample email to the signed-in Firebase user's email.
router.post('/test', verifyToken, async (req, res) => {
  try {
    const recipientEmail = req.user.email;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Firebase token is missing an email claim' });
    }

    const delivery = await sendExampleEmail(recipientEmail);

    return res.status(200).json({
      message: 'Test email sent',
      to: recipientEmail,
      delivery,
    });
  } catch (error) {
    console.error('Failed to send test email:', error.message);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Failed to send test email',
    });
  }
});

module.exports = router;
