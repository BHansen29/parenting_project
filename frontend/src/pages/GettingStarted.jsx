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
import Disclaimer from '../components/forms/Disclaimer';
import SafetyPrivacyQuestion from '../components/forms/SafetyPrivacyQuestion';

export default function GettingStarted() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm(); //state reads data, dispatch writes data
  const { setOnNext, setOnBack } = useNavigation();

  // Parents stay in global context
  const formData = state.parents ?? { name: '', secondParentName: '', errors: {} };
  const collaborationMode = state.collaborationMode ?? ''; //allowSharing changed to collabMode to allow for more values (individual, collaborative, locked-individual)
  const caseFilingStatus = state.caseFilingStatus ?? '';
  const errors = formData.errors ?? {};

  //these errors use the local useState
  const [collaborationModeError, setCollaborationModeError] = useState(''); //changed to collab mode error
  const [caseFilingError, setCaseFilingError] = useState('');

  const caseFilingFlag = useSectionFlag('caseFilingStatus');
  const childrenFlag = useSectionFlag('children');

  //pull children from the stored state, calling setChildren will add a new child to the existing list
  const [children, setChildren] = useState(() => {
    let startKey = 1
    return state.plan.children?.length > 0
      ? state.plan.children.map(child => {
        const newKid = {...child, isEmancipatedAdult: child.isEmancipatedAdult ? "emancipated" : "minor", key: startKey}
        startKey += 1
        return newKid
      })
      : [{ key: startKey, fName: '', lName: '', birthday: '', isEmancipatedAdult: '', errors: {} }];
  });

  useEffect(() => {
    dispatch({ type: 'UPDATE_SECTION', section: 'parents', payload: { errors: {} } });
    setCollaborationModeError(''); //changed to collab mode error
    setCaseFilingError('');
    setChildren(prev => prev.map(c => ({ ...c, errors: {} })));
  }, []); //clears all errors as soon as the page loads

  useEffect(() => {
    const fixedChildren = children.map(child => ({...child, isEmancipatedAdult: child.isEmancipatedAdult === "emancipated"})) 
    dispatch({ type: 'UPDATE_SECTION', section: "plan", payload: {children: fixedChildren} });
  }, [children]);

  const handleRadioChange = (section) => (value) => {
    dispatch({ type: 'UPDATE_SECTION', section: section, payload: value });
    //clear the relevant error when user makes a selection
    //removed safety concern error - moved collab mode error to a new function 
    if (section === 'caseFilingStatus') setCaseFilingError('');
  };

  const handleFormChange = (section, field) => (value) => {
    //updates the formContext with the new returned value
    dispatch({ type: 'UPDATE_SECTION', section: section, payload: { [field]: value } });
    if (errors[field]) {
      //clear previous errors for a field since it has been changed
      dispatch({ type: 'UPDATE_SECTION', section: section, payload: { errors: { ...errors, [field]: '' } } });
    }
  };

  const handleChildChange = (childKey, field) => (value) => {
    setChildren(prev => prev.map(child =>
      child.key === childKey
        ? { ...child, [field]: value, errors: { ...(child.errors ?? {}), [field]: '' } }
        : child
    ));
  };

  //added this - will create an error if the user does not confirm their choice to not collaborate
  const handleCollaborationModeChange = (value) => {
    dispatch({ type: 'UPDATE_SECTION', section: 'collaborationMode', payload: value });
    setCollaborationModeError('');
  };

  const addChild = () => {
    const newKey = Math.max(...children.map(c => c.key), 0) + 1;
    setChildren(prev => [...prev, {
      key: newKey,
      fName: '',
      lName: '',
      birthday: '',
      isEmancipatedAdult: '',
      errors: {}
    }]);
  };

  const removeChild = (childKey) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.key !== childKey));
    }
  };

  // Tracks when a failed submission happens - controls when to show validation errors
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
              <SafetyPrivacyQuestion //changed from radio question to the new safety privacy question component
                collaborationMode={collaborationMode}
                onModeChange={handleCollaborationModeChange} 
                error={collaborationModeError} 
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
                disclaimer="Please note: ShareCare cannot confirm if your answer is correct or if there is an active divorce, separation, or child support case."
                disclaimerVariant="info"
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
                  <Card key={child.key}>
                    <CardHeader>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <CardTitle>{`Child ${index + 1}`}</CardTitle>
                        {children.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChild(child.key)}
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
                            id={`child-${child.key}-firstName`}
                            label="First Name"
                            type="text"
                            value={child.fName}
                            onChange={handleChildChange(child.key, 'fName')}
                            required
                            placeholder="First Name"
                            autoComplete="given-name"
                            error={submitAttempted ? child.errors?.fName : ''}
                          />

                          <TextInput
                            id={`child-${child.key}-lastName`}
                            label="Last Name"
                            type="text"
                            value={child.lName}
                            onChange={handleChildChange(child.key, 'lName')}
                            required
                            placeholder="Last Name"
                            autoComplete="family-name"
                            error={submitAttempted ? child.errors?.lName : ''}
                          />
                        </div>

                        <DatePicker
                          id={`child-${child.key}-dateOfBirth`}
                          label="Date of Birth"
                          value={child.birthday}
                          onChange={handleChildChange(child.key, 'birthday')}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          error={submitAttempted ? child.errors?.birthday : ''}
                        />

                        <div className="child-classification">
                          <label className="classification-label">Child Classification</label>
                          <div className="radio-group">
                            <label className="radio-option">
                              <input
                                type="radio"
                                name={`child-${child.key}-classification`}
                                value="minor"
                                checked={child.isEmancipatedAdult === 'minor'}
                                onChange={(e) => handleChildChange(child.key, 'isEmancipatedAdult')(e.target.value)}
                              />
                              <span>
                                The child is a minor and/or mentally or physically disabled
                                incapable of supporting or maintaining themselves
                              </span>
                            </label>

                            <label className="radio-option">
                              <input
                                type="radio"
                                name={`child-${child.key}-classification`}
                                value="emancipated"
                                checked={child.isEmancipatedAdult === 'emancipated'}
                                onChange={(e) => handleChildChange(child.key, 'isEmancipatedAdult')(e.target.value)}
                              />
                              <span>The child is an emancipated adult</span>
                            </label>
                          </div>
                        </div>
                        {child.errors?.classification && (
                          <p className="child-classification-error">
                            {child.errors.classification}
                          </p>
                        )}
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