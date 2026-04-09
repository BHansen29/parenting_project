const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Case = require('../models/Case');
const Invitation = require('../models/Invitation');
const Plan = require('../models/Plan');
const verifyToken = require('../middleware/verifyToken');
const { sendInviteEmail } = require('../services/emailService');

// How long an invite link stays valid before it expires
const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Looks up an invitation by token and checks it is still valid.
// Returns { invitation } on success, or { error, status } if something is wrong.
// Used by both the GET and POST /accept routes to avoid duplicating this logic.
async function findValidInvitation(token) {
  const invitation = await Invitation.findOne({ token });
  if (!invitation) return { error: 'Invitation not found', status: 410 };
  if (invitation.expiresAt < new Date()) return { error: 'Invitation has expired', status: 410 };
  if (invitation.status === 'accepted') return { error: 'Invitation has already been accepted', status: 410 };
  return { invitation };
}

// POST /api/v1/cases/:caseId/invite - Parent 1 sends an invite email to their co-parent.
// Creates an Invitation document with a secure random token and emails the invite link.
// Only the case creator (parent1) is allowed to send invites.
router.post('/cases/:caseId/invite', verifyToken, async (req, res) => {
  try {
    const { invitedEmail } = req.body;
    if (!invitedEmail) return res.status(400).json({ error: 'invitedEmail is required' });

    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (parentingCase.parent1Uid !== req.user.uid) return res.status(403).json({ error: 'Only the case creator can send invitations' });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

    await Invitation.create({ caseId: parentingCase._id, invitedEmail, token, expiresAt });

    // Build the invite link using APP_BASE_URL from .env - the frontend handles this route
    const inviteLink = `${process.env.APP_BASE_URL}/invite/${token}`;

    // Email failure is non-fatal — invitation record is already created.
    // Log the error so ops can see it but don't block the response.
    try {
      await sendInviteEmail(invitedEmail, inviteLink);
    } catch (emailErr) {
      console.error('Failed to send invite email:', emailErr.message);
    }

    return res.status(201).json({ message: 'Invitation sent', invitedEmail });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/invitations/:token - Public endpoint used by the frontend when a co-parent
// clicks their invite link. Returns the caseId so the frontend knows which case to attach to.
// No auth required - the token itself is the credential.
router.get('/invitations/:token', async (req, res) => {
  try {
    const { invitation, error, status } = await findValidInvitation(req.params.token);
    if (error) return res.status(status).json({ error });

    return res.status(200).json({ caseId: invitation.caseId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/invitations/:token/accept - Parent 2 accepts the invite after signing in.
// Links their Firebase UID to the case as parent2 and marks the token as used.
// Several checks prevent abuse: self-acceptance, already-joined cases, and wrong-email acceptance.
router.post('/invitations/:token/accept', verifyToken, async (req, res) => {
  try {
    const { invitation, error, status } = await findValidInvitation(req.params.token);
    if (error) return res.status(status).json({ error });

    const parentingCase = await Case.findById(invitation.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });

    // Parent 1 cannot accept their own invite
    if (parentingCase.parent1Uid === req.user.uid) return res.status(403).json({ error: 'You cannot accept your own invitation' });

    // Prevent a third party from hijacking the invite if they somehow obtained the link
    if (parentingCase.parent2Uid) return res.status(409).json({ error: 'A co-parent has already joined this case' });

    // The accepting user must be signed in with the email the invite was sent to
    const userEmail = req.user.email || '';
    if (userEmail.toLowerCase() !== invitation.invitedEmail.toLowerCase()) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }

    parentingCase.parent2Uid = req.user.uid;
    // Link parent2's plan and mark parent1's plan as shared
    try {
      const parent2Plan = await Plan.findOne({ caseId: invitation.caseId, userID: req.user.uid });
      if (parent2Plan) parentingCase.parent2PlanId = parent2Plan._id;
      await Plan.updateOne({ caseId: invitation.caseId, userID: parentingCase.parent1Uid }, { isShared: true });
    } catch (e) { /* non-fatal */ }
    invitation.status = 'accepted';

    // Save both at the same time to avoid one succeeding and the other failing
    await Promise.all([parentingCase.save(), invitation.save()]);

    return res.status(200).json({ message: 'Invitation accepted', caseId: parentingCase._id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cases/:caseId/pending-invite
// Returns the invite link for the most recent pending invitation on this case.
router.get('/cases/:caseId/pending-invite', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (parentingCase.parent1Uid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const invitation = await Invitation.findOne({ caseId: req.params.caseId, status: 'pending' }).sort({ createdAt: -1 });
    if (!invitation) return res.status(404).json({ error: 'No pending invitation found' });

    const inviteLink = `${process.env.APP_BASE_URL}/invite/${invitation.token}`;
    return res.status(200).json({ inviteLink });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
