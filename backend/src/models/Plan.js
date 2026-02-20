const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
{
  questionID: { 
    type: String, 
    required: true 
},
  answer: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true },
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
  children: [questionSchema]
})

module.exports = mongoose.model('Plan', planSchema);