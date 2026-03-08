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

//TODO: remove this as this is just to help me

router.get('/seed', async (req, res) => {
  console.log('seeding')
  const newQ = new Question({
    type: "multiple choice",
    qText: "The next few questions ask about who your children with live with and who will make the legal decisions for them. Will your answers apply to all of your children that you share with your co-parent?",
    qKey: "apply_to_all",
    section: "allocation_of_parental_rights_and_responsibilities"
  });
  newQ.options = []
  newQ.options.push("Yes")
  newQ.options.push("No")
  newQ.options.push("I need more information")
  newQ.options.push("Default to my co-parent's choice")

  const saveRez = await newQ.save()
  console.log("saving: " + saveRez)

  const newR = new NextQuestionRule({
    qKey: "apply_to_all",
    isDefault: true,
    goToDefault: "want_live_with_you"
  });
  const saveR = await newR.save()
  console.log("saving: " + saveR)
  res.status(200).send()
});

router.get('/delete', async (req, res) => {
  console.log('deleting')
  try {
      const deleteRez = await Question.deleteOne({_id: "69add5f6eb61f535ea5c7026"})
      console.log("deleting: " + deleteRez)
  } catch (error) {
    res.status(404).json({error: error.message})
  }
  res.status(200).send()
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

module.exports = router;
