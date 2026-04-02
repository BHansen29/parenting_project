const mongoose = require('mongoose');

const questionnaireResponseSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    parentUid: { type: String, required: true },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isComplete: { 
      type: Boolean, default: false 
    },
    submittedAt: { 
      type: Date 
    },
  },
  { timestamps: true }
);

//One response document per parent per case
questionnaireResponseSchema.index({ caseId: 1, parentUid: 1 }, { unique: true });

module.exports = mongoose.model('QuestionnaireResponse', questionnaireResponseSchema);
