const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const NextQuestionRule = require('../models/NextQuestionRule');
const questionLogicHandler = require('../lib/question-logic-handler.js')

// GET /api/nextQuestion/:qkey/:answer - get next question from answer to current question
router.get('/nextQuestion/:qkey/:answer', async (req, res) => {
  const userAnswer = req.params.answer
  const qKey = req.params.qkey
  const nextQRules = await NextQuestionRule.findOne({qKey: qKey})

  const next = nextQRules.isDefault 
    ? nextQRules.goToDefault 
    : nextQRules.nextQuestions.find(rule => questionLogicHandler.evaluate(userAnswer, rule.operator, rule.value)).goTo
  try {
    const nextQ = await Question.find({qKey: next})
    console.log("Returning next question of id: " + next)
    res.status(200).json(nextQ)
  } catch(err) {
    console.error("Failed to find next question of id: " + next)
    res.status(400).json({ error: err.message})
  }
});

// GET /api/questions - Get all questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/question-rules - Get all next question rules
router.get('/next-question-rules', async (req, res) => {
  try {
    const rules = await NextQuestionRule.find();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/questions/:section - Get all questions from the section specified
router.get('/questions/:section', async (req, res) => {
  try {
    const questions = await Question.find({section: req.params.section});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/question/:qKey - Get the questions with the specified qKey
router.get('/question/:qKey', async (req, res) => {
  try {
    const questions = await Question.findOne({qKey: req.params.qKey.toString()});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
