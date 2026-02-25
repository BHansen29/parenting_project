import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import './Page.css';

// SVG icon for Tax Claiming Intent section
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

// SVG icon for the info banner
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const TAX_SECTIONS = [
  {
    key: 'taxClaimIntent',
    title: 'Tax Claiming Intent',
    description: 'Will you claim your children on tax forms?',
    icon: <FileTextIcon />,
    iconColor: '#1bb0dd',
    question: 'Do you want to claim your children on any tax forms every year?',
  },
];

const RADIO_OPTIONS = [
  { value: 'everyYear',  label: 'Yes, I plan to claim my child(ren) for each tax year going forward' },
  { value: 'someYears',  label: 'Yes, I plan to claim my child(ren) for some tax years going forward' },
  { value: 'noClaim',   label: "No, I don't plan to claim my child(ren) for each tax year going forward" },
  { value: 'needInfo',  label: 'I need more information' },
  { value: 'defer',     label: 'Defer to my co-parent' },
];

export default function TaxExemptions() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  const formData = state.taxExemptions ?? {};
  const errors = state.taxExemptions?.errors ?? {};

  const handleChange = (field) => (value) => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'taxExemptions',
      payload: { [field]: value },
    });
    if (errors[field]) {
      dispatch({
        type: 'UPDATE_SECTION',
        section: 'taxExemptions',
        payload: { errors: { ...errors, [field]: '' } },
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    TAX_SECTIONS.forEach(({ key }) => {
      if (!formData[key]) {
        newErrors[key] = 'Please select an option.';
      }
    });
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'taxExemptions',
      payload: { errors: newErrors },
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      navigate('/review'); 
    }
  };

  const handleBack = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'taxExemptions',
      payload: { errors: {} },
    });
    navigate('/informationsharing'); 
  };

  return (
    <div className="page-container">
      <Header />

      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Tax Exemptions</CardTitle>
            <CardDescription>
              Decide who will claim tax exemptions for your children.
            </CardDescription>
          </CardHeader>

          <CardContent>

            {/* Informational banner */}
            <div className="info-banner">
              <InfoIcon />
              <div>
                <p className="info-banner__title">Tax Exemptions</p>
                <p className="info-banner__body">
                  It's important to decide who will claim your child(ren) as dependent(s) on tax
                  forms. This can have significant financial implications for both parents.
                </p>
              </div>
            </div>

            {TAX_SECTIONS.map(({ key, title, description, icon, iconColor, question }) => (
              <div key={key} className="info-section">

                {/* Section header */}
                <div className="info-section__header">
                  <div
                    className="info-section__icon"
                    style={{ color: iconColor, backgroundColor: `${iconColor}1a` }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="info-section__title">{title}</p>
                    <p className="info-section__description">{description}</p>
                  </div>
                </div>

                {/* Question card */}
                <Card>
                  <CardContent>
                    <p className="parent-label">{question}</p>

                    <div className="radio-group">
                      {RADIO_OPTIONS.map(({ value, label }) => (
                        <label key={value} className="radio-option">
                          <input
                            type="radio"
                            name={key}
                            value={value}
                            checked={formData[key] === value}
                            onChange={(e) => handleChange(key)(e.target.value)}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>

                    {errors[key] && (
                      <p className="text-input__error-message">{errors[key]}</p>
                    )}
                  </CardContent>
                </Card>

              </div>
            ))}

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