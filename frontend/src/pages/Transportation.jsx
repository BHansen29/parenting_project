import { useState, useEffect } from 'react';
import Footer from '../components/common/Footer';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import TextInput from '../components/forms/TextInput';
import './Page.css';

export default function Transportation() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  const formData = state.transportation ?? { errors: {} };
  const errors = state.transportation?.errors ?? {};

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
      section: 'transportation',
      payload: { [field]: value }
    });
    if (errors[field]) {
      dispatch({
        type: 'UPDATE_SECTION',
        section: 'transportation',
        payload: { errors: { ...errors, [field]: '' } }
      });
    }
  };

  const validateForm = () => {
    const formErrors = {};
    if (!formData.responsibleParent?.trim()) {
      formErrors.responsibleParent = 'Responsible parent name is required';
    }

    dispatch({
      type: 'UPDATE_SECTION',
      section: 'transportation',
      payload: { errors: formErrors }
    });

    return Object.keys(formErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      navigate('/informationsharing');
    } else {
      setSubmitAttempted(true);
    }
  };

  const handleBack = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'transportation',
      payload: { errors: {} }
    });
    navigate('/custody-schedule');
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Transportation</CardTitle>
            <CardDescription>
              Define the transportation arrangements for each parent.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form noValidate>
              <TextInput
                id="responsibleParent"
                label="Parent Responsible for Transportation"
                type="text"
                value={formData.responsibleParent ?? ''}
                onChange={handleChange('responsibleParent')}
                required
                error={errors.responsibleParent}
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