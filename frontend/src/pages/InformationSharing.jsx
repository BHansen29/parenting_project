import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';
import RadioButton from '../components/forms/RadioButton';
import FlagButton from '../components/forms/FlagButton';
import { useSectionFlag } from '../hooks/useSectionFlag';

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4" /><path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
  </svg>
);

const INFO_SECTIONS = [
  {
    key: 'medicalRecords',
    title: 'Medical Information Access',
    description: 'Who can access doctor visits and medical information?',
    icon: <HeartIcon />,
    iconColor: '#ec0c24',
    question: "Who should get copies of any doctor's visits that your children may have? This parent can also contact the doctor and ask questions.",
  },
  {
    key: 'schoolContact',
    title: 'School Contact Rights',
    description: 'Who can communicate with the school?',
    icon: <GraduationCapIcon />,
    iconColor: '#1bb0dd',
    question: "Who should be able to call your child's school? This parent may also get copies of your child's academic records, like report cards, attendance, and teacher's comments.",
  },
  {
    key: 'schoolReports',
    title: 'School Reports & Notices',
    description: 'Who receives school communications?',
    icon: <FileTextIcon />,
    iconColor: '#55c77e',
    question: "Who should get copies of your child's school reports, calendars of school events, notices of parent-teacher conferences, and school programs?",
  },
  {
    key: 'schoolActivities',
    title: 'School Activity Participation',
    description: 'Who may attend school events?',
    icon: <CalendarIcon />,
    iconColor: '#ff9c27',
    question: 'Who has the right to attend and participate in parent-teacher conferences, school trips, school programs, and other school activities that parents get invited to?',
  },
  {
    key: 'extracurricularActivities',
    title: 'Extracurricular Activities',
    description: 'Who may attend activities outside school?',
    icon: <TrophyIcon />,
    iconColor: '#a855f7',
    question: 'Who has the right to attend and participate with the child(ren) in athletic programs and other extracurricular activities?',
  },
];

const RADIO_OPTIONS = [
  { value: 'parent1', label: 'Just me' },
  { value: 'parent2', label: 'Just my co-parent' },
  { value: 'both', label: 'Both me and my co-parent' },
  { value: 'needInfo', label: 'I need more information' },
  { value: 'defer', label: "Default to my co-parent's choice" },
];

export default function InformationSharing() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();
  const { setOnNext, setOnBack } = useNavigation();

  const formData = state.informationSharing ?? {};
  const errors = state.informationSharing?.errors ?? {};

  const medicalRecordsFlag = useSectionFlag('medicalRecords');
  const schoolContactFlag = useSectionFlag('schoolContact');
  const schoolReportsFlag = useSectionFlag('schoolReports');
  const schoolActivitiesFlag = useSectionFlag('schoolActivities');
  const extracurricularActivitiesFlag = useSectionFlag('extracurricularActivities');

  const flagMap = {
    medicalRecords: medicalRecordsFlag,
    schoolContact: schoolContactFlag,
    schoolReports: schoolReportsFlag,
    schoolActivities: schoolActivitiesFlag,
    extracurricularActivities: extracurricularActivitiesFlag,
  };

  const handleChange = (field) => (value) => {
    dispatch({ type: 'UPDATE_SECTION', section: 'informationSharing', payload: { [field]: value } });
    if (errors[field]) {
      dispatch({ type: 'UPDATE_SECTION', section: 'informationSharing', payload: { errors: { ...errors, [field]: '' } } });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    INFO_SECTIONS.forEach(({ key }) => {
      if (!formData[key]) newErrors[key] = 'Please select an option.';
    });
    dispatch({ type: 'UPDATE_SECTION', section: 'informationSharing', payload: { errors: newErrors } });
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) navigate('/tax-exemptions');
  };

  const handleBack = () => {
    dispatch({ type: 'UPDATE_SECTION', section: 'informationSharing', payload: { errors: {} } });
    navigate('/parenting-time-communication');
  };

  useEffect(() => {
    setOnNext(handleNext);
    setOnBack(handleBack);
  }, [state]);

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
            <CardDescription>Determine who has access to medical, school, and activity information.</CardDescription>
          </CardHeader>
          <CardContent>
            {INFO_SECTIONS.map(({ key, title, description, icon, iconColor, question }) => (
              <div key={key} className="info-section">
                <div className="info-section__header">
                  <div className="info-section__icon" style={{ color: iconColor, backgroundColor: `${iconColor}1a` }}>
                    {icon}
                  </div>
                  <div>
                    <p className="info-section__title">{title}</p>
                    <p className="info-section__description">{description}</p>
                  </div>
                </div>
                <Card>
                  <CardHeader className="card-header-with-flag">
                    <CardDescription className="card-heading-question-bold">{question}</CardDescription>
                    <FlagButton isFlagged={flagMap[key].isFlagged} onClick={flagMap[key].toggleFlag} />
                  </CardHeader>
                  <CardContent>
                    <div className="radio-group">
                      {RADIO_OPTIONS.map(({ value, label }) => (
                        <RadioButton key={value} name={key} value={value}
                          checked={formData[key] === value}
                          onChange={(e) => handleChange(key)(e.target.value)}
                          label={label} />
                      ))}
                    </div>
                    {errors[key] && <p className="text-input__error-message">{errors[key]}</p>}
                  </CardContent>
                </Card>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}