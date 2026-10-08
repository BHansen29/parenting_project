import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { CheckCircle, Download, UserPlus, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import Disclaimer from '../components/forms/Disclaimer';
import InviteModal from '../components/common/InviteModal';
import { useForm } from '../hooks/useForm';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import './Page.css';
import './Review.css';


// Section titles and routes
// Maps backend section enum values to UI label and frontend route for editing
// TODO: Update keys to match exact enum values - currently only have 1 created
const SECTION_META = {
  'getting-started': { label: 'Getting Started', route: '/getting-started' },
  'parental-rights': { label: 'Parental Rights', route: '/parental-rights' },
  'parenting-time-communication': { label: 'Parenting Time & Communication', route: '/parenting-time-communication' },
  'information-sharing': { label: 'Information Sharing', route: '/informationsharing' },
  'tax-exemptions': { label: 'Tax Exemptions', route: '/tax-exemptions' },
};

// Formats stored answer values using the question's human-readable option labels.
function formatAnswer(answer, question) {
  if (answer === null || answer === undefined || answer === '') {
    return <span className="review__empty">Not answered</span>;
  }

  const formatValue = (value) => {
    const option = question?.options?.find((item) => item.value === value);
    if (value && typeof value === 'object') return JSON.stringify(value);
    return option?.label || String(value);
  };

  if (Array.isArray(answer)) return answer.map(formatValue).join(', ');
  return formatValue(answer);
}

// Groups the state.plan.children array by question section
// Plan model representation of the array: plan.children = [{ questionID, answer, isFlagged, isDeferred }, ...]
// Question model includes "section" and "qKey" fields
// Groups saved plan answers by the section of their question definition.
function groupResponsesBySection(answers = [], questionsByKey = {}) {
  const grouped = {};

  answers.forEach((response) => {
    const question = questionsByKey[response.qKey];
    const sectionKey = question?.section;

    if (!sectionKey) return;

    if (!grouped[sectionKey]) {
      grouped[sectionKey] = [];
    }

    grouped[sectionKey].push({
      qKey: response.qKey,
      label: question.qTitle || question.qText || response.qKey,
      answer: response.answer,
      question,
      isFlagged: response.isFlagged,
      isDeferred: response.isDeferred,
    });
  });
  return grouped;
}

/* Parenting time & Information Sharing question text */
const CUSTOM_SECTION_FIELDS = {
  parentingTimeAndCommunication: {
    section: 'parenting-time-communication',
    fields: {
      agreeToTransportationPolicy: 'Agree to the standard transportation policy',
      transportationArrangementDescription: 'Preferred transportation arrangement',
      agreeToActivityPolicy: 'Agree to the standard activity policy',
      activityPolicyDescription: 'Preferred activity policy',
      communicationWithCoParentOnPhone: 'Phone communication with co-parent',
      communicationWithCoParentOnPhoneDescription: 'Phone communication circumstances',
      notifyCoParentOfChildRelatedEvents: 'Notify co-parent about illness or injury',
      notifyCoParentOfChildRelatedEventsDescription: 'Illness or injury notification circumstances',
    },
  },
  informationSharing: {
    section: 'information-sharing',
    fields: {
      medicalRecords: 'Medical information access',
      schoolContact: 'School contact rights',
      schoolReports: 'School reports and notices',
      schoolActivities: 'School activity participation',
      extracurricularActivities: 'Extracurricular activity participation',
    },
  },
};

const INFORMATION_SHARING_OPTIONS = [
  { value: 'parent1', label: 'Just me' },
  { value: 'parent2', label: 'Just my co-parent' },
  { value: 'both', label: 'Both me and my co-parent' },
  { value: 'needInfo', label: 'I need more information' },
  { value: 'defer', label: "Default to my co-parent's choice" },
];

/* Parenting time & Information Sharing question options, translates stored values to human-readable labels for display in the review page */
const CUSTOM_FIELD_OPTIONS = {
  communicationWithCoParentOnPhone: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'sometimes', label: 'Sometimes (please describe)' },
    { value: 'needMoreInfo', label: 'I need more information' },
    { value: 'defaultToCoParentChoice', label: "Default to my co-parent's choice" },
  ],
  notifyCoParentOfChildRelatedEvents: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'sometimes', label: 'Sometimes (please describe)' },
    { value: 'needMoreInfo', label: 'I need more information' },
    { value: 'defaultToCoParentChoice', label: "Default to my co-parent's choice" },
  ],
  medicalRecords: INFORMATION_SHARING_OPTIONS,
  schoolContact: INFORMATION_SHARING_OPTIONS,
  schoolReports: INFORMATION_SHARING_OPTIONS,
  schoolActivities: INFORMATION_SHARING_OPTIONS,
  extracurricularActivities: INFORMATION_SHARING_OPTIONS,
};

