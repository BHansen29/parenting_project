import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import ChildCheckboxList from '../components/forms/ChildCheckboxList';
import {
  IntentRadioGroup,
  ClaimEveryYearDisclaimers,
  ClaimSomeYearsDisclaimers,
  DeferDisclaimers,
} from './taxExemptions/TaxExemptionDisclaimers';
import RemainingChildrenLoopBack from './taxExemptions/RemainingChildrenLoopBack';
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

const TAX_YEAR_OPTIONS = [
  { value: 'odd',    label: 'Odd-numbered tax years (e.g. 2025, 2027, 2029…)' },
  { value: 'even',   label: 'Even-numbered tax years (e.g. 2026, 2028, 2030…)' },
  { value: 'custom', label: 'Custom — I will specify the years' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function TaxExemptions() {
  const navigate = useNavigate();
  const { state, dispatch } = useForm();

  const children = state.children ?? [];
  const formData = state.taxExemptions ?? {};
  const errors   = state.taxExemptions?.errors ?? {};

  const parentRole        = formData.parentRole ?? '';
  const claimIntent       = formData.claimIntent ?? '';
  const everyYearSelected = formData.everyYearSelected ?? [];
  const someYearsSelected = formData.someYearsSelected ?? [];
  const taxYears          = formData.taxYears ?? '';
  const customYears       = formData.customYears ?? '';

  const allChildNames = children.map(c =>
    `${c.firstName} ${c.lastName}`.trim() || `Child ${c.id}`
  );

  const update = (payload) =>
    dispatch({ type: 'UPDATE_SECTION', section: 'taxExemptions', payload });

  const clearError = (field) => {
    if (errors[field]) update({ errors: { ...errors, [field]: '' } });
  };

  // ── Derived visibility flags ──────────────────────────────────────────────

  const showEveryYearSection     = claimIntent === 'everyYear';
  const showSomeYearsSection     = claimIntent === 'someYears';
  const showDeferSection         = claimIntent === 'defer';

  const everyYearAllSelected     = everyYearSelected.length === allChildNames.length && allChildNames.length > 0;
  const everyYearRemaining       = allChildNames.filter(n => !everyYearSelected.includes(n));
  const showEveryYearLoopBack    = showEveryYearSection && everyYearSelected.length > 0 && !everyYearAllSelected;
  const showEveryYearDisclaimers = showEveryYearSection && everyYearSelected.length > 0 && !!parentRole;

  const someYearsAllSelected     = someYearsSelected.length === allChildNames.length && allChildNames.length > 0;
  const someYearsRemaining       = allChildNames.filter(n => !someYearsSelected.includes(n));
  const showSomeYearsLoopBack    = showSomeYearsSection && someYearsSelected.length > 0 && !someYearsAllSelected;
  const showTaxYearQuestion      = showSomeYearsSection && someYearsSelected.length > 0;
  const showCustomYearInput      = showTaxYearQuestion && taxYears === 'custom';
  const showSomeYearsDisclaimers = showTaxYearQuestion && !!taxYears && !!parentRole;

  // ── Validation ────────────────────────────────────────────────────────────

  const validateForm = () => {
    const newErrors = {};
    if (!parentRole)  newErrors.parentRole  = 'Please indicate your parental role.';
    if (!claimIntent) newErrors.claimIntent = 'Please select an option.';

    if (claimIntent === 'everyYear' && everyYearSelected.length === 0)
      newErrors.everyYearSelected = 'Please select at least one child.';

    if (claimIntent === 'someYears') {
      if (someYearsSelected.length === 0)
        newErrors.someYearsSelected = 'Please select at least one child.';
      if (!taxYears)
        newErrors.taxYears = 'Please select which tax years you will claim.';
      if (taxYears === 'custom' && !customYears.trim())
        newErrors.customYears = 'Please enter the tax years (e.g. 2025, 2027, 2029).';
    }

    update({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateForm()) navigate('/review'); };
  const handleBack = () => { update({ errors: {} }); navigate('/informationsharing'); };

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
                      <label key={value} className="radio-option">
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

            {/* ── 6.a — Main intent ── */}
            <div className="info-section">
              <div className="info-section__header">
                <div className="info-section__icon"
                  style={{ color: '#1bb0dd', backgroundColor: '#1bb0dd1a' }}>
                  <FileTextIcon />
                </div>
                <div>
                  <p className="info-section__title">Tax Claiming Intent</p>
                  <p className="info-section__description">
                    Will you claim your children on tax forms?
                  </p>
                </div>
              </div>
              <Card>
                <CardContent>
                  <p className="parent-label">
                    Do you want to claim your children on any tax forms every year?
                  </p>
                  <IntentRadioGroup
                    name="claimIntent"
                    value={claimIntent}
                    onChange={(val) => update({
                      claimIntent: val,
                      everyYearSelected: [],
                      someYearsSelected: [],
                      taxYears: '',
                      customYears: '',
                      remainingEveryYearIntent: '',
                      remainingEveryYearTaxYears: '',
                      remainingEveryYearCustomYears: '',
                      remainingSomeYearsIntent: '',
                      remainingSomeYearsTaxYears: '',
                      remainingSomeYearsCustomYears: '',
                      errors: {},
                    })}
                  />
                  {errors.claimIntent && (
                    <p className="text-input__error-message">{errors.claimIntent}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── 6.b — Every year: child selection + disclaimers ── */}
            {showEveryYearSection && (
              <div className="info-section">
                <div className="info-section__header">
                  <div className="info-section__icon"
                    style={{ color: '#55c77e', backgroundColor: '#55c77e1a' }}>
                    <FileTextIcon />
                  </div>
                  <div>
                    <p className="info-section__title">Select Children — Every Year</p>
                    <p className="info-section__description">
                      Please select which children you will be claiming each year.
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent>
                    <ChildCheckboxList
                      children={children}
                      selected={everyYearSelected}
                      onChange={(val) => { update({ everyYearSelected: val }); clearError('everyYearSelected'); }}
                      label="Which children will you claim every year?"
                    />
                    {errors.everyYearSelected && (
                      <p className="text-input__error-message">{errors.everyYearSelected}</p>
                    )}
                    {showEveryYearDisclaimers && (
                      <ClaimEveryYearDisclaimers parentRole={parentRole} />
                    )}
                  </CardContent>
                </Card>

                {showEveryYearLoopBack && (
                  <RemainingChildrenLoopBack
                    selectedChildren={everyYearSelected}
                    remainingChildren={everyYearRemaining}
                    intentKey="remainingEveryYearIntent"
                    taxYearsKey="remainingEveryYearTaxYears"
                    customYearsKey="remainingEveryYearCustomYears"
                    formData={formData}
                    parentRole={parentRole}
                    onUpdate={update}
                  />
                )}
              </div>
            )}

            {/* ── 6.c — Some years: child selection + tax year question + disclaimers ── */}
            {showSomeYearsSection && (
              <div className="info-section">
                <div className="info-section__header">
                  <div className="info-section__icon"
                    style={{ color: '#ff9c27', backgroundColor: '#ff9c271a' }}>
                    <FileTextIcon />
                  </div>
                  <div>
                    <p className="info-section__title">Select Children — Some Years</p>
                    <p className="info-section__description">
                      Please select which children you plan to claim on future tax forms.
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent>
                    <ChildCheckboxList
                      children={children}
                      selected={someYearsSelected}
                      onChange={(val) => { update({ someYearsSelected: val }); clearError('someYearsSelected'); }}
                      label="Which children will you claim some years?"
                    />
                    {errors.someYearsSelected && (
                      <p className="text-input__error-message">{errors.someYearsSelected}</p>
                    )}
                  </CardContent>
                </Card>

                {/* 6.c.ii — Which tax years */}
                {showTaxYearQuestion && (
                  <Card>
                    <CardContent>
                      <p className="parent-label">
                        Which tax years will you claim your children on?
                      </p>
                      <div className="radio-group">
                        {TAX_YEAR_OPTIONS.map(({ value, label }) => (
                          <label key={value} className="radio-option">
                            <input
                              type="radio"
                              name="taxYears"
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
                          <label className="parent-label" htmlFor="customYears">
                            Enter the tax years you will claim (comma-separated)
                          </label>
                          <input
                            id="customYears"
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
                    </CardContent>
                  </Card>
                )}

                {showSomeYearsLoopBack && (
                  <RemainingChildrenLoopBack
                    selectedChildren={someYearsSelected}
                    remainingChildren={someYearsRemaining}
                    intentKey="remainingSomeYearsIntent"
                    taxYearsKey="remainingSomeYearsTaxYears"
                    customYearsKey="remainingSomeYearsCustomYears"
                    formData={formData}
                    parentRole={parentRole}
                    onUpdate={update}
                  />
                )}
              </div>
            )}

            {/* ── 6.d — Defer disclaimers ── */}
            {showDeferSection && parentRole && (
              <div className="info-section">
                <Card>
                  <CardContent>
                    <p className="parent-label">You have decided to defer to your co-parent.</p>
                    <DeferDisclaimers parentRole={parentRole} />
                  </CardContent>
                </Card>
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