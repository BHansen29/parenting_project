const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const Plan = require('../models/Plan');
const User = require('../models/User');
const QuestionnaireResponse = require('../models/QuestionnaireResponse');
const verifyToken = require('../middleware/verifyToken');
const { computeDiff } = require('../services/comparisonService');
const { getFirstName } = require('../utils/nameUtils');

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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/cases/:caseId/comparison
router.get('/:caseId/comparison', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    // Security gate: comparison is only available once both parents have submitted
    if (!['comparison_ready', 'resolved'].includes(parentingCase.status)) {
      return res.status(403).json({ error: 'Comparison not available yet — both parents must submit first' });
    }

    const [response1, response2] = await Promise.all([
      QuestionnaireResponse.findOne({ caseId: req.params.caseId, parentUid: parentingCase.parent1Uid }),
      QuestionnaireResponse.findOne({ caseId: req.params.caseId, parentUid: parentingCase.parent2Uid }),
    ]);

    const diff = computeDiff(response1?.answers, response2?.answers);

    res.status(200).json({ caseId: parentingCase._id, status: parentingCase.status, diff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/cases/:caseId/plan-comparison
// Compares both parents' Plan.answers and returns a diff. Works even before both parents submit.
router.get('/:caseId/plan-comparison', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    if (!parentingCase.parent2Uid) {
      return res.status(200).json({ caseId: parentingCase._id, status: 'waiting_for_coparent', diff: [] });
    }

    const [plan1, plan2] = await Promise.all([
      Plan.findOne({ caseId: req.params.caseId, userID: parentingCase.parent1Uid }),
      Plan.findOne({ caseId: req.params.caseId, userID: parentingCase.parent2Uid }),
    ]);

    const toAnswerMap = (plan) => {
      if (!plan) return {};
      return plan.answers.reduce((acc, a) => { acc[a.qKey] = a.answer; return acc; }, {});
    };

    const diff = computeDiff(toAnswerMap(plan1), toAnswerMap(plan2));

    res.status(200).json({ caseId: parentingCase._id, status: parentingCase.status, diff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/cases/:caseId/merge
// Saves the parents' resolved answer selections into mergedAnswers on the Case.
// Both parents can call this. mergedAnswers contains all qKeys — agreed ones auto-included,
// disagreed ones use whichever parent's answer was selected on the frontend.
router.post('/:caseId/merge', verifyToken, async (req, res) => {
  try {
    const parentingCase = await Case.findById(req.params.caseId);
    if (!parentingCase) return res.status(404).json({ error: 'Case not found' });

    // Only members of this case can save merged answers
    if (!isCaseMember(parentingCase, req.user.uid)) return res.status(403).json({ error: 'Forbidden' });

    // Convert the merged answer map into the Plan.answers array format: [{ qKey, answer }]
    const mergedAnswersArray = Object.entries(req.body.mergedAnswers || {}).map(([qKey, answer]) => ({ qKey, answer }));

    // Look up both parents' emails to use as descriptive plan names
    const [p1User, p2User] = await Promise.all([
      User.findOne({ firebaseUid: parentingCase.parent1Uid }, 'name email'),
      User.findOne({ firebaseUid: parentingCase.parent2Uid }, 'name email'),
    ]);
    const p1Name = getFirstName(p1User);
    const p2Name = getFirstName(p2User);
    const mergedPlanName = `${p1Name} & ${p2Name} - Merged Plan`;

    const p1Plan = await Plan.findById(parentingCase.parent1PlanId);
    const sharedChildren = p1Plan?.children ?? [];

    await Promise.all([
      Plan.create({ userID: parentingCase.parent1Uid, name: mergedPlanName, answers: mergedAnswersArray, children: sharedChildren, caseId: parentingCase._id, isShared: true }),
      Plan.create({ userID: parentingCase.parent2Uid, name: mergedPlanName, answers: mergedAnswersArray, children: sharedChildren, caseId: parentingCase._id, isShared: true }),
    ]);

    // Save the case as resolved only after both plans are successfully created
    parentingCase.mergedAnswers = req.body.mergedAnswers || {};
    parentingCase.status = 'resolved';
    await parentingCase.save();

    res.status(200).json({ message: 'Merged plan saved', status: parentingCase.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
