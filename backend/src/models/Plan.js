// This file defines what a Plan looks like in our database

const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    isDraft: {
        type: Boolean,
        required: true,
        default: true
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: true
    },
    childName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }, 
    parentName: {
        type: String,
        required: true
    },
    planData: {
        type: Map,
        of: String,
        required: true
    },
    documentID: {
        type: String,
    }
}, { timestamps: true});

module.exports = mongoose.model('Plan', planSchema);

