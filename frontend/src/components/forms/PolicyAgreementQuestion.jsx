import { Card, CardHeader, CardDescription, CardContent } from '../common/card';
import Checkbox from './Checkbox';
import TextInput from './TextInput';

/**
 * A policy agreement card: displays a titled policy list, a "I agree" checkbox,
 * and (when not agreed) an OR divider with a text input for a custom description.
 *
 * @param {string}   policyTitle       - Title shown above the policy bullet list
 * @param {string[]} policyItems       - Array of policy bullet point strings
 * @param {string}   checkboxId        - Unique DOM id for the checkbox input
 * @param {string}   checkboxLabel     - Label text for the agree checkbox
 * @param {boolean}  checked           - Whether the user has agreed to the standard policy
 * @param {function} onCheckboxChange  - Called with boolean when checkbox changes
 * @param {object}   textInput         - Config for the custom-description input:
 *                                       { id, label, value, onChange, placeholder, error? }
 */
export default function PolicyAgreementQuestion({
  policyTitle,
  policyItems,
  checkboxId,
  checkboxLabel,
  checked,
  onCheckboxChange,
  textInput,
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          <div className="policy-description-group">
            <h3 className="policy-title">{policyTitle}</h3>
            <ul className="policy-description-list">
              {policyItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Checkbox
          id={checkboxId}
          label={checkboxLabel}
          name={checkboxId}
          checked={checked}
          onChange={onCheckboxChange}
        />

        {!checked && (
          <div className="custom-description-section">
            <div className="or-divider">OR</div>
            <TextInput
              className="text-input-long-text"
              id={textInput.id}
              label={textInput.label}
              type="text"
              value={textInput.value}
              onChange={textInput.onChange}
              placeholder={textInput.placeholder}
            />
            {textInput.error && (
              <div className="text-input__error-message" role="alert">
                {textInput.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