const STATE_FIELD_OPTIONS = {
  residentialParent: [
    { value: 'yes', label: 'Yes, I am the residential parent' },
    { value: 'no', label: 'No, I am not the residential parent' },
  ],
  parentRole: [
    { value: 'residential', label: 'I am the residential parent' },
    { value: 'nonresidential', label: 'I am the non-residential parent' },
  ],
  collaborationMode: [
    { value: 'individual', label: 'I wish to complete the form on my own'},
    { value: 'collaborative', label: 'I wish to collaborate with my co-parent'},
  ],
};

/* Adds parenting time and information sharing responses to the grouped responses object for display in the review page. */
function addCustomSectionResponses(grouped, plan) {
  Object.entries(CUSTOM_SECTION_FIELDS).forEach(([planField, sectionConfig]) => {
    const sectionResponses = Object.entries(plan?.[planField] ?? {})
      .filter(([field, value]) => field !== 'errors' && field !== 'parentingSchedule' && field !== 'holidaySchedule' && field !== 'schoolSchedule' && value !== '' && value !== null && value !== undefined)
      .map(([field, answer]) => ({
        qKey: `${planField}.${field}`,
        label: sectionConfig.fields[field] || field,
        answer,
        question: { options: CUSTOM_FIELD_OPTIONS[field] ?? [] },
      }));

    if (sectionResponses.length > 0) {
      grouped[sectionConfig.section] = [
        ...(grouped[sectionConfig.section] ?? []),
        ...sectionResponses,
      ];
    }
  });
}

