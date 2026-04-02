const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const QuestionnaireResponse = require('../models/QuestionnaireResponse');
const verifyToken = require('../middleware/verifyToken');
const { computeDiff } = require('../services/comparisonService');

// Helper: verify the requesting user is a member of the case
function isCaseMember(parentingCase, uid) {
  return parentingCase.parent1Uid === uid || parentingCase.parent2Uid === uid;
}

// GET /api/v1/cases/:caseId/status
router.get('/:caseId/status', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    res.status(200).json({ caseId: parentingCase._id, status: parentingCase.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cases/:caseId/my-responses
router.get('/:caseId/my-responses', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    const response = await QuestionnaireResponse.findOne({
      caseId: req.params.caseId,
      parentUid: req.user.uid,
    });

    if (!response) {
      return res.status(200).json({ answers: {}, isComplete: false });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/cases/:caseId/my-responses
router.put('/:caseId/my-responses', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

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

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/cases/:caseId/my-responses/submit
router.post('/:caseId/my-responses/submit', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    const response = await QuestionnaireResponse.findOneAndUpdate(
      { caseId: req.params.caseId, parentUid: req.user.uid },
      { $set: { isComplete: true, submittedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Check if the other parent has also submitted — if so, mark case as comparison_ready
    const otherUid = parentingCase.parent1Uid === req.user.uid ? parentingCase.parent2Uid : parentingCase.parent1Uid;
    const otherResponse = await QuestionnaireResponse.findOne({
      caseId: req.params.caseId,
      parentUid: otherUid,
    });

    if (otherResponse?.isComplete) {
      parentingCase.status = 'comparison_ready';
      await parentingCase.save();
    }

    res.status(200).json({ message: 'Responses submitted', isComplete: response.isComplete, caseStatus: parentingCase.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cases/:caseId/comparison
router.get('/:caseId/comparison', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    // Security gate: comparison is only available once both parents have submitted
    if (parentingCase.status !== 'comparison_ready') {
      return res.status(403).json({ error: 'Comparison not available yet — both parents must submit first' });
    }

    const [response1, response2] = await Promise.all([
      QuestionnaireResponse.findOne({ caseId: req.params.caseId, parentUid: parentingCase.parent1Uid }),
      QuestionnaireResponse.findOne({ caseId: req.params.caseId, parentUid: parentingCase.parent2Uid }),
    ]);

    const diff = computeDiff(response1?.answers, response2?.answers);

    res.status(200).json({ caseId: parentingCase._id, status: parentingCase.status, diff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
