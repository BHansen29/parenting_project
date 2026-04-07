import { Card, CardHeader, CardDescription, CardContent } from '../common/card';
import RadioButton from './RadioButton';
import FlagButton from './FlagButton';
import TextInput from './TextInput';

/**
 * A complete radio-button question card with optional flag, validation error,
 * and an optional conditional text input that appears when a specific option is selected.
 *
 * @param {string}   question          - The question text displayed in the card header
 * @param {string}   name              - The radio group name attribute
 * @param {string}   value             - The currently selected value
 * @param {function} onChange          - Called with the selected string value: (value: string) => void
 * @param {Array}    options           - [{ value, label, description? }]
 * @param {object}   flag              - Optional flag hook result: { isFlagged, toggleFlag }
 * @param {string}   error             - Optional validation error message
 * @param {object}   conditionalInput  - Optional text input shown when a specific option is chosen:
 *                                       { triggerValue, id, label, value, onChange, placeholder }
 */
export default function RadioQuestion({
  question,
  name,
  value,
  onChange,
  options,
  flag,
  error,
  conditionalInput,
}) {
  return (
    <Card>
      <CardHeader className={flag ? 'card-header-with-flag' : undefined}>
        <CardDescription className="card-heading-question-bold">
          {question}
        </CardDescription>
        {flag && (
          <FlagButton isFlagged={flag.isFlagged} onClick={flag.toggleFlag} />
        )}
      </CardHeader>

      <CardContent>
        <div className="radio-group">
          {options.map((option) => (
            <RadioButton
              key={option.value}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              label={option.label}
              description={option.description}
            />
          ))}

          {conditionalInput && value === conditionalInput.triggerValue && (
            <TextInput
              className="text-input-long-text"
              id={conditionalInput.id}
              label={conditionalInput.label}
              type="text"
              value={conditionalInput.value}
              onChange={conditionalInput.onChange}
              placeholder={conditionalInput.placeholder}
              error={conditionalInput.error}
            />
          )}
        </div>

        {error && (
          <div className="radio-group-error" role="alert">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
