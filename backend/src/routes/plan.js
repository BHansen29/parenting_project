const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const Question = require('../models/Question');
const verifyToken = require('../middleware/verifyToken');

// POST /api/plan - Start a new plan
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userID, startQuestionId } = req.body;

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

// POST /api/plan/delete - Delete a plan with the pid specified in request body
router.post('/delete', verifyToken, async (req, res) => {
  try {
    const { userID, pID } = req.body;
    
    const deletedItem = await Plan.findByIdAndDelete({_id: pID, userID: userID});
    if (deletedItem) {
      return res.status(200).json({ message: 'Plan deleted successfully' });
    } else {
      return res.status(401).json({ message: 'Unauthorized to delete this plan or plan not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/plan/allAdmin -> Get all plans in system
router.get('/allAdmin', async (req, res) => {
  const plans = await Plan.find();
  res.json(plans)
});

// GET /api/plan/all -> Get all plans a user currently owns
router.get('/:uid', verifyToken, async (req, res) => {
  const plans = await Plan.find({userID: req.params.uid});
  res.status(200).json(plans)
});


// GET /api/plan/:planId/current -> Get the current question for a plan
router.get('/:planId/current', verifyToken, async (req, res) => {
  try {
    // Fetch the plan and replace currentQuestion ID with the full Question document
    const plan = await Plan.findById(req.params.planId).populate('currentQuestion');

    // Reject if plan doesn't exist or belongs to a different user
    if (!plan || plan.userID !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // No current question means the plan is finished
    if (!plan.currentQuestion) {
      return res.json({ done: true });
    }

    // Return the full question data for the frontend to render
    res.json({ question: plan.currentQuestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Set a plan's allowShare field
// POST/api/plan/setShareMode/:planId
router.get('/setShareMode/:planId', verifyToken, async (req, res) => {
  try {
    const planID = req.params.planId;
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planID);

    //If the planId was not found or doesn't belong to the requesting user
    if (!plan || plan.userID !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { allowShare } = req.body
    plan.allowSharing = allowShare
    plan.save()
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
