import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './Dropdown.css';

/**
 * Dropdown component with button trigger and menu
 * @param {string} label - Optional label for the dropdown
 * @param {string} buttonText - Text to display on the button
 * @param {string} value - Currently selected value
 * @param {function} onChange - Callback when an item is selected
 * @param {array} options - Array of options {value, label}
 * @param {string} placeholder - Placeholder text when no value is selected
 * @param {boolean} required - Whether the dropdown is required
 * @param {string} error - Error message to display
 * @param {string} helpText - Help text to display below the dropdown
 * @param {string} id - Unique identifier for the dropdown
 */
export default function Dropdown({
  label,
  buttonText,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  helpText,
  id,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const dropdownClasses = [
    'dropdown',
    error ? 'dropdown--error' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={dropdownClasses} ref={dropdownRef}>
      {label && (
        <label className="dropdown__label" htmlFor={id}>
          {label}
          {required && <span className="dropdown__label-required">*</span>}
        </label>
      )}

      <DropdownButton
        id={id}
        text={displayText}
        isOpen={isOpen}
        onClick={handleToggle}
        hasValue={!!value}
        {...props}
      />

      {isOpen && (
        <DropdownMenu>
          {options.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => handleSelect(option.value)}
              isSelected={option.value === value}
            >
              {option.label}
            </DropdownItem>
          ))}
          {options.length === 0 && (
            <div className="dropdown__empty">No options available</div>
          )}
        </DropdownMenu>
      )}

      {error && <div className="dropdown__error-message">{error}</div>}
      {helpText && !error && <div className="dropdown__help-text">{helpText}</div>}
    </div>
  );
}

function DropdownButton({ className, text, isOpen, hasValue, ...props }) {
  const buttonClasses = [
    'dropdown__button',
    isOpen ? 'dropdown__button--open' : '',
    !hasValue ? 'dropdown__button--placeholder' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={buttonClasses}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      {...props}
    >
      <span className="dropdown__button-text">{text}</span>
      <ChevronDown
        className={`dropdown__button-icon ${isOpen ? 'dropdown__button-icon--rotated' : ''}`}
        size={20}
      />
    </button>
  );
}

function DropdownMenu({ className, children, ...props }) {
  return (
    <div
      role="listbox"
      data-slot="dropdown-menu"
      className={`dropdown__menu ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownItem({ className, isSelected, children, onClick, ...props }) {
  const itemClasses = [
    'dropdown__item',
    isSelected ? 'dropdown__item--selected' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-slot="dropdown-item"
      className={itemClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownDivider({ className, ...props }) {
  return (
    <hr
      data-slot="dropdown-divider"
      className={`dropdown__divider ${className || ''}`}
      {...props}
    />
  );
}

export {
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownDivider
};
