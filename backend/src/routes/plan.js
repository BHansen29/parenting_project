const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');

// POST/api/plan
router.post('/', async (req, res) => {
  try {
    //Extract userId from the request
    const userID = req.body.userID;
    //Call Plan.create()
    const plan = await Plan.create({ userID });
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
