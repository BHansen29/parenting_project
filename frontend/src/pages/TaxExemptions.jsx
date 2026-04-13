import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useNavigation } from '../context/NavigationContext';
import {
  ClaimEveryYearDisclaimers,
  ClaimSomeYearsDisclaimers,
  DeferDisclaimers,
} from './taxExemptions/TaxExemptionDisclaimers';
import './Page.css';
import './TaxExemptions.css';
import Checkbox from '../components/forms/Checkbox';
import RadioButton from '../components/forms/RadioButton';
import FlagButton from '../components/forms/FlagButton';
import { useSectionFlag } from '../hooks/useSectionFlag';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';

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

// ─── Constants ────────────────────────────────────────────────────────────────

const TAX_YEAR_OPTIONS = [
  { value: 'odd',    label: 'Odd-numbered tax years (e.g. 2025, 2027, 2029…)' },
  { value: 'even',   label: 'Even-numbered tax years (e.g. 2026, 2028, 2030…)' },
  { value: 'custom', label: 'Custom — I will specify the years' },
];

const PARENT_ROLE_OPTIONS = [
  { value: 'residential',    label: 'I am the residential parent' },
  { value: 'nonresidential', label: 'I am the non-residential parent' },
];

// ─── Per-child question block ─────────────────────────────────────────────────
// NOTE: ChildTaxBlock has conditional sub-questions and disclaimer components
// that don't map cleanly to RadioQuestion, so it keeps its hand-rolled structure.

