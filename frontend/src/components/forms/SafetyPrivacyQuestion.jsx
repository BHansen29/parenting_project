import { useState } from 'react';
import RadioButton from './RadioButton';
import Disclaimer from './Disclaimer';

// ─── SafetyPrivacyQuestion ────────────────────────────────────────────────────
//
// Handles the merged safety + collaboration question as a single self-contained unit.
//
// The three raw radio options map to collaborationMode values in FormContext:
//   'yes'          → 'locked-individual'  (safety concern; no sharing at all)
//   'collaborative'→ 'collaborative'      (happy to share)
//   'no-private'   → 'individual'         (no safety concern but chose not to share)
//
// The 'no-private' option triggers an inline confirmation sub-flow before
// committing to FormContext, encouraging the user to reconsider collaborating.
// The raw selection is kept in local state so the confirmation panel can be shown
// without persisting a half-decided value to FormContext.
//
// Props:
//   collaborationMode — current value from FormContext (used to restore selection on back-nav)
//   onModeChange      — callback to write the resolved collaborationMode to FormContext
//   error             — validation error string shown below the radio group

export default function SafetyPrivacyQuestion({ collaborationMode, onModeChange, error }) {
  // Derive the initial raw selection from the persisted collaborationMode so
  // the correct radio is checked when the user navigates back to this page.
  const rawFromMode = (mode) => {
    if (mode === 'locked-individual') return 'yes';
    if (mode === 'collaborative')     return 'collaborative';
    if (mode === 'individual')        return 'no-private';
    return '';
  };

  const [rawSelection, setRawSelection] = useState(rawFromMode(collaborationMode));
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRawChange = (value) => {
    setRawSelection(value);
    setShowConfirmation(false); // always reset confirmation when selection changes

    if (value === 'yes') {
      // Safety concern — lock to individual immediately, no confirmation needed
      onModeChange('locked-individual');
    } else if (value === 'collaborative') {
      onModeChange('collaborative');
    } else if (value === 'no-private') {
      // Don't write to FormContext yet — wait for user to confirm via sub-flow
      onModeChange('');
      setShowConfirmation(true);
    }
  };

  const handleConfirmPrivate = () => {
    // User is sure they don't want to collaborate
    setShowConfirmation(false);
    onModeChange('individual');
  };

  const handleDeclinePrivate = () => {
    // User changed their mind — switch to collaborative
    setShowConfirmation(false);
    setRawSelection('collaborative');
    onModeChange('collaborative');
  };

  return (
    <div className="safety-privacy-question">
      <p className="card-heading-question-bold">
        Would sharing information from this questionnaire with your co-parent make you fear
        for your safety in any way?
      </p>

      <Disclaimer variant="info">
        Your address, contact information, and childcare preferences will be shared with your
        co-parent if you select the collaborative mode.
      </Disclaimer>

      <div className="radio-group">
        <RadioButton
          name="safetyConcern"
          value="yes"
          checked={rawSelection === 'yes'}
          onChange={() => handleRawChange('yes')}
          label="Yes, please keep my information private"
          description="You will fill out the form individually. Your answers will not be shared with your co-parent."
        />

        <RadioButton
          name="safetyConcern"
          value="collaborative"
          checked={rawSelection === 'collaborative'}
          onChange={() => handleRawChange('collaborative')}
          label="No, I wish to collaborate with my co-parent"
          description="Your answers will be shared with your co-parent to help you reach an agreement."
        />

        <RadioButton
          name="safetyConcern"
          value="no-private"
          checked={rawSelection === 'no-private'}
          onChange={() => handleRawChange('no-private')}
          label="No, but I don't want to share my information with my co-parent for other reasons"
          description=""
        />
      </div>

      {/* Inline confirmation sub-flow — only visible when third option is selected */}
      {showConfirmation && (
        <div className="safety-privacy-question__confirmation">
          <p className="safety-privacy-question__confirmation-text">
            <strong>Are you sure you don't want to collaborate?</strong> Collaborating with
            your co-parent helps you create a more complete plan to be filed with the court.
          </p>
          <div className="safety-privacy-question__confirmation-actions">
            <button
              type="button"
              className="safety-privacy-question__confirm-btn"
              onClick={handleConfirmPrivate}
            >
              Yes, I'm sure — keep my information private
            </button>
            <button
              type="button"
              className="safety-privacy-question__decline-btn"
              onClick={handleDeclinePrivate}
            >
              No, I will collaborate
            </button>
          </div>
        </div>
      )}

      {error && <p className="radio-group-error">{error}</p>}
    </div>
  );
}