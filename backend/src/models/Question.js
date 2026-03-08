// This file defines what a Question looks like in our database

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    // this specifies if question is multiple choice, integer input, checkbox, etc.
    type: String,
    enum: ["multiple choice", "integer input", "checkbox"], // this restricts our types to the strings listed (will likely grow)
    required: true
  },
  qText: {
    // this is the content of the question being asked
    type: String,
    required: true
  },
  qKey: {
    // this is a short description of question for ease of querying (ex: "have_criminal_record", "income_level", etc.)
    type: String,
    required: true,
    unique: true
  },
  section: {
    // this describes the section of the tree this question falls under (ex: "health insurance coverage", "child support", etc.)
    type: String,
    enum: ["allocation_of_parental_rights_and_responsibilities", "child_support"],
    required: true
  },

  // the followings field is dependant on the type of question
  // options will contain different multiple choice/checkbox options a user can select
  options: [
    {
      label: String,
      value: mongoose.Schema.Types.Mixed
    }
  ],
}, { timestamps: true});

module.exports = mongoose.model('Question', questionSchema);