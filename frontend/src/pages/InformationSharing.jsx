import { Fragment, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import { useForm } from '../hooks/useForm';
import { useNavigation } from '../context/NavigationContext';
import { useSectionFlag } from '../hooks/useSectionFlag';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';
import Disclaimer from '../components/forms/Disclaimer';
import TextInput from '../components/forms/TextInput';
// ─── Icons ────────────────────────────────────────────────────────────────────

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
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

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

// ─── Section definitions ──────────────────────────────────────────────────────
const LEGACY_RADIO_ANSWERS = new Set([
  'parent1',
  'parent2',
  'both',
  'needInfo',
  'defer',
]);

const INFO_SECTIONS = [
  {
    key: 'medicalRecords',
    title: 'Medical Information Access',
    description: 'Unless you come to a separate agreement, you and your co-parent both have the following rights:\n1. The right to participate in major decisions about your child’s health, social situations, morals, welfare, education and economic development.\n2. The right to participate in choosing doctors, psychologists, psychiatrists, hospitals, and other health care providers for your child.\n3. The right to authorize medical, surgical, hospital, dental, institutional, psychological, and psychiatric care for your child and to get a second opinion about their medical conditions or treatment.\n4. The right to be told if your child gets sick or injured.\n5. The right to attend your child’s medical, dental, and other-health related appointments and treatments.\n6. The right to get and inspect your child’s medical and dental records and the right to talk to any treating physician, dentist, and other health care provider.',
    icon: <HeartIcon />,
    iconClassName: 'heart-icon',
    question: "Do you agree to these default rights? If not, provide what rights you would like or not like your co-parent to have.",
    placeholder: "Enter yes or explain which default rights you would like to modify.",
    disclaimer: "The information outlined above is directly listed in the Ohio Supreme Court’s Parenting Plan Form. This tool is strictly informative and does not purport to give legal advice about your rights or options available to you. If you have questions, please talk with a lawyer."
  },
  {
    key: 'schoolContact',
    title: 'School Contact Rights & Access to Information',
    description: 'Unless you come to a separate agreement, you and your co-parent both have the following rights:\n1. The right to talk with school officials about your child’s welfare and educational status, and the right to get and inspect your child’s school records to the extent permitted by law.\n2. The right to receive copies of all school reports, calendars of school events, notices of parent-teacher conferences, and school programs.',
    icon: <GraduationCapIcon />,
    iconClassName: 'graduation-icon',
    question: "Do you agree to these default rights? If not, provide what rights you would like or not like your co-parent to have.",
    placeholder: "Enter yes or explain which default rights you would like to modify.",
    disclaimer: "The information outlined above is directly listed in the Ohio Supreme Court’s Parenting Plan Form. This tool is strictly informative and does not purport to give legal advice about your rights or options available to you. If you have questions, please talk with a lawyer."
  },
  {
    key: 'schoolActivities',
    title: 'School Activity Participation',
    description: 'Unless you come to a separate agreement, you and your co-parent both have the following rights:\n1. The right to attend and participate in parent-teacher conferences, school trips, school programs, and other school activities that parents are invited to.\n2. The right to attend and participate with your children in athletic programs and other extracurricular activities.',
    icon: <CalendarIcon />,
    iconClassName: 'calendar-icon',
    question: "Do you agree to these default rights? If not, provide what rights you would like or not like your co-parent to have.",
    placeholder: "Enter yes or explain which default rights you would like to modify.",
    disclaimer: "The information outlined above is directly listed in the Ohio Supreme Court’s Parenting Plan Form. This tool is strictly informative and does not purport to give legal advice about your rights or options available to you. If you have questions, please talk with a lawyer."
  },
];

const RADIO_OPTIONS = [
  { value: 'parent1',  label: 'Just me' },
  { value: 'parent2',  label: 'Just my co-parent' },
  { value: 'both',     label: 'Both me and my co-parent' },
  { value: 'needInfo', label: 'I need more information' },
  { value: 'defer',    label: "Default to my co-parent's choice" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function InformationSharing() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();
  const { setOnNext, setOnBack } = useNavigation();

  const formData = state.informationSharing ?? {};
  const errors   = state.informationSharing?.errors ?? {};

  // ── Flag hooks ────────────────────────────────────────────────────────────
  const medicalRecordsFlag            = useSectionFlag('medicalRecords');
  const schoolContactFlag             = useSectionFlag('schoolContact');
  const schoolActivitiesFlag          = useSectionFlag('schoolActivities');

  const flagMap = {
    medicalRecords:            medicalRecordsFlag,
    schoolContact:             schoolContactFlag,
    schoolActivities:          schoolActivitiesFlag,
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  // RadioQuestion already unwraps e.target.value before calling onChange,
  // so this handler receives a plain string value — not an event.
  const handleChange = (field) => (value) => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'informationSharing',
      payload: { [field]: value },
    });
    if (errors[field]) {
      dispatch({
        type: 'UPDATE_SECTION',
        section: 'informationSharing',
        payload: { errors: { ...errors, [field]: '' } },
      });
    }
  };

  // Reads directly from state to avoid stale closure in NavigationContext
  const validateForm = useCallback(() => {
    const current = state.informationSharing ?? {};
    const newErrors = {};
    INFO_SECTIONS.forEach(({ key }) => {
      if (!String(current[key] ?? '').trim()) {
        newErrors[key] = 'Please enter a response.';
      }
    });
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'informationSharing',
      payload: { errors: newErrors },
    });
    return Object.keys(newErrors).length === 0;
  }, [state]);

  const handleNext = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const user = auth.currentUser;
      if (!user || !state.plan?._id) {
        navigate('/tax-exemptions');
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(buildApiUrl(`api/plan/${state.plan._id}/sections`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          section: 'informationSharing',
          answers: state.informationSharing,
        }),
      });

      if (!response.ok) throw new Error('Failed to save information sharing answers');
      const plan = await response.json();
      dispatch({ type: 'UPDATE_SECTION', section: 'plan', payload: plan });
      navigate('/tax-exemptions');
    } catch (error) {
      console.error(error.message);
    }
  }, [dispatch, navigate, state, validateForm]);

  const handleBack = useCallback(() => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'informationSharing',
      payload: { errors: {} },
    });
    navigate('/parenting-time-communication');
  }, []);

  useEffect(() => {
    setOnNext(handleNext);
    setOnBack(handleBack);
  }, [handleNext, handleBack]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
            <CardDescription>
              Determine who has access to medical, school, and activity information.
            </CardDescription>
          </CardHeader>
          <Disclaimer variant="warning">
            This tool is for informational purposes only. It does not provide legal advice about your rights or options available to you. Your responses do not create or establish any legal rights for either parent. This tool is intended to help co-parents think about important topics when making a shared parenting plan. Only a court can approve a parenting plan and make it legally binding. If you have any questions, please talk with a lawyer.
          </Disclaimer>
          <CardContent>
            {INFO_SECTIONS.map(({ key, title, description, icon, iconClassName, question, placeholder, disclaimer, }) => (
              <div key={key} className="info-section">
                <hr className="section-divider" />

                <SectionHeader
                  icon={icon}
                  iconClassName={iconClassName}
                  title={title}
                  help={description.split('\n').map((line, index) => (
                    <Fragment key={`${key}-description-${index}`}>
                      {index > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                />

                {/* onChange receives a plain string value — (change to TextQuestion) RadioQuestion unwraps the event internally */}
                <TextInput
                  id={`information-sharing-${key}`}
                  label={question}
                  type="textarea"
                  rows={4}
                  value={
                    LEGACY_RADIO_ANSWERS.has(formData[key])
                     ? ''
                     : formData[key] ?? ''
                  }
                  onChange={handleChange(key)}
                  placeholder={placeholder}
                  required
                  error={errors[key]}
              />
              {disclaimer && (
                <Disclaimer variant="warning">
                  {disclaimer}
                </Disclaimer>
              )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}