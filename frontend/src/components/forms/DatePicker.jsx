import './DatePicker.css';

/**
 * 
 * @param {id} param0 -The unique identifier for the date input field, used for associating the label and error/help text.
 * @param {label} param1 -The text label for the date input field, displayed above the input.
 * @param {value} param2 -The current value of the date input field, expected in 'YYYY-MM-DD' format.
 * @param {onChange} param3 -The function to call when the date value changes, receiving the new value as an argument.
 * @param {required} param4 -Whether the date input field is required, which adds an asterisk to the label and sets the required attribute on the input.
 * @param {disabled} param5 -If true, the date input field will be disabled and styled accordingly.
 * @param {error} param6 -An error message to display below the input field if there's a validation error, which also adds error styling to the component.
 * @param {min} param7 -The minimum date allowed for selection, in 'YYYY-MM-DD' format, which sets the min attribute on the input.
 * @param {max} param8 -The maximum date allowed for selection, in 'YYYY-MM-DD' format, which sets the max attribute on the input.
 * @param {helpText} param9 -The help text to display below the input field when there is no error, providing additional guidance to the user.
 * @param {className} param10 -The additional class names to apply to the component for custom styling, which are combined with the default classes.
 * 
  DatePicker component that renders a styled date input field with a label, error message, and help text.
  It accepts props for id, label, value, onChange handler, required state, disabled state, error message, min/max dates, help text, and additional class names for styling.

 * @returns The DatePicker component
 */
export default function DatePicker({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error = '',
  min,
  max,
  helpText = '',
  className = '',
}) {
  const wrapperClasses = [
    'date-picker',
    error && 'date-picker--error',
    disabled && 'date-picker--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <label htmlFor={id} className="date-picker__label">
        {label}
        {required && <span className="date-picker__label-required" aria-label="required">*</span>}
      </label>

      <input
        type="date"
        id={id}
        className="date-picker__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
      />

      {error && (
        <span id={`${id}-error`} className="date-picker__error-message" role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${id}-help`} className="date-picker__help-text">
          {helpText}
        </span>
      )}
    </div>
  );
}
