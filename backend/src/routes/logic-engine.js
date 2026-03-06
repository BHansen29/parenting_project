const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const NextQuestionRule = require('../models/NextQuestionRule');
const questionLogicHandler = require('../lib/question-logic-handler.js')

// GET /api/nextQuestion/:qkey/:answer - get next question from answer to current question
router.post('/nextQuestion/:qkey/:answer', async (req, res) => {
  const userAnswer = req.params.answer
  const qKey = req.params.qkey
  const next = null;
  const nextQRules = await NextQuestionRule.find({qKey: qKey})
  if (nextQRules.isDefault) {
    next = nextQRules.goToDefault
  } else {
    for (const rule of nextQRules.nextQuestions) {
      const op = rule.operator
      const value = rule.value
      if (questionLogicHandler.evaluate(userAnswer, op, value)) {
        next = rule.goTo
        break;
      }
    }
  }
  try {
    const nextQ = await Question.findById(next)
    console.log("Returning next question of id: " + next)
    res.status(200).json(nextQ)
  } catch(err) {
    console.error("Failed to find next question of id: " + next)
    res.status(400).json({ error: err.message})
  }
});

// GET /api/questions - Get all users
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
