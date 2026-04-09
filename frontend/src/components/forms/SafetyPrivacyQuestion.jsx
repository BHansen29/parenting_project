import { useState } from 'react';
import RadioButton from './RadioButton';
import Disclaimer from './Disclaimer';

// ─── SafetyPrivacyQuestion ────────────────────────────────────────────────────
//
// There are three options for the collaborativeMode values: 
//   'locked-individual'  (safety concern; no sharing at all)
//   'collaborative'      (will allow sharing) 
//   'individual'         (no safety concern but chose not to share)
//
// If a user selects to work individually without a safety concern, confirm this choice by asking them to reconsider

export default function SafetyPrivacyQuestion({ collaborationMode, onModeChange, error }) {
  // maps selected radio options to collab mode state
  const rawFromMode = (mode) => {
    if (mode === 'locked-individual') return 'yes';
    if (mode === 'collaborative')     return 'collaborative';
    if (mode === 'individual')        return 'no-private';
    return '';
  };

  const [rawSelection, setRawSelection] = useState(rawFromMode(collaborationMode)); // saves selection locally at first to allow confirmation  before writing to global state
  const [showConfirmation, setShowConfirmation] = useState(false); //tracks when confirmation is shown 
  const [showWarning, setShowWarning] = useState(false); //tracks when warning is shown for safety concern option

  //called whenever answer selection changes
  const handleRawChange = (value) => {
    setRawSelection(value);
    setShowConfirmation(false); // always reset confirmation when selection changes

    if (value === 'yes') {
      // Safety concern — lock to individual immediately, no confirmation needed
      onModeChange('locked-individual'); //updates global state
      setShowWarning(true); //show the safety warning 
    } else if (value === 'collaborative') {
      onModeChange('collaborative');
    } else if (value === 'no-private') {
      // wait for confirmation before updating global state
      onModeChange('');
      setShowConfirmation(true); //show the confirmation now
    }
  };

  //called if user confirms they want to keep information private (after selecting 'no-private' option)
  const handleConfirmPrivate = () => {
    // User is sure they don't want to collaborate
    setShowConfirmation(false); //dismiss confirmation
    onModeChange('individual'); //updates global state
  };

  //called if user declines the confirmation and decides to collaborate instead
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

      {/* Show safety warning if user selects the safety concern option */}
      {rawSelection === 'yes' && (
        <Disclaimer variant="warning">
          If you are in an unsafe relationship with your child's shared parent, this type of agreed plan may not be the best option. Please seek legal help or contact a local nonprofit for safety planning. For more information, please visit the <a href="https://www.supremecourt.ohio.gov" target="_blank" rel="noopener noreferrer">Supreme Court of Ohio website</a> or the <a href="https://www.supremecourt.ohio.gov/docs/JCS/domesticViolence/publications/DVAllocationParentalRights.pdf" target="_blank" rel="noopener noreferrer">Supreme Court of Ohio's Guide on Domestic Violence & Allocation of Parental Rights and Responsibilities</a>.
        </Disclaimer>
      )}


      {/* Confirmation sub-flow — only visible when third option is selected */}
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