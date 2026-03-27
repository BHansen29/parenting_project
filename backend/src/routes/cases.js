const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const QuestionnaireResponse = require('../models/QuestionnaireResponse');
const Invitation = require('../models/Invitation');
const verifyToken = require('../middleware/verifyToken');
const { computeDiff } = require('../services/comparisonService');
const { sendInviteEmailWithToken } = require('../services/emailService');

// Helper: verify the requesting user is a member of the case
function isCaseMember(caze, uid) {
  return caze.parent1Uid === uid || caze.parent2Uid === uid;
}

// POST /api/v1/cases - Create a new case
router.post('/', verifyToken, async (req, res) => {
  try {
    const newCase = await Case.create({
      parent1Uid: req.user.uid,
      parent2Uid: null,
      status: 'pending_invite',
    });

    res.status(201).json({ caseId: newCase._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/cases/:caseId/invite - Send invitation to co-parent
router.post('/:caseId/invite', verifyToken, async (req, res) => {
  try {
    const caze = await Case.findById(req.params.caseId);
    if (!caze) return res.status(404).json({ error: 'Case not found' });

    // Only parent1 can send invites
    if (caze.parent1Uid !== req.user.uid) {
      return res.status(403).json({ error: 'Only the case creator can send invites' });
    }

    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const recipientEmail = email.trim().toLowerCase();

    // Check for existing pending invitation to this email for this case
    const existingInvite = await Invitation.findOne({
      caseId: req.params.caseId,
      invitedEmail: recipientEmail,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return res.json({
        status: 'pending',
        message: 'An invitation to this email is already pending',
      });
    }

    // Check for expired invitation - create new one
    const expiredInvite = await Invitation.findOne({
      caseId: req.params.caseId,
      invitedEmail: recipientEmail,
      $or: [
        { status: 'expired' },
        { expiresAt: { $lte: new Date() } },
      ],
    });

    // Create new invitation
    const invitation = await Invitation.create({
      caseId: req.params.caseId,
      invitedEmail: recipientEmail,
      inviterUid: req.user.uid,
    });

    // Send email with invitation token
    try {
      await sendInviteEmailWithToken(recipientEmail, invitation.token);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Delete the invitation if email fails
      await Invitation.findByIdAndDelete(invitation._id);
      throw emailError;
    }

    res.json({
      status: expiredInvite ? 'expired' : 'sent',
      message: expiredInvite
        ? 'Previous invitation expired. New invitation sent successfully'
        : 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cases/:caseId/status
router.get('/:caseId/status', verifyToken, async (req, res) => {
  try {
    const caze = await Case.findById(req.params.caseId);
    if (!caze) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(caze, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    res.json({ caseId: caze._id, status: caze.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cases/:caseId/my-responses
router.get('/:caseId/my-responses', verifyToken, async (req, res) => {
  try {
    const caze = await Case.findById(req.params.caseId);
    if (!caze) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(caze, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    const response = await QuestionnaireResponse.findOne({
      caseId: req.params.caseId,
      parentUid: req.user.uid,
    });

    if (!response) {
      return res.json({ answers: {}, isComplete: false });
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/cases/:caseId/my-responses
router.put('/:caseId/my-responses', verifyToken, async (req, res) => {
  try {
    const caze = await Case.findById(req.params.caseId);
    if (!caze) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(caze, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    // Lock answers after submission
    const existing = await QuestionnaireResponse.findOne({
      caseId: req.params.caseId,
      parentUid: req.user.uid,
    });
    if (existing?.isComplete) {
      return res.status(409).json({ error: 'Responses already submitted and cannot be changed' });
    }

    const updated = await QuestionnaireResponse.findOneAndUpdate(
      { caseId: req.params.caseId, parentUid: req.user.uid },
      { $set: { answers: req.body.answers } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/cases/:caseId/my-responses/submit
router.post('/:caseId/my-responses/submit', verifyToken, async (req, res) => {
  try {
    const caze = await Case.findById(req.params.caseId);
    if (!caze) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(caze, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    const response = await QuestionnaireResponse.findOneAndUpdate(
      { caseId: req.params.caseId, parentUid: req.user.uid },
      { $set: { isComplete: true, submittedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Check if the other parent has also submitted — if so, mark case as comparison_ready
    const otherUid = caze.parent1Uid === req.user.uid ? caze.parent2Uid : caze.parent1Uid;
    const otherResponse = await QuestionnaireResponse.findOne({
      caseId: req.params.caseId,
      parentUid: otherUid,
    });

    if (otherResponse?.isComplete) {
      caze.status = 'comparison_ready';
      await caze.save();
    }

    res.json({ message: 'Responses submitted', isComplete: response.isComplete, caseStatus: caze.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cases/:caseId/comparison
router.get('/:caseId/comparison', verifyToken, async (req, res) => {
  try {
    const caze = await Case.findById(req.params.caseId);
    if (!caze) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(caze, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    // Security gate: comparison is only available once both parents have submitted
    if (caze.status !== 'comparison_ready') {
      return res.status(403).json({ error: 'Comparison not available yet — both parents must submit first' });
    }

    const [response1, response2] = await Promise.all([
      QuestionnaireResponse.findOne({ caseId: req.params.caseId, parentUid: caze.parent1Uid }),
      QuestionnaireResponse.findOne({ caseId: req.params.caseId, parentUid: caze.parent2Uid }),
    ]);

    const diff = computeDiff(response1?.answers, response2?.answers);

    res.json({ caseId: caze._id, status: caze.status, diff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
