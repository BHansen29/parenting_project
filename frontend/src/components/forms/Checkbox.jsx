import './Checkbox.css';

/**
 * Checkbox component with optional label, description, error, and help text
 * @param {string} id - Unique identifier for the checkbox
 * @param {string} label - The label text for the checkbox
 * @param {string} description - Optional description text below the label
 * @param {boolean} checked - The checked state of the checkbox
 * @param {function} onChange - The function to call when the checkbox state changes
 * @param {boolean} required - Boolean indicating if the field is required
 * @param {boolean} disabled - Boolean indicating if the checkbox is disabled
 * @param {string} error - Error message to display if there's a validation error
 * @param {string} helpText - Additional help text to display below the checkbox
 * @param {string} value - The value attribute for the checkbox
 * @param {string} name - The name attribute for the checkbox
 * @param {string} variant - Styling variant: 'default' or 'card' (card has border like RadioButton)
 * @param {string} className - Additional class names for custom styling
 *
 * Checkbox component that renders a styled checkbox with optional label and description.
 * Supports two variants: 'default' (minimal) and 'card' (bordered like RadioButton).
 *
 * @returns Checkbox component
 */
export default function Checkbox({
  id,
  label,
  description,
  checked = false,
  onChange,
  required = false,
  disabled = false,
  error = '',
  helpText = '',
  value,
  name,
  variant = 'default',
  className = '',
}) {
  // Build className dynamically
  const wrapperClasses = [
    'checkbox',
    variant === 'card' && 'checkbox--card',
    error && 'checkbox--error',
    disabled && 'checkbox--disabled',
    checked && 'checkbox--checked',
    className,
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={wrapperClasses}>
      <label htmlFor={id} className="checkbox__label">
        <input
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className="checkbox__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        />

        <span className="checkbox__content">
          {label && (
            <span className="checkbox__label-text">
              {label}
              {required && <span className="checkbox__label-required" aria-label="required">*</span>}
            </span>
          )}

          {description && (
            <span className="checkbox__description">{description}</span>
          )}
        </span>
      </label>

      {error && (
        <span id={`${id}-error`} className="checkbox__error-message" role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${id}-help`} className="checkbox__help-text">
          {helpText}
        </span>
      )}
    </div>
  );
}
