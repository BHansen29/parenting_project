import { useState, useEffect } from 'react';
import { Info, Shield, Users, UserCheck } from 'lucide-react';
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

/**
 * "Getting Started" page component for the parenting plan application.
 * This page collects basic information about the parents, their safety concerns, case filing status, and their children.
 * It uses local state for managing the list of children and global context for other form data.
 * The page includes validation logic to ensure all required fields are filled out before proceeding to the next step.
 */
export default function GettingStarted() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();
  const { setOnNext, setOnBack } = useNavigation();

  const formData = state.parents ?? { name: '', secondParentName: '', errors: {} };
  const safetyConcern = state.safetyConcern ?? '';
  const caseFilingStatus = state.caseFilingStatus ?? '';
  const errors = formData.errors ?? {};

  // Separate error states for radio groups (not stored in formData.errors)
  const [safetyConcernError, setSafetyConcernError] = useState('');
  const [caseFilingError, setCaseFilingError] = useState('');

  const caseFilingFlag = useSectionFlag('caseFilingStatus');
  const childrenFlag = useSectionFlag('children');

  const [children, setChildren] = useState(() => {
    return state.children?.length > 0
      ? state.children
      : [{ id: 1, firstName: '', lastName: '', dateOfBirth: '', classification: '', errors: {} }];
  });

  // ── Clear all errors on mount (e.g. user navigated away and came back) ──
  useEffect(() => {
    dispatch({ type: 'UPDATE_SECTION', section: 'parents', payload: { errors: {} } });
    setSafetyConcernError('');
    setCaseFilingError('');
    setChildren(prev => prev.map(c => ({ ...c, errors: {} })));
  }, []);

  useEffect(() => {
    dispatch({ type: 'UPDATE_CHILDREN', payload: children });
  }, [children]);

  const handleRadioChange = (section) => (value) => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: section,
      payload: value
    });
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

    // --- Safety & Privacy (radio) ---
    if (!safetyConcern) {
      setSafetyConcernError('Please select an option to continue');
      isValid = false;
    } else {
      setSafetyConcernError('');
    }

    // --- Parent fields ---
    const parentErrors = {};
    if (!formData.firstName?.trim()) { parentErrors.firstName = 'First name is required'; isValid = false; }
    if (!formData.lastName?.trim())  { parentErrors.lastName  = 'Last name is required';  isValid = false; }
    if (!formData.phone?.trim())     { parentErrors.phone     = 'Phone number is required'; isValid = false; }
    if (!formData.address?.trim())   { parentErrors.address   = 'Address is required';    isValid = false; }

    dispatch({ type: 'UPDATE_SECTION', section: 'parents', payload: { errors: parentErrors } });

    // --- Case Filing Status (radio) ---
    if (!caseFilingStatus) {
      setCaseFilingError('Please select an option to continue');
      isValid = false;
    } else {
      setCaseFilingError('');
    }

    // --- Children ---
    const updatedChildren = children.map((child, index) => {
      const childErrors = {};
      if (!child.firstName.trim())  { childErrors.firstName    = `Child ${index + 1} first name is required`;    isValid = false; }
      if (!child.lastName.trim())   { childErrors.lastName     = `Child ${index + 1} last name is required`;     isValid = false; }
      if (!child.dateOfBirth)       { childErrors.dateOfBirth  = `Child ${index + 1} date of birth is required`; isValid = false; }
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
  }, [children, submitAttempted]);

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
  }, [state, children, safetyConcern, caseFilingStatus]);

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

            {/* ── Safety & Privacy ── */}
            <section className="safety-privacy-section">
              <SectionHeader
                iconClassName="shield-icon"
                icon={<Shield size={25} />}
                title="Safety & Privacy"
                intro="Your safety is our priority."
              />
              <RadioQuestion
                question="Would sharing information from this questionnaire with your co-parent make you fear for your safety in any way?"
                name="safetyConcern"
                value={safetyConcern}
                onChange={handleRadioChange('safetyConcern')}
                options={[
                  { value: 'yes', label: 'Yes, please keep my information private', description: 'You and your co-parent will fill out the form separately' },
                  { value: 'no',  label: 'No, I wish to collaborate with my co-parent', description: 'Your answers will be shared with your co-parent' },
                ]}
              />
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

            {/* ── Case Filing Status ── */}
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

            {/* ── Children ── */}
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
                            error={submitAttempted ? child.errors?.firstName : ''}
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
                            error={submitAttempted ? child.errors?.lastName : ''}
                          />
                        </div>

                        <DatePicker
                          id={`child-${child.id}-dateOfBirth`}
                          label="Date of Birth"
                          value={child.dateOfBirth}
                          onChange={handleChildChange(child.id, 'dateOfBirth')}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          error={submitAttempted ? child.errors?.dateOfBirth : ''}
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