function ChildTaxBlock({ childName, childIndex, childData = {}, parentRole, onUpdate, errors = {}, isFlagged, onToggleFlag }) {
  const intent      = childData.intent ?? '';
  const taxYears    = childData.taxYears ?? '';
  const customYears = childData.customYears ?? '';

  const showTaxYearQuestion      = intent === 'someYears';
  const showCustomYearInput      = showTaxYearQuestion && taxYears === 'custom';
  const showEveryYearDisclaimers = intent === 'everyYear' && !!parentRole;
  const showSomeYearsDisclaimers = intent === 'someYears' && !!taxYears && !!parentRole;
  const showDeferDisclaimers     = intent === 'defer' && !!parentRole;

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
        <CardHeader className="card-header-with-flag">
          <CardDescription className="card-heading-question-bold">
            How will you claim {childName} on tax forms?
          </CardDescription>
          <FlagButton isFlagged={isFlagged} onClick={onToggleFlag} />
        </CardHeader>
        <CardContent>
          <div className="radio-group">
            {[
              { value: 'everyYear', label: 'I will claim this child every year' },
              { value: 'someYears', label: 'I will claim this child some years (alternating or specific years)' },
              { value: 'defer',     label: 'I defer to my co-parent to claim this child' },
            ].map(({ value, label }) => (
              <RadioButton
                key={value}
                name={`intent-${childIndex}`}
                value={value}
                checked={intent === value}
                onChange={() => {
                  update({ intent: value, taxYears: '', customYears: '', errors: {} });
                  clearError('intent');
                }}
                label={label}
              />
            ))}
          </div>
          {errors.intent && (
            <p className="text-input__error-message">{errors.intent}</p>
          )}

          {showEveryYearDisclaimers && (
            <ClaimEveryYearDisclaimers parentRole={parentRole} />
          )}

          {showTaxYearQuestion && (
            <div className="child-tax-block__subanswer">
              <p className="parent-label">Which tax years will you claim {childName}?</p>
              <div className="radio-group">
                {TAX_YEAR_OPTIONS.map(({ value, label }) => (
                  <RadioButton
                    key={value}
                    name={`taxYears-${childIndex}`}
                    value={value}
                    checked={taxYears === value}
                    onChange={() => { update({ taxYears: value, customYears: '' }); clearError('taxYears'); }}
                    label={label}
                  />
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

          {showDeferDisclaimers && (
            <DeferDisclaimers parentRole={parentRole} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidYearList = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.split(',').map(p => p.trim()).every(p => /^\d{4}$/.test(p));
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function TaxExemptions() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();
  const { setOnNext, setOnBack } = useNavigation();

  const children         = state.plan?.children ?? [];
  const formData         = state.taxExemptions ?? {};
  const errors           = formData.errors ?? {};
  const parentRole       = formData.parentRole ?? '';
  const claimingChildren = formData.claimingChildren ?? [];
  const childAnswers     = formData.childAnswers ?? {};

  // ── Flag hooks ────────────────────────────────────────────────────────────
  const parentalRoleFlag     = useSectionFlag('taxParentalRole');
  const claimingChildrenFlag = useSectionFlag('taxClaimingChildren');

  const allChildNames = children.map((c, i) =>
    `${c.fName ?? c.firstName ?? ''} ${c.lName ?? c.lastName ?? ''}`.trim() || `Child ${i + 1}`
  );

  // ── Sync: remove deleted children from claimingChildren and childAnswers ──
  useEffect(() => {
    const removedFromClaiming = claimingChildren.filter(name => !allChildNames.includes(name));
    const removedFromAnswers  = Object.keys(childAnswers).filter(name => !allChildNames.includes(name));

    if (removedFromClaiming.length > 0 || removedFromAnswers.length > 0) {
      const nextClaimingChildren = claimingChildren.filter(name => allChildNames.includes(name));
      const nextChildAnswers = { ...childAnswers };
      removedFromAnswers.forEach(name => delete nextChildAnswers[name]);
      dispatch({
        type: 'UPDATE_SECTION',
        section: 'taxExemptions',
        payload: { claimingChildren: nextClaimingChildren, childAnswers: nextChildAnswers },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChildNames.join(',')]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const update = (payload) =>
    dispatch({ type: 'UPDATE_SECTION', section: 'taxExemptions', payload });

  const clearError = (field) => {
    if (errors[field]) update({ errors: { ...errors, [field]: '' } });
  };

  const toggleChild = (name) => {
    const next = claimingChildren.includes(name)
      ? claimingChildren.filter(n => n !== name)
      : [...claimingChildren, name];
    const nextAnswers = { ...childAnswers };
    if (claimingChildren.includes(name)) delete nextAnswers[name];
    update({ claimingChildren: next, childAnswers: nextAnswers, errors: { ...errors, claimingChildren: '' } });
  };

  const updateChildAnswer = (childName, payload) => {
    update({
      childAnswers: {
        ...childAnswers,
        [childName]: { ...(childAnswers[childName] ?? {}), ...payload },
      },
    });
  };

  // ── Validation ────────────────────────────────────────────────────────────
  // Reads directly from state to avoid stale closure in NavigationContext

  const validateForm = useCallback(() => {
    const current         = state.taxExemptions ?? {};
    const currentRole     = current.parentRole ?? '';
    const currentClaiming = current.claimingChildren ?? [];
    const currentAnswers  = current.childAnswers ?? {};

    const newErrors = {};
    if (!currentRole)
      newErrors.parentRole = 'Please indicate your parental role.';
    if (currentClaiming.length === 0)
      newErrors.claimingChildren = 'Please select at least one child, or indicate you are not claiming any.';

    const newChildAnswerErrors = { ...currentAnswers };
    currentClaiming.forEach(name => {
      const ans = currentAnswers[name] ?? {};
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
        newChildAnswerErrors[name] = { ...(currentAnswers[name] ?? {}), errors: childErrors };
    });

    dispatch({
      type: 'UPDATE_SECTION',
      section: 'taxExemptions',
      payload: { errors: newErrors, childAnswers: newChildAnswerErrors },
    });

    return Object.keys(newErrors).length === 0 &&
      currentClaiming.every(name => {
        const ans = currentAnswers[name] ?? {};
        if (!ans.intent) return false;
        if (ans.intent === 'someYears' && !ans.taxYears) return false;
        if (ans.intent === 'someYears' && ans.taxYears === 'custom') {
          if (!ans.customYears?.trim() || !isValidYearList(ans.customYears)) return false;
        }
        return true;
      });
  }, [state]);

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleNext = useCallback(() => {
    if (validateForm()) {
      navigate('/review');
    } else {
      setSubmitAttempted(true);
    }
  }, [validateForm, state]);

  const handleBack = useCallback(() => {
    update({ errors: {} });
    navigate('/informationsharing');
  }, []);

  useEffect(() => {
    setOnNext(handleNext);
    setOnBack(handleBack);
  }, [handleNext, handleBack]);

  useEffect(() => {
    if (submitAttempted) {
      const firstError = document.querySelector('.text-input__error-message');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSubmitAttempted(false);
    }
  }, [formData, submitAttempted]);

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

            <hr className="section-divider" />

            {/* ── Parental Role ──
                SectionHeader replaces the hand-rolled icon + title + description div.
                RadioQuestion replaces the hand-rolled Card + FlagButton + RadioButton loop.
                onChange receives a plain string value — RadioQuestion unwraps the event internally. */}
            <SectionHeader
              icon={<FileTextIcon />}
              iconClassName="file-icon"
              title="Your Parental Role"
              intro="This determines which tax forms and deadlines apply to you."
            />
            <RadioQuestion
              question="Are you the residential or non-residential parent?"
              name="parentRole"
              value={parentRole}
              onChange={(value) => { update({ parentRole: value }); clearError('parentRole'); }}
              flag={parentalRoleFlag}
              error={errors.parentRole}
              options={PARENT_ROLE_OPTIONS}
              disclaimer="Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer."
              disclaimerVariant="info"
            />

            <hr className="section-divider" />

            {/* ── Children to Claim ──
                SectionHeader replaces the hand-rolled icon + title + description div.
                The flag is passed to SectionHeader directly via its flag prop.
                The checkbox list doesn't map to a shared component so it stays as-is. */}
            <SectionHeader
              icon={<FileTextIcon />}
              iconClassName="file-icon"
              title="Children You Plan to Claim"
              intro="Select all children you plan to claim on your taxes at any point — even if only in certain years."
              flag={claimingChildrenFlag}
            />
            <Card>
              <CardHeader>
                <CardDescription className="card-heading-question-bold">
                  Which children do you plan to claim on your tax forms (now or in the future)?
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allChildNames.length === 0 ? (
                  <p className="text-input__error-message">
                    No children found. Please go back and add children first.
                  </p>
                ) : (
                  <div className="tax-child-list">
                    {allChildNames.map(name => (
                      <Checkbox
                        key={name}
                        id={`claim-child-${name}`}
                        name="claimingChildren"
                        value={name}
                        label={name}
                        checked={claimingChildren.includes(name)}
                        onChange={() => toggleChild(name)}
                        variant="card"
                      />
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

            {/* ── Per-child details ──
                ChildTaxBlock has conditional sub-questions and disclaimers that don't
                map cleanly to the shared components, so it keeps its own structure. */}
            {claimingChildren.length > 0 && (
              <>
                <hr className="section-divider" />
                <SectionHeader
                  icon={<FileTextIcon />}
                  iconClassName="file-icon"
                  title="Tax Claiming Details"
                  intro="For each child you selected, indicate how you will claim them."
                />
                {claimingChildren.map((name) => (
                  <ChildTaxBlock
                    key={name}
                    childName={name}
                    childIndex={name}
                    childData={childAnswers[name] ?? {}}
                    parentRole={parentRole}
                    onUpdate={(_, payload) => updateChildAnswer(name, payload)}
                    errors={(childAnswers[name] ?? {}).errors ?? {}}
                    isFlagged={childAnswers[name]?.flagged ?? false}
                    onToggleFlag={() => updateChildAnswer(name, { flagged: !childAnswers[name]?.flagged })}
                  />
                ))}
              </>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}