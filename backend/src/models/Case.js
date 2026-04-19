const mongoose = require('mongoose');

/*
 * A Case links two co-parents together for the purpose of comparing
 * their questionnaire responses and working toward a shared parenting plan.
 *
 * Status flow:
 *   pending_invite      → Case created, waiting for co-parent to accept invite
 *   both_complete       → Both parents have submitted their questionnaire responses
 *   comparison_ready    → Diff available; P1 resolves differences and proposes answers
 *   resolutions_pending → P1 sent proposed resolutions; P2 reviewing (accept/flag)
 *   resolutions_reviewed → P2 submitted feedback; P1 doing final pass on flagged items
 *   needs_discussion    → P1 submitted final answers; remaining diffs need mediation
 *   resolved            → All conflicts resolved
 */
const caseSchema = new mongoose.Schema(
  {
    parent1Uid: {
      type: String,
      required: true
    },
    // Null until the co-parent accepts their invite via POST /invitations/:token/accept
    parent2Uid: {
      type: String,
      default: null
    },
    parent1PlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    parent2PlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    // Stores the final resolved answers after both parents select their preferences.
    // Keys are question keys (qKey), values are the chosen answers (from either parent).
    mergedAnswers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: [
        'pending_invite',
        'both_complete',
        'comparison_ready',
        'resolutions_pending',
        'resolutions_reviewed',
        'needs_discussion',
        'resolved',
      ],
      default: 'pending_invite',
    },
  },
  {
    timestamps: true
  }
);

// Indexed separately (not compound) because queries filter by one parent at a time
caseSchema.index({ parent1Uid: 1 });
caseSchema.index({ parent2Uid: 1 });

module.exports = mongoose.model('Case', caseSchema);
