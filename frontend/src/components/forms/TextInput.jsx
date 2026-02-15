import './TextInput.css';

export default function TextInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  helpText = '',
  maxLength,
  autoComplete,
  rows = 4,
  className = '',
}) {
  const isTextarea = type === 'textarea';

  // Build className dynamically
  const wrapperClasses = [
    'text-input',
    error && 'text-input--error',
    disabled && 'text-input--disabled',
    className,
  ].filter(Boolean).join(' ');

  const fieldClasses = [
    'text-input__field',
    isTextarea && 'text-input__field--textarea',
  ].filter(Boolean).join(' ');

  // Common input props
  const inputProps = {
    id,
    className: fieldClasses,
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    required,
    disabled,
    maxLength,
    autoComplete,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : helpText ? `${id}-help` : undefined,
  };

  return (
    <div className={wrapperClasses}>
      <label htmlFor={id} className="text-input__label">
        {label}
        {required && <span className="text-input__label-required" aria-label="required">*</span>}
      </label>

      {isTextarea ? (
        <textarea {...inputProps} rows={rows} />
      ) : (
        <input {...inputProps} type={type} />
      )}

      {error && (
        <span id={`${id}-error`} className="text-input__error-message" role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${id}-help`} className="text-input__help-text">
          {helpText}
        </span>
      )}
    </div>
  );
}
