
// This file defines what an Answer looks like in our database

const mongoose = require('mongoose')

const AnswerSchema = new mongoose.Schema({
    planId: { 
        // id of the plan this answer is associated with
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Plan", required: true,
        required: true
    },
    userId: { 
        // id of the user this answer was created by
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    questionId: { 
        // id of the question this answer is in response to
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Question", 
        required: true
     },
    qKey: { 
        // this is a short description of question for ease of querying (ex: "have_criminal_record", "income_level", etc.)
        // there is a matching field in the Question schema
        type: String, 
        required: true 
    }, 
    value: {
        // the user's answer to the question
        type: mongoose.Schema.Types.Mixed, // number, string, boolean, etc.
    },
    isFlagged: {
        // future proofing for potential "flagging" a question feature to come back to later
        type: Boolean,
        required: true,
        default: false
    },
    answeredAt: { 
        type: Date, 
        default: Date.now 
    },
}, { timestamps: true });

module.exports = mongoose.model('Answer', AnswerSchema);
