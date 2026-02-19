import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import TextInput from '../components/forms/TextInput';
import DatePicker from '../components/forms/DatePicker';
import { useForm } from '../hooks/useForm';
import './Page.css';

export default function HouseholdInfo() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  // Parents stay in global context
  const formData = state.parents ?? { name: '', secondParentName: '', errors: {} };
  const errors = state.parents?.errors ?? {};

  // Children use local state 
  const [children, setChildren] = useState(() => {
    return state.children?.length > 0
      ? state.children
      : [{ id: 1, firstName: '', lastName: '', dateOfBirth: '', classification: 'minor', errors: {} }];
  });

  const handleChange = (field) => (value) => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'parents',
      payload: { [field]: value }
    });
    if (errors[field]) {
      dispatch({
        type: 'UPDATE_SECTION',
        section: 'parents',
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
      classification: 'minor',
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
    if (!formData.name?.trim()) parentErrors.name = 'Parent 1 name is required';
    if (!formData.secondParentName?.trim()) parentErrors.secondParentName = 'Parent 2 name is required';

    let childrenValid = true;
    const updatedChildren = children.map((child, index) => {
      const childErrors = {};
      if (!child.firstName.trim()) {
        childErrors.firstName = `Child ${index + 1} first name is required`;
        childrenValid = false;
      }
      if (!child.dateOfBirth) {
        childErrors.dateOfBirth = `Child ${index + 1} date of birth is required`;
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

  // Tracks when a failed submission happens
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
      navigate('/custody-schedule');
    } else {
      setSubmitAttempted(true);
    }
  };

  return (
    <div className="page-container">
      <Header />

      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Household Information</CardTitle>
            <CardDescription>
              Enter the details of the parents and children covered by this agreement.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Parents</CardTitle>
                <CardDescription>
                  The individuals entering into this parenting agreement.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form noValidate>
                  <div className="form-row">
                    <TextInput
                      id="firstParentName"
                      label="Parent 1"
                      type="text"
                      value={formData.name ?? ''}
                      onChange={handleChange('name')}
                      required
                      error={errors.name}
                      placeholder="Full Name"
                      autoComplete="name"
                    />

                    <TextInput
                      id="secondParentName"
                      label="Parent 2"
                      type="text"
                      value={formData.secondParentName ?? ''}
                      onChange={handleChange('secondParentName')}
                      required
                      error={errors.secondParentName}
                      placeholder="Full Name"
                      autoComplete="name"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Children</CardTitle>
                <CardDescription>
                  The children covered by this parenting agreement.
                </CardDescription>
              </CardHeader>

              <CardContent>
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
                            error={child.errors?.firstName}
                          />

                          <TextInput
                            id={`child-${child.id}-lastName`}
                            label="Last Name"
                            type="text"
                            value={child.lastName}
                            onChange={handleChildChange(child.id, 'lastName')}
                            placeholder="Last Name"
                            autoComplete="family-name"
                            error={child.errors?.lastName}
                          />
                        </div>

                        <DatePicker
                          id={`child-${child.id}-dateOfBirth`}
                          label="Date of Birth"
                          value={child.dateOfBirth}
                          onChange={handleChildChange(child.id, 'dateOfBirth')}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          error={child.errors?.dateOfBirth}
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
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      <Footer
        showBackButton={true}
        showNextButton={true}
        onNext={handleNext}
        onBack={() => navigate('/landing-page')}
      />
    </div>
  );
}