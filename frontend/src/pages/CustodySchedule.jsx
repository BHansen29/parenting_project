import { useState, useEffect } from 'react';
import Footer from "../components/common/Footer";
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import TextInput from '../components/forms/TextInput';
import './Page.css';

export default function CustodySchedule() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  const formData = state.parentingTime ?? { errors: {} };
  const errors = state.parentingTime?.errors ?? {};

  const [submitAttempted, setSubmitAttempted] = useState(false);

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
  }, [formData, submitAttempted]);

  const handleChange = (field) => (value) => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'parentingTime',
      payload: { [field]: value }
    });
    if (errors[field]) {
      dispatch({
        type: 'UPDATE_SECTION',
        section: 'parentingTime',
        payload: { errors: { ...errors, [field]: '' } }
      });
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!formData.residentialParent?.trim()) {
      formErrors.residentialParent = 'Residential parent name is required';
    }

    dispatch({
      type: 'UPDATE_SECTION',
      section: 'parentingTime',
      payload: { errors: formErrors }
    });

    return Object.keys(formErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      navigate('/transportation');
    } else {
      setSubmitAttempted(true);
    }
  };

  const handleBack = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'parentingTime',
      payload: { errors: {} }
    });
    navigate('/parenting-time');
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Custody Schedule</CardTitle>
            <CardDescription>
              Define the parenting time schedule for each parent.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form noValidate>
              <TextInput
                id="residentialParent"
                label="Primary Residential Parent"
                type="text"
                value={formData.residentialParent ?? ''}
                onChange={handleChange('residentialParent')}
                required
                error={errors.residentialParent}
                placeholder="Full Name"
              />
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer
        showBackButton={true}
        showNextButton={true}
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}