const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { sendInviteEmail } = require('../services/emailService');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/email/invite - send an invite-style email to the submitted recipient.
router.post('/invite', verifyToken, async (req, res) => {
  try {
    const recipientEmail = typeof req.body?.email === 'string'
      ? req.body.email.trim()
      : '';

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Please enter an email address.' });
    }

    if (!EMAIL_REGEX.test(recipientEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const delivery = await sendInviteEmail(recipientEmail);

    return res.status(200).json({
      message: 'Invite email sent',
      to: recipientEmail,
      delivery,
    });
  } catch (error) {
    console.error('Failed to send invite email:', error.message);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Failed to send invite email',
    });
  }
});

module.exports = router;
