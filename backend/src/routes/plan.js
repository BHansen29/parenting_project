const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const Case = require('../models/Case');
const Question = require('../models/Question');
const verifyToken = require('../middleware/verifyToken');

// POST /api/plan - Start a new plan
// Optional body: { caseId } — when provided (co-parent accept flow), the new plan
// is linked to the existing Case rather than creating a fresh one.
router.post('/', verifyToken, async (req, res) => {
  try {
    const userID = req.user.uid;
    const { caseId } = req.body || {};

    const plan = await Plan.create({ userID });

    if (caseId) {
      // Co-parent joining an existing case: attach this plan as parent2's plan.
      try {
        const existingCase = await Case.findById(caseId);
        if (existingCase) {
          // Guard: prevent a third party from overwriting an already-joined co-parent.
          if (existingCase.parent2Uid) {
            return res.status(409).json({ error: 'A co-parent has already joined this case' });
          }
          existingCase.parent2Uid = userID;
          existingCase.parent2PlanId = plan._id;
          await existingCase.save();
          plan.caseId = existingCase._id;
          await plan.save();
        }
      } catch (caseErr) {
        console.error('Failed to link plan to existing Case:', caseErr.message);
      }
    } else {
      // Primary parent starting a new plan: auto-create a fresh Case.
      try {
        const newCase = await Case.create({ parent1Uid: userID, parent1PlanId: plan._id });
        plan.caseId = newCase._id;
        await plan.save();
      } catch (caseErr) {
        console.error('Failed to auto-create Case for plan:', caseErr.message);
      }
    }

    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/plan/delete - Delete a plan with the pid specified in request body
router.post('/delete', verifyToken, async (req, res) => {
  try {
    const { userID, pID } = req.body;
    
    const deletedItem = await Plan.findOneAndDelete({_id: pID, userID: userID});
    if (deletedItem) {
      return res.status(200).json({ message: 'Plan deleted successfully' });
    } else {
      return res.status(401).json({ message: 'Unauthorized to delete this plan or plan not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/plan/:uid/all -> Get all plans a user currently owns
router.get('/:uid/all', verifyToken, async (req, res) => {
  try {
    const plans = await Plan.find({userID: req.params.uid});
    res.status(200).json(plans)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
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

// POST /api/plan/updateCurrent/:planId/:currQId - Update a plan's currentQuestion field to be currQId
router.post('/updateCurrent/:planId/:currQId', verifyToken, async (req, res) => {
  try {
    const { planId, currQId } = req.params;
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found'})
    }
    if (plan.userID !== req.user.uid) {
      return res.status(401).json({ message: 'Unauthorized to update this plan' }); 
    }
    plan.currentQuestion = currQId;
    await plan.save()
    return res.status(200).json({ message: 'Plan updated successfully' });
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

    const {qKey, answer} = req.body
    const index = plan.answers.findIndex(userAnswer => userAnswer.qKey === qKey)
    const oldAnswer = plan.answers[index]?.answer
    if (!oldAnswer) {
      // case for first question answered in plan
      plan.answers.push({qKey: qKey, answer: answer})
    } else if (oldAnswer.answer !== answer) {
      // case for changing exsisting response
      plan.answers[index] = {qKey: qKey, answer: answer}
      // this chops off everything after the new answer since our "path" through the decision tree may be different
      // TODO: maybe update so that it only chops off questions if they aren't defaultNextQuestions?
      plan.answers.splice(index + 1)
    } else {
      // no change to question required since answer matches
      return res.status(200).json(plan)
    }

    //Save the plan and write back to DB
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add children to the plan
// POST/api/plan/:planId/children
router.post('/:planId/children', verifyToken, async (req, res) => {
  try {
    const planID = req.params.planId;
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planID);

    //If the planId was not found or doesn't belong to the requesting user
    if (!plan || plan.userID !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { planChildren } = req.body
    plan.children = planChildren
    //Save the plan and write back to DB
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update phone and address to the plan
// POST/api/plan/:planId/contact
router.post('/:planId/contact', verifyToken, async (req, res) => {
  try {
    const planID = req.params.planId;
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planID);

    //If the planId was not found or doesn't belong to the requesting user
    if (!plan || plan.userID !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { phone, address } = req.body
    plan.phoneNumber = phone
    plan.address = address
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
router.post('/setShareMode/:planId', verifyToken, async (req, res) => {
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
    await plan.save()
    res.status(201).json(plan)
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
