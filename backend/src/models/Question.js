// This file defines what a Question looks like in our database

const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
{
  value: { 
    type: String, 
    // required: true,
    default: ''
  },
  label: { 
    type: String,
    // required: true,
    default: '' 
  },
  description: {
    type: String,
    default: '' 
  },
});

const questionSchema = new mongoose.Schema({
  type: {
    // this specifies if question is multiple choice, integer input, checkbox, etc.
    type: String,
    enum: ["multiple choice", "integer input", "checkbox", "text input"], // this restricts our types to the strings listed (will likely grow)
    required: true
  },
  qTitle: {
    // this specifies the title that will display for the question
    type: String,
    required: true,
    default: "BLANK"
  },
  qIntro: {
    type: String,
    default: "blank"
  },
  qDisclaimer: {
    type: String,
    default: ''
  },
  qIcon: {
    type: String,
    required: true,
    enum: ["scale-icon", "user-icon", "info-icon", "users-icon", "house-icon", "car-icon"],
    default: "scale-icon"
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
    enum: [
      "getting-started", 
      "parental-rights", 
      "parenting-time-communication",
      "health-insurance-coverage",
      "custody-schedule",
      "transportation",
      "tax-exemptions",
      "review"],
    required: true
  },
  includeInComparison: {
    type: Boolean,
    default: true
  },

  // the followings field is dependant on the type of question
  // options will contain different multiple choice/checkbox options a user can select
  options: [optionSchema],
}, { timestamps: true});

module.exports = mongoose.model('Question', questionSchema);