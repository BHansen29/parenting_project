const mongoose = require('mongoose');

/*
 * Stores Parent 2's feedback on P1's proposed resolutions.
 * Created when P2 calls POST /api/v1/cases/:caseId/resolutions/review.
 * One document per case, upserted on re-submission.
 */
const reviewItemSchema = new mongoose.Schema({
  qKey: { type: String, required: true },
  // true = P2 accepts P1's proposed answer; false = P2 flags for further discussion
  accepted: { type: Boolean, required: true },
}, { _id: false });

const resolutionReviewSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, unique: true },
    reviews: [reviewItemSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResolutionReview', resolutionReviewSchema);
