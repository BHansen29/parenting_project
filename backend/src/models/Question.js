// This file defines what a Question looks like in our database

const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
  operator: {
    type: String,
    enum: ["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin", "exists"],
    required: true,
  },
  value: mongoose.Schema.Types.Mixed, // number, string, boolean, array, etc.
});

const nextRuleSchema = new mongoose.Schema({
  condition: {
    type: conditionSchema
  },
  // if a user response evaluates to true using the condition, we go to the question specified
  goTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Question"
  }
});

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
    enum: ["health insurance coverage", "child support"],
    required: true
  }, 
  nextQuestions: {
    // this allows for branching depending on the user's answer to the current question
    type: [nextRuleSchema],
    required: true
  },
  isDefault: {
    // true if there is a default next question no matter the answer
    type: Boolean,
    required: true,
    default: true
  },

  // the followings fields are dependant on the type of question
  // options will contain different multiple choice/checkbox options a user can select
  options: [
    {
      label: String,
      value: mongoose.Schema.Types.Mixed
    }
  ],
  // additional text a question might need (explanation, disclaimer, etc.)
  qBodyText: {
    type: String
  }
}, { timestamps: true});

module.exports = mongoose.model('Question', questionSchema);