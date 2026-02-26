// Handles the loop-back question shown when a user selects only some children
// in 6.b or 6.c. Renders the 6.a intent question for the remaining children,
// then shows the appropriate follow-up questions and disclaimers based on
// what the user picks.
//
// Props:
//   selectedChildren:   string[] — names of already-selected children
//   remainingChildren:  string[] — names of children not yet assigned
//   intentKey:          string   — formData key for this loop-back's intent value
//   taxYearsKey:        string   — formData key for tax year selection
//   customYearsKey:     string   — formData key for custom year input
//   formData:           object   — full taxExemptions slice of form context
//   parentRole:         string   — 'residential' | 'nonresidential'
//   onUpdate:           (payload) => void

import { Card, CardContent } from '../../components/common/card';
import {
  IntentRadioGroup,
  ClaimEveryYearDisclaimers,
  ClaimSomeYearsDisclaimers,
  DeferDisclaimers,
} from './TaxExemptionDisclaimers';

const TAX_YEAR_OPTIONS = [
  { value: 'odd',    label: 'Odd-numbered tax years (e.g. 2025, 2027, 2029…)' },
  { value: 'even',   label: 'Even-numbered tax years (e.g. 2026, 2028, 2030…)' },
  { value: 'custom', label: 'Custom — I will specify the years' },
];

export default function RemainingChildrenLoopBack({
  selectedChildren,
  remainingChildren,
  intentKey,
  taxYearsKey,
  customYearsKey,
  formData,
  parentRole,
  onUpdate,
}) {
  const intent      = formData[intentKey] ?? '';
  const taxYears    = formData[taxYearsKey] ?? '';
  const customYears = formData[customYearsKey] ?? '';

  const remainingLabel = remainingChildren.length === 1
    ? remainingChildren[0]
    : remainingChildren.join(', ');

  const selectedLabel = selectedChildren.join(', ');

  return (
    <div className="tax-loopback">
      <p className="tax-loopback__label">
        You selected <strong>{selectedLabel}</strong> for the previous option.
        For the remaining <strong>{remainingLabel}</strong>, do you plan to
        claim them going forward?
      </p>

      <Card>
        <CardContent>
          {/* 6.a intent question for remaining children */}
          <IntentRadioGroup
            name={intentKey}
            value={intent}
            onChange={(val) => onUpdate({
              [intentKey]: val,
              [taxYearsKey]: '',
              [customYearsKey]: '',
            })}
          />

          {/* → every year: show disclaimers */}
          {intent === 'everyYear' && (
            <ClaimEveryYearDisclaimers parentRole={parentRole} />
          )}

          {/* → some years: show tax year question + optional custom input + disclaimers */}
          {intent === 'someYears' && (
            <>
              <p className="parent-label" style={{ marginTop: '1.25rem' }}>
                Which tax years will you claim <strong>{remainingLabel}</strong>?
              </p>
              <div className="radio-group">
                {TAX_YEAR_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="radio-option">
                    <input
                      type="radio"
                      name={taxYearsKey}
                      value={value}
                      checked={taxYears === value}
                      onChange={() => onUpdate({ [taxYearsKey]: value, [customYearsKey]: '' })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {taxYears === 'custom' && (
                <div className="tax-custom-years">
                  <label className="parent-label" htmlFor={customYearsKey}>
                    Enter the tax years you will claim (comma-separated)
                  </label>
                  <input
                    id={customYearsKey}
                    type="text"
                    className="tax-custom-years__input"
                    placeholder="e.g. 2025, 2027, 2029"
                    value={customYears}
                    onChange={(e) => onUpdate({ [customYearsKey]: e.target.value })}
                  />
                </div>
              )}

              {taxYears && (
                <ClaimSomeYearsDisclaimers taxYears={taxYears} parentRole={parentRole} />
              )}
            </>
          )}

          {/* → defer: show defer disclaimers */}
          {intent === 'defer' && parentRole && (
            <DeferDisclaimers parentRole={parentRole} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}