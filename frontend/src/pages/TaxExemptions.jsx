import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import {
  ClaimEveryYearDisclaimers,
  ClaimSomeYearsDisclaimers,
  DeferDisclaimers,
} from './taxExemptions/TaxExemptionDisclaimers';
import './Page.css';
import './TaxExemptions.css';

// ─── Icons ────────────────────────────────────────────────────────────────────

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const TAX_YEAR_OPTIONS = [
  { value: 'odd',    label: 'Odd-numbered tax years (e.g. 2025, 2027, 2029…)' },
  { value: 'even',   label: 'Even-numbered tax years (e.g. 2026, 2028, 2030…)' },
  { value: 'custom', label: 'Custom — I will specify the years' },
];

// ─── Per-child question block ─────────────────────────────────────────────────

function ChildTaxBlock({ childName, childIndex, childData = {}, parentRole, onUpdate, errors = {} }) {
  const intent     = childData.intent ?? '';
  const taxYears   = childData.taxYears ?? '';
  const customYears = childData.customYears ?? '';

  const showTaxYearQuestion   = intent === 'someYears';
  const showCustomYearInput   = showTaxYearQuestion && taxYears === 'custom';
  const showEveryYearDisclaimers = intent === 'everyYear' && !!parentRole;
  const showSomeYearsDisclaimers = intent === 'someYears' && !!taxYears && !!parentRole;
  const showDeferDisclaimers    = intent === 'defer' && !!parentRole;

  const update = (payload) => onUpdate(childIndex, payload);
  const clearError = (field) => {
    if (errors[field]) update({ errors: { ...errors, [field]: '' } });
  };

  return (
    <div className="child-tax-block">
      <div className="child-tax-block__header">
        <div className="child-tax-block__avatar">
          {childName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="child-tax-block__name">{childName}</p>
          <p className="child-tax-block__subtitle">Tax claiming arrangement</p>
        </div>
        {intent && (
          <div className="child-tax-block__status">
            <CheckCircleIcon />
          </div>
        )}
      </div>

      <Card>
        <CardContent>
          <p className="parent-label">
            How will you claim {childName} on tax forms?
          </p>
          <div className="radio-group">
            {[
              { value: 'everyYear', label: 'I will claim this child every year' },
              { value: 'someYears', label: 'I will claim this child some years (alternating or specific years)' },
              { value: 'defer',     label: 'I defer to my co-parent to claim this child' },
            ].map(({ value, label }) => (
              <label key={value} className={`radio-option${intent === value ? ' radio-option--checked' : ''}`}>
                <input
                  type="radio"
                  name={`intent-${childIndex}`}
                  value={value}
                  checked={intent === value}
                  onChange={() => {
                    update({ intent: value, taxYears: '', customYears: '', errors: {} });
                    clearError('intent');
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {errors.intent && (
            <p className="text-input__error-message">{errors.intent}</p>
          )}

          {/* Every year disclaimers */}
          {showEveryYearDisclaimers && (
            <ClaimEveryYearDisclaimers parentRole={parentRole} />
          )}

          {/* Some years: which tax years */}
          {showTaxYearQuestion && (
            <div className="child-tax-block__subanswer">
              <p className="parent-label">Which tax years will you claim {childName}?</p>
              <div className="radio-group">
                {TAX_YEAR_OPTIONS.map(({ value, label }) => (
                  <label key={value} className={`radio-option${taxYears === value ? ' radio-option--checked' : ''}`}>
                    <input
                      type="radio"
                      name={`taxYears-${childIndex}`}
                      value={value}
                      checked={taxYears === value}
                      onChange={() => { update({ taxYears: value, customYears: '' }); clearError('taxYears'); }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.taxYears && (
                <p className="text-input__error-message">{errors.taxYears}</p>
              )}

              {showCustomYearInput && (
                <div className="tax-custom-years">
                  <label className="parent-label" htmlFor={`customYears-${childIndex}`}>
                    Enter the tax years you will claim (comma-separated)
                  </label>
                  <input
                    id={`customYears-${childIndex}`}
                    type="text"
                    className="tax-custom-years__input"
                    placeholder="e.g. 2025, 2027, 2029"
                    value={customYears}
                    onChange={(e) => { update({ customYears: e.target.value }); clearError('customYears'); }}
                  />
                  {errors.customYears && (
                    <p className="text-input__error-message">{errors.customYears}</p>
                  )}
                </div>
              )}

              {showSomeYearsDisclaimers && (
                <ClaimSomeYearsDisclaimers taxYears={taxYears} parentRole={parentRole} />
              )}
            </div>
          )}

          {/* Defer disclaimers */}
          {showDeferDisclaimers && (
            <DeferDisclaimers parentRole={parentRole} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Validates a string is a comma-separated list of 4-digit years, e.g. "2025, 2027, 2029"
const isValidYearList = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(',').map(p => p.trim());
  return parts.every(p => /^\d{4}$/.test(p));
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function TaxExemptions() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  const children  = state.children ?? [];
  const formData  = state.taxExemptions ?? {};
  const errors    = formData.errors ?? {};

  const parentRole         = formData.parentRole ?? '';
  // Which children the user plans to claim at some point
  const claimingChildren   = formData.claimingChildren ?? [];
  // Per-child answers: { [childName]: { intent, taxYears, customYears, errors } }
  const childAnswers       = formData.childAnswers ?? {};

  const allChildNames = children.map(c =>
    `${c.firstName} ${c.lastName}`.trim() || `Child ${c.id}`
  );

  const update = (payload) =>
    dispatch({ type: 'UPDATE_SECTION', section: 'taxExemptions', payload });

  const clearError = (field) => {
    if (errors[field]) update({ errors: { ...errors, [field]: '' } });
  };

  // Toggle a child in the "claiming" list and reset their per-child answers if removed
  const toggleChild = (name) => {
    const next = claimingChildren.includes(name)
      ? claimingChildren.filter(n => n !== name)
      : [...claimingChildren, name];

    // Remove answers for de-selected child
    const nextAnswers = { ...childAnswers };
    if (claimingChildren.includes(name)) delete nextAnswers[name];

    update({ claimingChildren: next, childAnswers: nextAnswers, errors: { ...errors, claimingChildren: '' } });
  };

  // Update a specific child's answers
  const updateChildAnswer = (childName, payload) => {
    update({
      childAnswers: {
        ...childAnswers,
        [childName]: { ...(childAnswers[childName] ?? {}), ...payload },
      },
    });
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateForm = () => {
    const newErrors = {};
    if (!parentRole) newErrors.parentRole = 'Please indicate your parental role.';
    if (claimingChildren.length === 0) newErrors.claimingChildren = 'Please select at least one child, or indicate you are not claiming any.';

    const newChildAnswerErrors = { ...childAnswers };
    claimingChildren.forEach(name => {
      const ans = childAnswers[name] ?? {};
      const childErrors = {};
      if (!ans.intent) childErrors.intent = 'Please select an option for this child.';
      if (ans.intent === 'someYears' && !ans.taxYears) childErrors.taxYears = 'Please select which tax years.';
      if (ans.intent === 'someYears' && ans.taxYears === 'custom') {
        if (!ans.customYears?.trim()) {
          childErrors.customYears = 'Please enter the specific tax years.';
        } else if (!isValidYearList(ans.customYears)) {
          childErrors.customYears = 'Please enter years as comma-separated 4-digit years (e.g. 2025, 2027, 2029).';
        }
      }
      if (Object.keys(childErrors).length > 0)
        newChildAnswerErrors[name] = { ...(childAnswers[name] ?? {}), errors: childErrors };
    });

    update({ errors: newErrors, childAnswers: newChildAnswerErrors });
    return Object.keys(newErrors).length === 0 &&
      claimingChildren.every(name => {
        const ans = childAnswers[name] ?? {};
        if (!ans.intent) return false;
        if (ans.intent === 'someYears' && !ans.taxYears) return false;
        if (ans.intent === 'someYears' && ans.taxYears === 'custom') {
          if (!ans.customYears?.trim() || !isValidYearList(ans.customYears)) return false;
        }
        return true;
      });
  };

  const handleNext = () => {
    if (validateForm()) {
      navigate('/review');
    } else {
      setSubmitAttempted(true);
    }
  };
  const handleBack = () => { update({ errors: {} }); navigate('/informationsharing'); };

  // Tracks when a failed submission happens
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Runs after React re-renders with new errors, then scrolls to the first one
  useEffect(() => {
    if (submitAttempted) {
      const firstError = document.querySelector('.text-input__error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setSubmitAttempted(false);
    }
  }, [formData, submitAttempted]);

  const showChildQuestions = claimingChildren.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Tax Exemptions</CardTitle>
            <CardDescription>
              Decide who will claim tax exemptions for your children.
            </CardDescription>
          </CardHeader>

          <CardContent>

            {/* Info banner */}
            <div className="info-banner">
              <InfoIcon />
              <div>
                <p className="info-banner__title">Tax Exemptions</p>
                <p className="info-banner__body">
                  It's important to decide who will claim your child(ren) as dependent(s)
                  on tax forms. This can have significant financial implications for both parents.
                </p>
              </div>
            </div>

            {/* ── Parental role ── */}
            <div className="info-section">
              <div className="info-section__header">
                <div className="info-section__icon"
                  style={{ color: '#1bb0dd', backgroundColor: '#1bb0dd1a' }}>
                  <FileTextIcon />
                </div>
                <div>
                  <p className="info-section__title">Your Parental Role</p>
                  <p className="info-section__description">
                    This determines which tax forms and deadlines apply to you.
                  </p>
                </div>
              </div>
              <Card>
                <CardContent>
                  <p className="parent-label">
                    Are you the residential or non-residential parent?
                  </p>
                  <div className="radio-group">
                    {[
                      { value: 'residential',    label: 'I am the residential parent' },
                      { value: 'nonresidential', label: 'I am the non-residential parent' },
                    ].map(({ value, label }) => (
                      <label key={value} className={`radio-option${parentRole === value ? ' radio-option--checked' : ''}`}>
                        <input
                          type="radio"
                          name="parentRole"
                          value={value}
                          checked={parentRole === value}
                          onChange={() => { update({ parentRole: value }); clearError('parentRole'); }}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.parentRole && (
                    <p className="text-input__error-message">{errors.parentRole}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Step 1: Which children will you claim at some point? ── */}
            <div className="info-section">
              <div className="info-section__header">
                <div className="info-section__icon"
                  style={{ color: '#1bb0dd', backgroundColor: '#1bb0dd1a' }}>
                  <FileTextIcon />
                </div>
                <div>
                  <p className="info-section__title">Children You Plan to Claim</p>
                  <p className="info-section__description">
                    Select all children you plan to claim on your taxes at any point — even if only in certain years.
                  </p>
                </div>
              </div>
              <Card>
                <CardContent>
                  <p className="parent-label">
                    Which children do you plan to claim on your tax forms (now or in the future)?
                  </p>
                  {allChildNames.length === 0 ? (
                    <p className="text-input__error-message">No children found. Please go back and add children first.</p>
                  ) : (
                    <div className="tax-child-list">
                      {allChildNames.map(name => (
                        <label key={name} className={`radio-option${claimingChildren.includes(name) ? ' radio-option--checked' : ''}`}>
                          <input
                            type="checkbox"
                            className="tax-checkbox"
                            checked={claimingChildren.includes(name)}
                            onChange={() => toggleChild(name)}
                          />
                          <span>{name}</span>
                          {claimingChildren.includes(name) && childAnswers[name]?.intent && (
                            <span className="child-answer-badge">
                              <CheckCircleIcon />
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                  {errors.claimingChildren && (
                    <p className="text-input__error-message">{errors.claimingChildren}</p>
                  )}

                  {allChildNames.length > 0 && claimingChildren.length === 0 && (
                    <p className="tax-none-note">
                      If you do not plan to claim any children, leave all boxes unchecked and proceed to the next step.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Step 2: Per-child questions ── */}
            {showChildQuestions && (
              <div className="info-section">
                <div className="info-section__header">
                  <div className="info-section__icon"
                    style={{ color: '#55c77e', backgroundColor: '#55c77e1a' }}>
                    <FileTextIcon />
                  </div>
                  <div>
                    <p className="info-section__title">Tax Claiming Details</p>
                    <p className="info-section__description">
                      For each child you selected, indicate how you will claim them.
                    </p>
                  </div>
                </div>

                {claimingChildren.map((name, idx) => (
                  <ChildTaxBlock
                    key={name}
                    childName={name}
                    childIndex={name}
                    childData={childAnswers[name] ?? {}}
                    parentRole={parentRole}
                    onUpdate={(_, payload) => updateChildAnswer(name, payload)}
                    errors={(childAnswers[name] ?? {}).errors ?? {}}
                  />
                ))}
              </div>
            )}

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