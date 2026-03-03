import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TextInput from '../../../src/components/forms/TextInput';

describe('TextInput', () => {
  // Basic rendering
  it('renders without crashing', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} />);
  });

  it('renders with label', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} />);
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
  });

  it('renders as input by default', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} />);
    const input = screen.getByLabelText(/test label/i);
    expect(input.tagName).toBe('INPUT');
  });

  it('renders as textarea when type is textarea', () => {
    render(<TextInput id="test" label="Test Label" type="textarea" value="" onChange={() => {}} />);
    const textarea = screen.getByLabelText(/test label/i);
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  // Value and onChange
  it('displays the provided value', () => {
    render(<TextInput id="test" label="Test Label" value="Test Value" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<TextInput id="test" label="Test Label" value="" onChange={onChange} />);
    const input = screen.getByLabelText(/test label/i);
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  // Required field
  it('shows required asterisk when required is true', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} required />);
    expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
  });

  it('has required attribute when required is true', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} required />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toBeRequired();
  });

  // Disabled state
  it('is disabled when disabled prop is true', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} disabled />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toBeDisabled();
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<TextInput id="test" label="Test Label" value="" onChange={onChange} disabled />);
    const input = screen.getByLabelText(/test label/i);
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  // Placeholder
  it('renders with placeholder', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  // Error handling
  it('displays error message when error prop is provided', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} error="This field has an error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field has an error');
  });

  it('sets aria-invalid when error is present', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} error="Error" />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby to error id when error is present', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} error="Error" />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('aria-describedby', 'test-error');
  });

  // Help text
  it('displays help text when provided', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} helpText="This is help text" />);
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('does not show help text when error is present', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} helpText="Help text" error="Error" />);
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('sets aria-describedby to help id when help text is present without error', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} helpText="Help" />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('aria-describedby', 'test-help');
  });

  // MaxLength
  it('respects maxLength attribute', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} maxLength={10} />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('maxLength', '10');
  });

  // Textarea rows
  it('sets rows attribute for textarea', () => {
    render(<TextInput id="test" label="Test Label" type="textarea" value="" onChange={() => {}} rows={6} />);
    const textarea = screen.getByLabelText(/test label/i);
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('uses default 4 rows for textarea when rows not specified', () => {
    render(<TextInput id="test" label="Test Label" type="textarea" value="" onChange={() => {}} />);
    const textarea = screen.getByLabelText(/test label/i);
    expect(textarea).toHaveAttribute('rows', '4');
  });

  // AutoComplete
  it('sets autoComplete attribute', () => {
    render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} autoComplete="email" />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  // Custom className
  it('applies custom className', () => {
    const { container } = render(<TextInput id="test" label="Test Label" value="" onChange={() => {}} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
