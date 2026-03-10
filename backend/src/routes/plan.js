const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const Question = require('../models/Question');
const verifyToken = require('../middleware/verifyToken');

// POST /api/plan - Start a new plan
router.post('/', verifyToken, async (req, res) => {
  try {
    const userID = req.user.uid;
    const { startQuestionId } = req.body;

    // startQuestionId is required to know where to begin
    if (!startQuestionId) {
      return res.status(400).json({ error: 'startQuestionId is required' });
    }

    // Make sure that question actually exists
    const startQuestion = await Question.findById(startQuestionId);
    if (!startQuestion) {
      const errorMessage = { error: 'Starting question not found' };
      return res.status(400).json(errorMessage);
    }

    const plan = await Plan.create({ userID, currentQuestion: startQuestionId });
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add an answer to the plan
// POST/api/plan/:planId/answer
router.post('/:planId/answer', verifyToken, async (req, res) => {
  try {
    const planID = req.params.planId;
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planID);

    //If the planId was not found or doesn't belong to the requesting user
    if (!plan || plan.userID !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    //Store the question into the plan
    const {questionID, answer} = req.body
    plan.children.push({questionID, answer})

    //Save the plan and write back to DB
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Retrieve a plan
// GET/api/plan/:planId
router.get('/:planId', verifyToken, async (req, res) => {
  try {
    const planID = req.params.planId;
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planID);

    //If the planId was not found or doesn't belong to the requesting user
    if (!plan || plan.userID !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    //Send plan back
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
