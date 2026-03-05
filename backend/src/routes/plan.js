const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const verifyToken = require('../middleware/verifyToken');

// POST/api/plan
router.post('/', verifyToken, async (req, res) => {
  try {
    // Pull userID from the verified Firebase token — can't be faked
    const userID = req.user.uid;
    //Call Plan.create()
    const plan = await Plan.create({ userID });
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
