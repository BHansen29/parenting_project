import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, UserPlus, Pencil, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import Disclaimer from '../components/forms/Disclaimer';
import InviteModal from '../components/common/InviteModal';
import { useForm } from '../hooks/useForm';
import './Page.css';
import './Review.css';


// Section titles and routes
const SECTION_META = {
  getting_started: { label: 'Getting Started', route: '/getting-started' },
  parental_rights: { label: 'Parental Rights', route: '/parental-rights' },
  parenting_time_communication: { label: 'Parenting Time & Communication', route: '/parenting-time-communication' },
  information_sharing: { label: 'Information Sharing', route: '/informationsharing' },
  tax_exemptions: { label: 'Tax Exemptions', route: '/tax-exemptions' },
};

function formatAnswer(answer) {
  if (!answer || answer === '') return <span className="review__empty">Not answered</span>;
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
}


function SectionBlock({ sectionKey, responses, onEdit, isOpen, onToggle }) {
  const meta = SECTION_META[sectionKey] || { label: sectionKey, route: '/' };
  const hasAnswers = responses && responses.length > 0;

  return (
    <Card className="review__section-card">

      {/* Card header acts as the collapsible toggle */}
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

      {/* Card content holds the answers */}
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
  const { state } = useForm();

  const sectionKeys = Object.keys(SECTION_META);

  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sectionKeys.map((k) => [k, true]))
  );

  const [inviteOpen, setInviteOpen] = useState(false);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleEdit = (route) => navigate(route);
  const handleBack = () => navigate(-1);

  const completedCount = sectionKeys.filter((k) => {
    const sec = state[k];
    return sec?.responses?.length > 0;
  }).length;

  const totalCount = sectionKeys.length;
  const allComplete = completedCount === totalCount;

  return (
    <div className="page-container">
      <div className="page-content">

        {/* ── Outer card: title + disclaimers ── */}
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

            {/* Legal disclaimer — always visible */}
            <Disclaimer variant="info">
              This tool helps you draft a parenting plan but does <strong>not</strong> constitute
              legal advice. This document is not a substitute for consultation with a licensed
              attorney. Review all answers carefully before submitting to the court.
            </Disclaimer>

            

            {/* ── Section cards ── */}
            <div className="review__sections">
              {sectionKeys.map((key) => (
                <SectionBlock
                  key={key}
                  sectionKey={key}
                  responses={state[key]?.responses ?? []}
                  onEdit={handleEdit}
                  isOpen={openSections[key]}
                  onToggle={() => toggleSection(key)}
                />
              ))}
            </div>

            {/* Incomplete sections warning — conditional */}
            {!allComplete && (
              <Disclaimer variant="warning">
                Some sections are incomplete. You can still download or invite your co-parent,
                but the plan may not be accepted by the court.
              </Disclaimer>
            )}

            {/* ── Action buttons ── */}
            <div className="review__actions">
              <div className="review__action-buttons">
                <button
                  className="review__btn-invite"
                  onClick={() => setInviteOpen(true)}
                >
                  <UserPlus size={16} />
                  Invite Co-Parent
                </button>
                <button className="review__btn-download">
                  <Download size={16} />
                  Download PDF
                </button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}