const express = require('express');
const router = express.Router();
const Invitation = require('../models/Invitation');
const Case = require('../models/Case');
const verifyToken = require('../middleware/verifyToken');

// GET /api/invitations/:token - Validate an invitation token (no auth required)
router.get('/:token', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token });

    if (!invitation) {
      return res.json({ valid: false, reason: 'invalid' });
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return res.json({ valid: false, reason: 'expired' });
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return res.json({ valid: false, reason: 'already_accepted' });
    }

    // Get inviter's email if possible
    const caseDoc = await Case.findById(invitation.caseId);

    res.json({
      valid: true,
      caseId: invitation.caseId.toString(),
      inviterEmail: invitation.invitedEmail, // We'll improve this later to get actual inviter email
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    res.status(500).json({ valid: false, reason: 'error' });
  }
});

// POST /api/invitations/:token/accept - Accept an invitation (requires auth)
router.post('/:token/accept', verifyToken, async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return res.status(400).json({ error: 'Invitation has already been accepted' });
    }

    // Get the case
    const caseDoc = await Case.findById(invitation.caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: 'Associated case not found' });
    }

    // Check if user is already a member
    if (caseDoc.parent1Uid === req.user.uid || caseDoc.parent2Uid === req.user.uid) {
      return res.status(400).json({ error: 'You are already a member of this case' });
    }

    // Link user to case as parent2
    caseDoc.parent2Uid = req.user.uid;
    await caseDoc.save();

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    res.json({
      caseId: caseDoc._id.toString(),
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
