const mongoose = require('mongoose');

const questionnaireVersionSchema = new mongoose.Schema({
  actorUid: { type: String, required: true },
  action: { type: String, required: true },
  questions: { type: [mongoose.Schema.Types.Mixed], required: true },
  rules: { type: [mongoose.Schema.Types.Mixed], required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

questionnaireVersionSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model('QuestionnaireVersion', questionnaireVersionSchema);
