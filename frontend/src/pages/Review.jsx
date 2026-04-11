import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, UserPlus, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import Disclaimer from '../components/forms/Disclaimer';
import InviteModal from '../components/common/InviteModal';
import { useForm } from '../hooks/useForm';
import './Page.css';
import './Review.css';


// Section titles and routes
// Maps backend section enum values to UI label and frontend route for editing
// TODO: Update keys to match exact enum values - currently only have 1 created
const SECTION_META = {
  getting_started: { label: 'Getting Started', route: '/getting-started' },
  allocation_of_parental_rights_and_responsibilities: { label: 'Parental Rights', route: '/parental-rights' },
  parenting_time_communication: { label: 'Parenting Time & Communication', route: '/parenting-time-communication' },
  information_sharing: { label: 'Information Sharing', route: '/informationsharing' },
  tax_exemptions: { label: 'Tax Exemptions', route: '/tax-exemptions' },
};

// Formats an answer value for display
function formatAnswer(answer) {
  if (!answer || answer === '') return <span className="review__empty">Not answered</span>;
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
}

// Groups the state.plan.children array by question section
// Plan model representation of the array: plan.children = [{ questionID, answer, isFlagged, isDeferred }, ...]
// Question model includes "section" and "qKey" fields
// TODO: Populate questionID to look like: questionID: { _id, qKey, section, qText, ... }, answer, isFlagged }
function groupResponsesBySection(children = []) {
  const grouped = {};

  children.forEach((response) => {
    const question = response.questionID;
    const isPopulated = question && typeof question === 'object';
    const sectionKey = isPopulated ? question.section : null;

    if (!sectionKey) return;

    if (!grouped[sectionKey]) {
      grouped[sectionKey] = [];
    }

    grouped[sectionKey].push({
      qKey: question.qKey,
      answer: response.answer,
      isFlagged: response.isFlagged,
      isDeferred: response.isDeferred,
    });
  });
  return grouped;
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
        <button className="review__section-header" onClick={onToggle} aria-expanded={isOpen}>
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
        </button>
      </CardHeader>

      {isOpen && (
        <CardContent className="review__section-card-content">
          {hasAnswers ? (
            <ul className="review__answer-list">
              {responses.map((r, i) => (
                <li key={r.qKey || i} className="review__answer-item">
                  <span className="review__answer-key">{r.qKey}</span>
                  <span className="review__answer-value">{formatAnswer(r.answer)}</span>
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

  const planId = state.plan?._id;
  const groupedResponses = groupResponsesBySection(state.plan?.children ?? []);
  const knownSectionKeys = Object.keys(SECTION_META);

  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(knownSectionKeys.map((k) => [k, true]))
  );

  const [inviteOpen, setInviteOpen] = useState(false);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);

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

  const showInviteUI = collaborationMode !== 'locked-individual';

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

              {/* Show comparison button whenever this plan has a caseId.
                  The comparison page handles the "co-parent not joined yet" state itself. */}
              {state.plan?.caseId && (
                <button
                  className="review__btn-invite"
                  onClick={() => navigate(`/comparison/${state.plan.caseId}`)}
                >
                  View Comparison →
                </button>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* caseId lets the modal send a real invite linked to this shared case */}
      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} caseId={state.plan?.caseId} />
    </div>
  );
}