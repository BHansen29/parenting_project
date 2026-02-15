import './DatePicker.css';

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
