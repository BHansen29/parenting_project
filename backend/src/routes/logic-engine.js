const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const NextQuestionRule = require('../models/NextQuestionRule');
const Plan = require('../models/Plan');
const verifyToken = require('../middleware/verifyToken');
const {
  findNextApplicableQuestion,
  getCircumstanceGroup,
  getNextQuestionKey,
} = require('../lib/question-navigation');

// GET /api/logic-engine/nextQuestion/:qkey/:answer - get next question from answer to current question
router.get('/nextQuestion/:qkey/:answer', async (req, res) => {
  try {
    const nextQKey = await getNextQuestionKey(req.params.qkey, req.params.answer);
    const nextQuestion = await Question.findOne({
      qKey: nextQKey,
      isArchived: { $ne: true },
    });
    return res.status(200).json(nextQuestion);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Could not resolve next question:', error);
    return res.status(500).json({ error: 'Could not resolve next question' });
  }
});

// POST /api/logic-engine/nextQuestionWithContext
router.post('/nextQuestionWithContext', verifyToken, async (req, res) => {
  try {
    const { planId, qKey, answer, startQKey } = req.body || {};
    const isStartingAtQuestion = typeof startQKey === 'string' && startQKey.length > 0;
    if (
      typeof planId !== 'string' ||
      (isStartingAtQuestion
        ? qKey !== undefined || answer !== undefined
        : typeof qKey !== 'string' || typeof answer !== 'string') ||
      (startQKey !== undefined && !isStartingAtQuestion)
    ) {
      return res.status(400).json({ error: 'A plan and valid question transition are required' });
    }

    const plan = await Plan.findOne({ _id: planId, userID: req.user.uid });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const legacyCircumstance = plan.userRole;
    const currentCircumstance = plan.currentCircumstance || (
      [
        'married',
        'married_seeking_custody',
        'married_seeking_parenting_time',
        'never_married_seeking_custody',
        'never_married_seeking_parenting_time',
      ].includes(legacyCircumstance)
        ? legacyCircumstance
        : ''
    );
    const circumstanceGroup = getCircumstanceGroup(currentCircumstance);
    if (!circumstanceGroup) {
      return res.status(409).json({ error: 'Complete your current circumstance before continuing' });
    }

    let destinationQKey = isStartingAtQuestion ? startQKey : '';
    if (!isStartingAtQuestion) {
      const currentQuestion = await Question.findOne({
        qKey,
        isArchived: { $ne: true },
      });
      if (!currentQuestion) {
        return res.status(404).json({ error: 'Current question not found or is archived' });
      }

      destinationQKey = await getNextQuestionKey(qKey, answer);
    }

    if (!destinationQKey) {
      return res.json(null);
    }

    const nextQuestion = await findNextApplicableQuestion(destinationQKey, circumstanceGroup);
    return res.json(nextQuestion);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Could not resolve next applicable question:', error);
    return res.status(500).json({ error: 'Could not resolve next question' });
  }
});

// GET /api/logic-engine/questions - Get all questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find({ isArchived: { $ne: true } });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logic-engine/question-rules - Get all next question rules
router.get('/next-question-rules', async (req, res) => {
  try {
    const rules = await NextQuestionRule.find();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logic-engine/questions/:section - Get all questions from the section specified
router.get('/questions/:section', async (req, res) => {
  try {
    const questions = await Question.find({
      section: req.params.section,
      isArchived: { $ne: true }
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logic-engine/question/:qkey - Get the questions with the specified qkey
router.get('/question/:qkey', async (req, res) => {
  try {
    const questions = await Question.findOne({
      qKey: req.params.qkey,
      isArchived: { $ne: true }
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
