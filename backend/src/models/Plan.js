const mongoose = require('mongoose');

const questionResponseSchema = new mongoose.Schema(
{
  questionID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Question",
    required: true 
},
  answer: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true },
  isFlagged: {
    // future proofing for potential "flagging" a question feature to come back to later
    type: Boolean,
    required: true,
    default: false },
  isDeferred: {
    // future proofing for potential of deferring a question feature to come back to later
    type: Boolean,
    required: true,
    default: false },
  timestamp: { type: Date, default: Date.now }
}
);

const planSchema = new mongoose.Schema(
{
  userID: { 
    type: String, 
    required: true 
},
  status: { 
    type: String, enum: ['in_progress', 'completed', 'ready_for_review'], 
    default: 'in_progress' 
},
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Question",
    required: true 
  },
  children: [questionResponseSchema]
})

module.exports = mongoose.model('Plan', planSchema);