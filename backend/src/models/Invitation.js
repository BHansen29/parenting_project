const mongoose = require('mongoose');

/*
 * An Invitation represents a one-time link sent from Parent 1 to their co-parent.
 * The token is embedded in the invite URL and redeemed via POST /invitations/:token/accept.
 *
 * Expiry is tracked via expiresAt (not a status field) so it works passively —
 * no background job is needed to mark invitations as expired.
 */
const invitationSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
    },
    // Cryptographically random UUID generated via crypto.randomUUID().
    // unique: true automatically creates an index, so no separate index is needed.
    token: {
      type: String,
      unique: true,
      required: true,
    },
    // 'expired' is intentionally omitted — expiry is checked against expiresAt at runtime
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

invitationSchema.index({ caseId: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
