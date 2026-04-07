import { useState, useEffect } from 'react';
import { Info, Shield, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import TextInput from '../components/forms/TextInput';
import DatePicker from '../components/forms/DatePicker';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';
import RadioButton from '../components/forms/RadioButton';

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
function SafetyPrivacyQuestion({ collaborationMode, onModeChange, error }) {
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

      <p className="safety-privacy-question__disclaimer">
        <AlertTriangle size={14} className="safety-privacy-question__disclaimer-icon" />
        Your address, contact information, and childcare preferences will be shared with your
        co-parent if you select the collaborative mode.
      </p>

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

// ─── GettingStarted ───────────────────────────────────────────────────────────

export default function GettingStarted() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();
  const { setOnNext, setOnBack } = useNavigation();

  const formData = state.parents ?? { name: '', secondParentName: '', errors: {} };
  const collaborationMode = state.collaborationMode ?? '';
  const caseFilingStatus = state.caseFilingStatus ?? '';
  const errors = formData.errors ?? {};

  const [collaborationModeError, setCollaborationModeError] = useState('');
  const [caseFilingError, setCaseFilingError] = useState('');

  const caseFilingFlag = useSectionFlag('caseFilingStatus');

  const [children, setChildren] = useState(() => {
    return state.children?.length > 0
      ? state.children
      : [{ id: 1, firstName: '', lastName: '', dateOfBirth: '', classification: '', errors: {} }];
  });

  useEffect(() => {
    dispatch({ type: 'UPDATE_SECTION', section: 'parents', payload: { errors: {} } });
    setCollaborationModeError('');
    setCaseFilingError('');
    setChildren(prev => prev.map(c => ({ ...c, errors: {} })));
  }, []);

  useEffect(() => {
    dispatch({ type: 'UPDATE_CHILDREN', payload: children });
  }, [children]);

  // Called by SafetyPrivacyQuestion whenever a final collaboration mode is resolved.
  // An empty string means the user is mid-flow (third option, confirmation pending)
  // and validation will catch it if they try to proceed.
  const handleCollaborationModeChange = (mode) => {
    dispatch({ type: 'UPDATE_SECTION', section: 'collaborationMode', payload: mode });
    if (mode) setCollaborationModeError('');
  };

  const handleRadioChange = (section) => (value) => {
    dispatch({ type: 'UPDATE_SECTION', section: section, payload: value });
    if (section === 'caseFilingStatus') setCaseFilingError('');
  };

  const handleFormChange = (section, field) => (value) => {
    dispatch({ type: 'UPDATE_SECTION', section: section, payload: { [field]: value } });
    if (errors[field]) {
      dispatch({ type: 'UPDATE_SECTION', section: section, payload: { errors: { ...errors, [field]: '' } } });
    }
  };

  const handleChildChange = (childId, field) => (value) => {
    setChildren(prev => prev.map(child =>
      child.id === childId
        ? { ...child, [field]: value, errors: { ...(child.errors ?? {}), [field]: '' } }
        : child
    ));
  };

  const addChild = () => {
    const newId = Math.max(...children.map(c => c.id), 0) + 1;
    setChildren(prev => [...prev, { id: newId, firstName: '', lastName: '', dateOfBirth: '', classification: '', errors: {} }]);
  };

  const removeChild = (childId) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.id !== childId));
    }
  };

  const validateForm = () => {
    let isValid = true;

    // collaborationMode must be a resolved value — '' means the user either hasn't
    // answered or is still in the confirmation sub-flow for the third option
    if (!collaborationMode) {
      setCollaborationModeError('Please select an option to continue');
      isValid = false;
    } else {
      setCollaborationModeError('');
    }

    const parentErrors = {};
    if (!formData.firstName?.trim()) { parentErrors.firstName = 'First name is required'; isValid = false; }
    if (!formData.lastName?.trim())  { parentErrors.lastName  = 'Last name is required';  isValid = false; }
    if (!formData.phone?.trim())     { parentErrors.phone     = 'Phone number is required'; isValid = false; }
    if (!formData.address?.trim())   { parentErrors.address   = 'Address is required';    isValid = false; }

    dispatch({ type: 'UPDATE_SECTION', section: 'parents', payload: { errors: parentErrors } });

    if (!caseFilingStatus) {
      setCaseFilingError('Please select an option to continue');
      isValid = false;
    } else {
      setCaseFilingError('');
    }

    const updatedChildren = children.map((child, index) => {
      const childErrors = {};
      if (!child.firstName.trim())  { childErrors.firstName      = `Child ${index + 1} first name is required`;    isValid = false; }
      if (!child.lastName.trim())   { childErrors.lastName       = `Child ${index + 1} last name is required`;     isValid = false; }
      if (!child.dateOfBirth)       { childErrors.dateOfBirth    = `Child ${index + 1} date of birth is required`; isValid = false; }
      if (!child.classification)    { childErrors.classification = `Child ${index + 1} classification is required`; isValid = false; }
      return { ...child, errors: childErrors };
    });
    setChildren(updatedChildren);

    return isValid;
  };

  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (submitAttempted) {
      const firstError = document.querySelector(
        '.text-input__error-message, .date-picker__error-message, .radio-group-error, .child-classification-error'
      );
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSubmitAttempted(false);
    }
  }, [submitAttempted]);

  const handleNext = () => {
    const valid = validateForm();
    if (valid) {
      dispatch({ type: 'UPDATE_CHILDREN', payload: children });
      navigate('/parental-rights');
    } else {
      setSubmitAttempted(true);
    }
  };

  const handleBack = () => {
    dispatch({ type: 'UPDATE_CHILDREN', payload: children });
    dispatch({ type: 'UPDATE_SECTION', section: 'parents', payload: { errors: {} } });
    navigate('/');
  };

  useEffect(() => {
    setOnNext(handleNext);
    setOnBack(handleBack);
  }, [state, children, collaborationMode, caseFilingStatus]);

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Let's start by gathering some basic information about your family and situation.
              Fields marked with <span className="required-asterisk">*</span> are required.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <hr className="section-divider" />

            <section className="safety-privacy-section">
              <SectionHeader
                iconClassName="shield-icon"
                icon={<Shield size={25} />}
                title="Safety & Privacy"
                intro="Your safety is our priority."
              />
              <Card>
                <CardContent>
                  <SafetyPrivacyQuestion
                    collaborationMode={collaborationMode}
                    onModeChange={handleCollaborationModeChange}
                    error={collaborationModeError}
                  />
                </CardContent>
              </Card>
            </section>
            <hr className="section-divider" />

            <section className="parent-information-section">
              <SectionHeader
                iconClassName="user-icon"
                icon={<UserCheck size={25} />}
                title="Your Information"
                intro="Please provide your contact details."
              />
              <Card>
                <CardContent>
                  <div className="form-row">
                    <TextInput
                      id="firstParentFirstName" type="text"
                      value={formData.firstName ?? ''}
                      onChange={handleFormChange('parents', 'firstName')}
                      error={errors.firstName}
                      placeholder="Enter your first name"
                      label="First Name" autoComplete="given-name" required
                    />
                    <TextInput
                      id="firstParentLastName" type="text"
                      value={formData.lastName ?? ''}
                      onChange={handleFormChange('parents', 'lastName')}
                      error={errors.lastName}
                      placeholder="Enter your last name"
                      label="Last Name" autoComplete="family-name" required
                    />
                  </div>
                  <TextInput
                    id="firstParentPhone" type="text"
                    value={formData.phone ?? ''}
                    onChange={handleFormChange('parents', 'phone')}
                    error={errors.phone}
                    placeholder="Enter your phone number"
                    label="Phone Number" autoComplete="tel" required
                  />
                  <TextInput
                    className="text-input-long-text"
                    id="firstParentAddress" type="text"
                    value={formData.address ?? ''}
                    onChange={handleFormChange('parents', 'address')}
                    error={errors.address}
                    placeholder="Enter your full address (this will help identify the relevant county)"
                    label="Address" autoComplete="street-address" required
                  />
                </CardContent>
              </Card>
            </section>
            <hr className="section-divider" />

            <section className="case-filing-status-section">
              <SectionHeader
                iconClassName="info-icon"
                icon={<Info size={25} />}
                title="Case Filing Status"
                intro="Help us understand your legal situation."
              />
              <RadioQuestion
                question="Did you file the divorce, separation, or child custody case that led to this parenting plan?"
                name="caseFilingStatus"
                value={caseFilingStatus}
                onChange={handleRadioChange('caseFilingStatus')}
                error={caseFilingError}
                flag={caseFilingFlag}
                options={[
                  { value: 'yes',     label: 'Yes, it was me',         description: 'You will be identified as Parent 1/Petitioner 1/Plaintiff in the parenting plan' },
                  { value: 'no',      label: 'No, my co-parent filed', description: 'You will be identified as Parent 2/Petitioner 2/Defendant in the parenting plan' },
                  { value: 'flagged', label: 'I need more information' },
                  { value: 'defer',   label: 'Defer to co-parent' },
                ]}
              />
            </section>
            <hr className="section-divider" />

            <section className="children-section">
              <SectionHeader
                iconClassName="users-icon"
                icon={<Users size={25} />}
                title="Your Children"
                intro="Please list the children you are including in this shared parenting plan."
              />
              {children.map((child, index) => (
                <Card key={child.id}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <CardTitle>{`Child ${index + 1}`}</CardTitle>
                      {children.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(child.id)}
                          className="remove-child-btn"
                          aria-label={`Remove Child ${index + 1}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <form noValidate>
                      <div className="form-row">
                        <TextInput
                          id={`child-${child.id}-firstName`}
                          label="First Name"
                          type="text"
                          value={child.firstName}
                          onChange={handleChildChange(child.id, 'firstName')}
                          required
                          placeholder="First Name"
                          autoComplete="given-name"
                          error={child.errors?.firstName ?? ''}
                        />
                        <TextInput
                          id={`child-${child.id}-lastName`}
                          label="Last Name"
                          type="text"
                          value={child.lastName}
                          onChange={handleChildChange(child.id, 'lastName')}
                          required
                          placeholder="Last Name"
                          autoComplete="family-name"
                          error={child.errors?.lastName ?? ''}
                        />
                      </div>

                      <DatePicker
                        id={`child-${child.id}-dateOfBirth`}
                        label="Date of Birth"
                        value={child.dateOfBirth}
                        onChange={handleChildChange(child.id, 'dateOfBirth')}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        error={child.errors?.dateOfBirth ?? ''}
                      />

                      <div className="child-classification">
                        <label className="classification-label">Child Classification</label>
                        <div className="radio-group">
                          <label className="radio-option">
                            <input
                              type="radio"
                              name={`child-${child.id}-classification`}
                              value="minor"
                              checked={child.classification === 'minor'}
                              onChange={(e) => handleChildChange(child.id, 'classification')(e.target.value)}
                            />
                            <span>
                              The child is a minor and/or mentally or physically disabled
                              incapable of supporting or maintaining themselves
                            </span>
                          </label>
                          <label className="radio-option">
                            <input
                              type="radio"
                              name={`child-${child.id}-classification`}
                              value="emancipated"
                              checked={child.classification === 'emancipated'}
                              onChange={(e) => handleChildChange(child.id, 'classification')(e.target.value)}
                            />
                            <span>The child is an emancipated adult</span>
                          </label>
                        </div>
                        {child.errors?.classification && (
                          <p className="child-classification-error">
                            {child.errors.classification}
                          </p>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ))}

              <button
                type="button"
                onClick={addChild}
                className="add-child-btn"
              >
                + Add Another Child
              </button>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}