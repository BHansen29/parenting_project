import { useState, useEffect } from 'react';
import { AlertCircle, Info, Shield, Users, MapPin, Phone, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import TextInput from '../components/forms/TextInput';
import DatePicker from '../components/forms/DatePicker';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import './Page.css';
import FlagButton from '../components/forms/FlagButton';
import RadioButton from '../components/forms/RadioButton';
import ToolTip from '../components/common/ToolTip';

/**
 * "Getting Started" page component for the parenting plan application.
 * This page collects basic information about the parents, their safety concerns, case filing status, and their children.
 * It uses local state for managing the list of children and global context for other form data.
 * The page includes validation logic to ensure all required fields are filled out before proceeding to the next step.
 */
export default function GettingStarted() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  // Parents stay in global context
  const formData = state.parents ?? { name: '', secondParentName: '', errors: {} };
  const safetyConcern = state.safetyConcern ?? '';
  const caseFilingStatus = state.caseFilingStatus ?? '';
  const errors = formData.errors ?? {};

  // Section-specific flag states
  const caseFilingFlag = useSectionFlag('caseFilingStatus');
  const childrenFlag = useSectionFlag('children'); 

  // Children use local state
  const [children, setChildren] = useState(() => {
    return state.children?.length > 0
      ? state.children
      : [{ id: 1, firstName: '', lastName: '', dateOfBirth: '', classification: '', errors: {} }];
  });

  // Syncs children to global context whenever local state changes
  useEffect(() => {
    dispatch({ type: 'UPDATE_CHILDREN', payload: children });
  }, [children]);

  const handleRadioChange = (section) => (e) => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: section,
      payload: e.target.value
    });
  };

  const handleFormChange = (section, field) => (value) => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: section,
      payload: { [field]: value }
    });
    if (errors[field]) {
      dispatch({
        type: 'UPDATE_SECTION',
        section: section,
        payload: { errors: { ...errors, [field]: '' } }
      });
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
    setChildren(prev => [...prev, {
      id: newId,
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      classification: '',
      errors: {}
    }]);
  };

  const removeChild = (childId) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.id !== childId));
    }
  };

  const validateForm = () => {
    const parentErrors = {};
    if (!formData.firstName?.trim()) parentErrors.firstName = 'Parent 1 first name is required';
    if (!formData.lastName?.trim()) parentErrors.lastName = 'Parent 1 last name is required';
    if (!formData.secondParentFirstName?.trim()) parentErrors.secondParentFirstName = 'Parent 2 first name is required';
    if (!formData.secondParentLastName?.trim()) parentErrors.secondParentLastName = 'Parent 2 last name is required';

    let childrenValid = true;
    const updatedChildren = children.map((child, index) => {
      const childErrors = {};
      if (!child.firstName.trim()) {
        childErrors.firstName = `Child ${index + 1} first name is required`;
        childrenValid = false;
      }
      if (!child.lastName.trim()) {
        childErrors.lastName = `Child ${index + 1} last name is required`;
        childrenValid = false;
      }
      if (!child.dateOfBirth) {
        childErrors.dateOfBirth = `Child ${index + 1} date of birth is required`;
        childrenValid = false;
      }
      if (!child.classification) {
        childErrors.classification = `Child ${index + 1} classification is required`;
        childrenValid = false;
      } 
      return { ...child, errors: childErrors };
    });

    setChildren(updatedChildren);

    dispatch({
      type: 'UPDATE_SECTION',
      section: 'parents',
      payload: { errors: parentErrors }
    });

    return Object.keys(parentErrors).length === 0 && childrenValid;
  };

  // Tracks when a failed submission happens - controls when to show validation errors
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Runs after React re-renders with new errors
  useEffect(() => {
    if (submitAttempted) {
      const firstError = document.querySelector(
        '.text-input__error-message, .date-picker__error-message'
      );
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setSubmitAttempted(false);
    }
  }, [children, submitAttempted]);

  const handleNext = () => {
    if (validateForm()) {
      // Save children to global context before navigating
      dispatch({ type: 'UPDATE_CHILDREN', payload: children });
      navigate('/parental-rights');
    } else {
      setSubmitAttempted(true);
    }
  };

  const handleBack = () => {
    dispatch({ type: 'UPDATE_CHILDREN', payload: children });
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'parents',
      payload: { errors: {} }
    });
    navigate('/landing-page');
  };

  

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <div  className="card-header-with-tooltip">
              <CardTitle>Getting Started</CardTitle>
              <ToolTip content="Additional information about this question to help you answer it correctly.
               This is just an example of how to use the tooltip."/>
            </div>
            <CardDescription>
              Let's start by gathering some basic information about your family and situation.</CardDescription>
          </CardHeader>

          <CardContent>
            <hr className="section-divider" />
            <section className="safety-privacy-section">
              <div className="section-header">
                <div className="shield-icon">
                  <Shield size={25} />
                </div>
                <div className="section-title-group">
                  <h2 className="section-title">Safety & Privacy</h2>
                  <p className="section-intro">Your safety is our priority.</p>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardDescription className={"card-heading-question-bold"}>Would sharing information from this questionnaire with your co-parent make you fear for your safety in any way?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="radio-group">
                    <RadioButton
                      name="safetyConcern"
                      value="yes"
                      checked={safetyConcern === 'yes'}
                      onChange={handleRadioChange('safetyConcern')}
                      label="Yes, please keep my information private"
                      description="You and your co-parent will fill out the form separately"
                    />
                    <RadioButton
                      name="safetyConcern"
                      value="no"
                      checked={safetyConcern === 'no'}
                      onChange={handleRadioChange('safetyConcern')}
                      label="No, I wish to collaborate with my co-parent"
                      description="Your answers will be shared with your co-parent"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
            <hr className="section-divider" />

             <section className="parent-information-section">
              <div className="section-header">
                <div className="user-icon">
                  <UserCheck size={25} />
                </div>
                <div className="section-title-group">
                  <h2 className="section-title">Your Information</h2>
                  <p className="section-intro">Please provide your contact details.</p>
                </div>
              </div>
              <Card>
                <CardContent>
                  <div className="form-row">
                    <TextInput
                      id="firstParentFirstName"
                      type="text"
                      value={formData.firstName ?? ''}
                      onChange={handleFormChange('parents', 'firstName')}
                      error={submitAttempted ? errors.firstName : ''}
                      placeholder="Enter your first name"
                      label="First Name"
                      autoComplete="given-name"
                      required
                    />
                    <TextInput
                      id="firstParentLastName"
                      type="text"
                      value={formData.lastName ?? ''}
                      onChange={handleFormChange('parents', 'lastName')}
                      error={submitAttempted ? errors.lastName : ''}
                      placeholder="Enter your last name"
                      label="Last Name"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                  <TextInput
                      id="firstParentPhone"
                      type="text"
                      value={formData.phone ?? ''}
                      onChange={handleFormChange('parents', 'phone')}
                      error={submitAttempted ? errors.phone : ''}
                      placeholder="Enter your phone number"
                      label="Phone Number"
                      autoComplete="tel"
                      required
                  />
                  <TextInput className="text-input-long-text"
                      id="firstParentAddress"
                      type="text"
                      value={formData.address ?? ''}
                      onChange={handleFormChange('parents', 'address')}
                      error={submitAttempted ? errors.address : ''}
                      placeholder="Enter your full address (this will help identify the relevant county)"
                      label="Address"
                      autoComplete="street-address"
                      required
                  />
                </CardContent>
              </Card>
            </section>
            <hr className="section-divider" />

            <section className="case-filing-status-section">
              <div className="section-header">
                <div className="info-icon">
                  <Info size={25} />
                </div>
                <div className="section-title-group">
                  <h2 className="section-title">Case Filing Status</h2>
                  <p className="section-intro">Help us understand your legal situation.</p>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <div className="card-header-with-flag">
                    <CardDescription className={"card-heading-question-bold"}>Did you file the divorce, separation, or child custody case that led to this parenting plan?</CardDescription>
                    <FlagButton
                      isFlagged={caseFilingFlag.isFlagged}
                      onClick={caseFilingFlag.toggleFlag}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="radio-group">
                    <RadioButton
                      name="caseFilingStatus"
                      value="yes"
                      checked={caseFilingStatus === 'yes'}
                      onChange={handleRadioChange('caseFilingStatus')}
                      label="Yes, it was me"
                      description="You will be identified as Parent 1/Petitioner 1/Plaintiff in the parenting plan"
                    />
                    <RadioButton
                      name="caseFilingStatus"
                      value="no"
                      checked={caseFilingStatus === 'no'}
                      onChange={handleRadioChange('caseFilingStatus')}
                      label="No, my co-parent filed"
                      description="You will be identified as Parent 2/Petitioner 2/Defendant in the parenting plan"
                    />
                    <RadioButton
                      name="caseFilingStatus"
                      value="flagged"
                      checked={caseFilingStatus === 'flagged'}
                      onChange={handleRadioChange('caseFilingStatus')}
                      label="I need more information"
                    />
                    <RadioButton
                      name="caseFilingStatus"
                      value="defer"
                      checked={caseFilingStatus === 'defer'}
                      onChange={handleRadioChange('caseFilingStatus')}
                      label="Defer to co-parent"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
            <hr className="section-divider" />

            <section className="children-section">
              <div className="section-header">
                <div className="users-icon">
                  <Users size={25} />
                </div>
                <div className="section-title-group">
                  <h2 className="section-title">Your Children</h2>
                  <p className="section-intro">Please list the children you are including in this shared parenting plan.</p>
                </div>
              </div>
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