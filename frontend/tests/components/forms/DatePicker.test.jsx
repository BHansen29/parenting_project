import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DatePicker from '../../../src/components/forms/DatePicker';

describe('DatePicker', () => {
  // Basic rendering
  it('renders without crashing', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} />);
  });

  it('renders with label', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} />);
    expect(screen.getByLabelText(/test date/i)).toBeInTheDocument();
  });

  it('renders date input', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toHaveAttribute('type', 'date');
  });

  // Value and onChange
  it('displays the provided value', () => {
    render(<DatePicker id="test" label="Test Date" value="2024-01-15" onChange={() => {}} />);
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<DatePicker id="test" label="Test Date" value="" onChange={onChange} />);
    const input = screen.getByLabelText(/test date/i);
    fireEvent.change(input, { target: { value: '2024-01-15' } });
    expect(onChange).toHaveBeenCalledWith('2024-01-15');
  });

  // Required field
  it('shows required asterisk when required is true', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} required />);
    expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
  });

  it('has required attribute when required is true', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} required />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toBeRequired();
  });

  // Disabled state
  it('is disabled when disabled prop is true', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} disabled />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toBeDisabled();
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<DatePicker id="test" label="Test Date" value="" onChange={onChange} disabled />);
    const input = screen.getByLabelText(/test date/i);
    fireEvent.change(input, { target: { value: '2024-01-15' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  // Min and max dates
  it('sets min attribute', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} min="2024-01-01" />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toHaveAttribute('min', '2024-01-01');
  });

  it('sets max attribute', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} max="2024-12-31" />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toHaveAttribute('max', '2024-12-31');
  });

  // Error handling
  it('displays error message when error prop is provided', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} error="This field has an error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field has an error');
  });

  it('sets aria-invalid when error is present', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} error="Error" />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby to error id when error is present', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} error="Error" />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toHaveAttribute('aria-describedby', 'test-error');
  });

  // Help text
  it('displays help text when provided', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} helpText="This is help text" />);
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('does not show help text when error is present', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} helpText="Help text" error="Error" />);
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('sets aria-describedby to help id when help text is present without error', () => {
    render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} helpText="Help" />);
    const input = screen.getByLabelText(/test date/i);
    expect(input).toHaveAttribute('aria-describedby', 'test-help');
  });

  // Custom className
  it('applies custom className', () => {
    const { container } = render(<DatePicker id="test" label="Test Date" value="" onChange={() => {}} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