/* Displays children's names */
function addStateSectionResponses(grouped, state) {
  const childNames = (state.plan?.children ?? []).map((child, index) => {
    const name = [child.fName ?? child.firstName, child.lName ?? child.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return name || child.name || `Child ${index + 1}`;
  });

  /* Adds gettings started and tax exemption responses to the grouped responses object for display in the review page. */
  const gettingStarted = [
    ['firstName', 'Your first name', state.parents?.firstName],
    ['lastName', 'Your last name', state.parents?.lastName],
    ['age', 'Your age', state.parents?.age],
    ['phone', 'Your phone number', state.parents?.phone],
    ['streetAddress', 'Street address', state.parents?.streetAddress],
    ['addressLine2', 'Address line 2', state.parents?.addressLine2],
    ['city', 'City', state.parents?.city],
    ['state', 'State', state.parents?.state],
    ['zipCode', 'ZIP code', state.parents?.zipCode],
    ['collaborationMode', 'Plan collaboration mode', state.plan?.collaborationMode],
    ['userRole', 'Case filing status', state.plan?.userRole],
    ['residentialParent', 'Residential parent', state.plan?.residentialParent],
    ['children', 'Children', childNames],
  ];
  const taxExemptions = [
    ['parentRole', 'Parental role', state.taxExemptions?.parentRole],
    ['claimingChildren', 'Children claimed for tax exemptions', state.taxExemptions?.claimingChildren],
  ];

  [
    ['getting-started', gettingStarted],
    ['tax-exemptions', taxExemptions],
  ].forEach(([section, fields]) => {
    const responses = fields
      .filter(([, , answer]) => answer !== '' && answer !== null && answer !== undefined)
      .map(([key, label, answer]) => ({
        qKey: `${section}.${key}`,
        label,
        answer,
        question: { options: STATE_FIELD_OPTIONS[key] ?? [] },
      }));

    if (responses.length > 0) {
      grouped[section] = [...(grouped[section] ?? []), ...responses];
    }
  });
}


function SectionBlock({ sectionKey, responses, onEdit, isOpen, onToggle }) {
  const meta = SECTION_META[sectionKey] || {
    label: sectionKey.replaceAll('_', ' '),
    route: '/',
  };
  const hasAnswers = responses && responses.length > 0;

  return (
    <Card className="review__section-card">
      <CardHeader className="review__section-card-header">
        <div className="review__section-header" onClick={onToggle} role="button" aria-expanded={isOpen} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onToggle()}>
          <div className="review__section-header-left">
            <CheckCircle
              size={18}
              className={hasAnswers ? 'review__check--complete' : 'review__check--incomplete'}
            />
            <span className="review__section-title">{meta.label}</span>
          </div>
          <div className="review__section-header-right">
            <button
              className="review__edit-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(meta.route); }}
              aria-label={`Edit ${meta.label}`}
            >
              <Pencil size={14} />
              Edit
            </button>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="review__section-card-content">
          {hasAnswers ? (
            <ul className="review__answer-list">
              {responses.map((r, i) => (
                <li key={r.qKey || i} className="review__answer-item">
                  <span className="review__answer-key">{r.label}</span>
                  <span className="review__answer-value">{formatAnswer(r.answer, r.question)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="review__section-empty">No answers recorded for this section yet.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}


export default function Review() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  // collaborationMode drives invite button behaviour — mirrors Dashboard logic:
  //   'locked-individual' — safety concern; invite button hidden entirely
  //   'individual'        — user chose solo; show switch prompt before opening invite
  //   'collaborative'     — user chose collaborative; invite button opens modal directly
  //   ''                  — not yet set; treat same as individual (no invite)
  const collaborationMode = state.collaborationMode ?? '';

  const [questionsByKey, setQuestionsByKey] = useState({});
  const groupedResponses = groupResponsesBySection(state.plan?.answers || [], questionsByKey);
  addCustomSectionResponses(groupedResponses, state.plan);
  addStateSectionResponses(groupedResponses, state);
  const knownSectionKeys = Object.keys(SECTION_META);

  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(knownSectionKeys.map((k) => [k, true]))
  );

  const [inviteOpen, setInviteOpen] = useState(false);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);
  const [caseStatus, setCaseStatus] = useState(null);
  

  const caseId = state.plan?.caseId;

  useEffect(() => {
    if (!caseId) return undefined;

    let isActive = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      user.getIdToken()
        .then((idToken) => fetch(buildApiUrl(`api/v1/cases/${caseId}/status`), {
          headers: { Authorization: `Bearer ${idToken}` },
        }))
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (isActive && data?.status) setCaseStatus(data.status);
        })
        .catch(() => {});
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [caseId]);

  useEffect(() => {
    fetch(buildApiUrl('/api/logic-engine/questions'))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load question definitions');
        return res.json();
      })
      .then((questions) => {
        const questionMap = {};
        questions.forEach((question) => {
          if (question.qKey) questionMap[question.qKey] = question;
        });
        setQuestionsByKey(questionMap);
      })
      .catch((error) => console.error(error.message));
  }, []);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleEdit = (route) => navigate(route);

  const completedCount = knownSectionKeys.filter(
    (k) => groupedResponses[k]?.length > 0
  ).length;
  const totalCount = knownSectionKeys.length;
  const allComplete = completedCount === totalCount;

  // Routes invite click based on collaborationMode — same logic as Dashboard.
  const handleInviteClick = () => {
    if (collaborationMode === 'collaborative') {
      setInviteOpen(true);
    } else if (collaborationMode === 'individual' || collaborationMode === '') {
      setShowSwitchPrompt(true);
    }
    // 'locked-individual' — button is not rendered, so this is unreachable
  };

  // User confirmed switch from individual to collaborative, then open invite modal.
  // TODO: When the invite feature branch is merged, this switch will need to handle
  // the case where the user has already made progress in individual mode. Consider
  // whether answers need to be migrated, reset, or left as-is, and whether any
  // previously sent invites (if any) need to be revoked or re-sent.
  const handleConfirmSwitch = () => {
    dispatch({ type: 'UPDATE_SECTION', section: 'collaborationMode', payload: 'collaborative' });
    dispatch({ type: 'UPDATE_SECTION', section: 'plan', payload: {collaborationMode: 'collaborative'} });
    setShowSwitchPrompt(false);
    setInviteOpen(true);
  };

  const showInviteUI = collaborationMode !== 'locked-individual' && caseStatus == 'pending_invite';

  return (
    <div className="page-container">
      <div className="page-content">

        {/* Switch-to-collaborative confirmation prompt */}
        {showSwitchPrompt && (
          <div className="delete-modal__overlay" onClick={() => setShowSwitchPrompt(false)}>
            <div className="delete-modal" onClick={e => e.stopPropagation()}>
              <h3 className="delete-modal__title">Switch to collaborative mode?</h3>
              <p className="delete-modal__body">
                You're currently completing this plan individually. Switching to collaborative
                mode will allow your co-parent to fill out their section separately. Would you
                like to switch?
              </p>
              <div className="delete-modal__actions">
                <button className="delete-modal__cancel" onClick={() => setShowSwitchPrompt(false)}>
                  Stay in individual mode
                </button>
                <button className="delete-modal__confirm" onClick={handleConfirmSwitch}>
                  Switch &amp; invite co-parent
                </button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="review__header-row">
              <div>
                <CardTitle>Review & Submit Your Plan</CardTitle>
                <CardDescription>
                  Check your answers before downloading or inviting your co-parent.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <hr className="section-divider" />

            <Disclaimer variant="info">
              This tool helps you draft a parenting plan but does <strong>not</strong> constitute
              legal advice. This document is not a substitute for consultation with a licensed
              attorney. Review all answers carefully before submitting to the court.
            </Disclaimer>

            <div className="review__sections">
              {knownSectionKeys.map((key) => (
                <SectionBlock
                  key={key}
                  sectionKey={key}
                  responses={groupedResponses[key] ?? []}
                  onEdit={handleEdit}
                  isOpen={openSections[key]}
                  onToggle={() => toggleSection(key)}
                />
              ))}
            </div>

            {!allComplete && (
              <Disclaimer variant="warning">
                Some sections are incomplete. You can still download or invite your co-parent,
                but the plan may not be accepted by the court.
              </Disclaimer>
            )}

            <div className="review__actions">
              <div className="review__action-buttons">

                {/* Invite button — hidden for locked-individual (safety concern) users */}
                {showInviteUI && (
                  <button
                    className="review__btn-invite"
                    onClick={handleInviteClick}
                  >
                    <UserPlus size={16} />
                    {collaborationMode === 'individual' || collaborationMode === ''
                      ? 'Switch & Invite Co-Parent'
                      : 'Invite Co-Parent'}
                  </button>
                )}

                <button className="review__btn-download">
                  <Download size={16} />
                  Download PDF
                </button>
              </div>

              {/* Show comparison button only in collaborative mode and after an invite has been sent. */}
              {collaborationMode === 'collaborative' && caseId && caseStatus && caseStatus !== 'draft' && (
                <button
                  className="review__btn-invite"
                  onClick={() => navigate(`/comparison/${caseId}`)}
                >
                  View Comparison →
                </button>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* caseId lets the modal send a real invite linked to this shared case */}
      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        caseId={caseId}
        onInviteSent={() => setCaseStatus('pending_invite')}
      />
    </div>
  );
}