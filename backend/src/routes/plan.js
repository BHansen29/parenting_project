const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const Case = require('../models/Case');
const Question = require('../models/Question');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const { getFirstName } = require('../utils/nameUtils');

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
          // Guard: only block if a DIFFERENT user is trying to join.
          // Parent 2 may call this right after accepting the invite, at which point
          // parent2Uid is already set to their own UID — that's valid and should be allowed.
          if (existingCase.parent2Uid && existingCase.parent2Uid !== userID) {
            return res.status(409).json({ error: 'A co-parent has already joined this case' });
          }
          existingCase.parent2Uid = userID;
          existingCase.parent2PlanId = plan._id;
          await existingCase.save();
          const [p1User, p1Plan] = await Promise.all([
            User.findOne({ firebaseUid: existingCase.parent1Uid }, 'name email'),
            Plan.findById(existingCase.parent1PlanId),
          ]);
          plan.name = `Shared Plan with ${getFirstName(p1User)}`;
          plan.caseId = existingCase._id;
          plan.isShared = true;
          plan.children = p1Plan?.children ?? [];
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/plan/delete - Delete a plan with the pid specified in request body
router.post('/delete', verifyToken, async (req, res) => {
  try {
    const { pID } = req.body;
    const deletedItem = await Plan.findOneAndDelete({ _id: pID, userID: req.user.uid });
    if (deletedItem) {
      return res.status(200).json({ message: 'Plan deleted successfully' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/plan/:uid/all -> Get all plans a user currently owns
router.get('/:uid/all', verifyToken, async (req, res) => {
  if (req.params.uid !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });
  try {
    const plans = await Plan.find({ userID: req.user.uid });
    res.status(200).json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    } else if (oldAnswer !== answer) {
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/plan/prevQuestion/:qkey - get prev question answered before current question
// returns "none" if there is no previous question
router.get('/prevQuestion/:qkey/:planId', verifyToken, async (req, res) => {
  const qKey = req.params.qkey
  const planId = req.params.planId

  try {
    //Retrieve plan and fetch from Mongo
    const plan = await Plan.findById(planId);

    //If the planId was not found or doesn't belong to the requesting user
    if (!plan || plan.userID !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    let index = plan.answers.findIndex(userAnswer => userAnswer.qKey === qKey)
    if (index < 0) {
      // if index < 0, that means we are on a question we haven't answered yet, thus prev question will be most recent one answered
      index = plan.answers.length
    }
    const prevQKey = (index - 1) >= 0 ? plan.answers[index - 1].qKey : 'none'
    const prevQuestion = await Question.findOne({qKey: prevQKey})
    return res.status(200).json(prevQuestion)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/plan/:planId/name — rename a plan
router.patch('/:planId/name', verifyToken, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan || plan.userID !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    plan.name = name.trim();
    await plan.save();
    res.json({ name: plan.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
