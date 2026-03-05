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
router.post('/:planId/answer', async (req, res) => {
  try {
    const planID = req.params.planId;
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planID);

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
router.get('/:planId', async (req, res) => {
  try {
    const planID = req.params.planId;
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planID);

    //If the planId was not found
    if (!plan) {
      res.status(400).json({ error: 'Plan not found' });
    }
    //Send plan back
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
