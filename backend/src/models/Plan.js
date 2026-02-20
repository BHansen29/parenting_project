<<<<<<< HEAD
// This file defines what a Plan looks like in our database

const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    isDraft: {
        // used to determine if plan is complete/incomplete
        type: Boolean,
        required: true,
        default: true
    },
    isPrivate: {
        // used for document viewing/sharing permissions
        type: Boolean,
        required: true,
        default: true
    },
    childName: {
        // name of child document pertains to
        type: String,
        required: true
    },
    email: {
        // email of parent/guardian who is creator of plan
        type: String,
        required: true
    }, 
    parentName: {
        // name of parent/guardian who is creator of plan
        type: String,
        required: true
    },
    currentQuestion: {
        // lists the last question the user left unanswered if the plan is incomplete 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        // maybe defaults to first question in decision tree if plan hasn't been started yet?
    },
    documentID: {
        type: String,
    }
}, { timestamps: true});

module.exports = mongoose.model('Plan', planSchema);

=======
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
>>>>>>> backend
