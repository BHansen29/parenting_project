import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TextInput from '../components/forms/TextInput';
import DatePicker from '../components/forms/DatePicker';
import './Page.css';

export default function ParentInfo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  // Reusable change handler
  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = 'Must be 18 years or older';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // TODO: Save to context or state management
      console.log('Form data:', formData);
      navigate('/child-info');
    }
  };

  return (
    <div className="page-container">
      <Header />

      <div className="page-content">
        <div className="page-card">
          <h1>Parent Information</h1>
          <p>Please provide your contact information.</p>

          <form noValidate>
            <TextInput
            id="firstName"
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            required
            error={errors.firstName}
            autoComplete="given-name"
          />

            <TextInput
              id="lastName"
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              required
              error={errors.lastName}
              autoComplete="family-name"
            />

            <TextInput
              id="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              error={errors.email}
              autoComplete="email"
            />

            <TextInput
              id="phone"
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
              error={errors.phone}
              placeholder="(555) 555-5555"
              autoComplete="tel"
            />

            <DatePicker
              id="dateOfBirth"
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
              required
              max={new Date().toISOString().split('T')[0]}
              error={errors.dateOfBirth}
              helpText="Must be 18 years or older"
            />

            <TextInput
              id="address"
              label="Address"
              type="textarea"
              value={formData.address}
              onChange={handleChange('address')}
              required
              error={errors.address}
              rows={3}
              helpText="Street, City, State, ZIP"
            />
          </form>
        </div>
      </div>

      <Footer
        showBackButton={false}
        showNextButton={true}
        onNext={handleNext}
        nextButtonText="Next"
      />
    </div>
  );
}
