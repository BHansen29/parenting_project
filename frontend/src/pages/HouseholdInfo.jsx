import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import TextInput from '../components/forms/TextInput';
import DatePicker from '../components/forms/DatePicker';
import './Page.css';

export default function HouseholdInfo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    secondParentName: '',
  });

  const [children, setChildren] = useState([
    { id: 1, firstName: '', lastName: '', dateOfBirth: '', classification: 'minor' }
  ]);

  const [errors, setErrors] = useState({});

  // Reusable change handler
  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Child change handler
  const handleChildChange = (childId, field) => (value) => {
    setChildren(prev => prev.map(child =>
      child.id === childId ? { ...child, [field]: value } : child
    ));
  };

  // Add new child
  const addChild = () => {
    const newId = Math.max(...children.map(c => c.id), 0) + 1;
    setChildren(prev => [...prev, { id: newId, firstName: '', lastName: '', dateOfBirth: '', classification: 'minor' }]);
  };

  // Remove child
  const removeChild = (childId) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.id !== childId));
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Basic validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Parent 1 name is required';
    }

    if (!formData.secondParentName.trim()) {
      newErrors.secondParentName = 'Parent 2 name is required';
    }

    children.forEach((child, index) => {
      if (!child.firstName.trim()) {
        newErrors[`childFirstName_${child.id}`] = `Child ${index + 1} first name is required`;
      }
      if (!child.dateOfBirth) {
        newErrors[`childDateOfBirth_${child.id}`] = `Child ${index + 1} date of birth is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // TODO: Save to context or state management
      console.log('Form data:', formData);
      navigate('/custody-schedule');
    }
  };

  return (
    <div className="page-container">
      <Header />

      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Household Information</CardTitle>
            <CardDescription>Enter the details of the parents and children covered by this agreement.</CardDescription>
          </CardHeader>

          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Parents</CardTitle>
                <CardDescription>The individuals entering into this parenting agreement.</CardDescription>
              </CardHeader>

              <CardContent>
                <form noValidate>
                  <div className="form-row">
                    <TextInput
                      id="firstParentName"
                      label="Parent 1"
                      type="text"
                      value={formData.name}
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
                      value={formData.secondParentName}
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
                <CardDescription>The children covered by this parenting agreement.</CardDescription>
              </CardHeader>

              <CardContent>
                {children.map((child, index) => (
                  <Card key={child.id}>
                    <CardHeader>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <CardTitle>Child {index + 1}</CardTitle>
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
                          />

                          <TextInput
                            id={`child-${child.id}-lastName`}
                            label="Last Name"
                            type="text"
                            value={child.lastName}
                            onChange={handleChildChange(child.id, 'lastName')}
                            placeholder="Last Name"
                            autoComplete="family-name"
                          />
                        </div>

                        <DatePicker
                          id={`child-${child.id}-dateOfBirth`}
                          label="Date of Birth"
                          value={child.dateOfBirth}
                          onChange={handleChildChange(child.id, 'dateOfBirth')}
                          required
                          max={new Date().toISOString().split('T')[0]}
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
                              <span>The child is a minor and/or mentally or physically disabled incapable of supporting or maintaining themselves</span>
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
