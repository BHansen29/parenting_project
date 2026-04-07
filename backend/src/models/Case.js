const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    parent1Uid: { 
      type: String, 
      required: true 
    },
    parent2Uid: { 
      type: String, 
      required: true 
    },
    status: {
      type: String,
      enum: ['pending_invite', 'both_complete', 'comparison_ready', 'resolved'],
      default: 'pending_invite',
    },
  },
  { 
    timestamps: true 
  }
);

caseSchema.index({ parent1Uid: 1 });
caseSchema.index({ parent2Uid: 1 });

module.exports = mongoose.model('Case', caseSchema);
