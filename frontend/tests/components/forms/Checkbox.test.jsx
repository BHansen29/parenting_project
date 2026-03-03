import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Checkbox from '../../../src/components/forms/Checkbox';

describe('Checkbox', () => {
  // Basic rendering
  it('renders without crashing', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} />);
  });

  it('renders with label', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} />);
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Checkbox id="test" checked={false} onChange={() => {}} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  // Checked state
  it('is unchecked by default', () => {
    render(<Checkbox id="test" label="Test Label" onChange={() => {}} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('is checked when checked prop is true', () => {
    render(<Checkbox id="test" label="Test Label" checked={true} onChange={() => {}} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onChange with true when unchecked checkbox is clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when checked checkbox is clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox id="test" label="Test Label" checked={true} onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  // Required field
  it('shows required asterisk when required is true', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} required />);
    expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
  });

  it('has required attribute when required is true', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} required />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeRequired();
  });

  // Disabled state
  it('is disabled when disabled prop is true', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={onChange} disabled />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });

  // Description
  it('renders description when provided', () => {
    render(<Checkbox id="test" label="Test Label" description="Test description" checked={false} onChange={() => {}} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  // Error handling
  it('displays error message when error prop is provided', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} error="This field has an error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field has an error');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} error="Error" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby to error id when error is present', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} error="Error" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-describedby', 'test-error');
  });

  // Help text
  it('displays help text when provided', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} helpText="This is help text" />);
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('does not show help text when error is present', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} helpText="Help text" error="Error" />);
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('sets aria-describedby to help id when help text is present without error', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} helpText="Help" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-describedby', 'test-help');
  });

  // Name and value attributes
  it('sets name attribute', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} name="test-name" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('name', 'test-name');
  });

  it('sets value attribute', () => {
    render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} value="test-value" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('value', 'test-value');
  });

  // Variants
  it('applies card variant class when variant is card', () => {
    const { container } = render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} variant="card" />);
    expect(container.querySelector('.checkbox--card')).toBeInTheDocument();
  });

  it('applies default variant when variant is default', () => {
    const { container } = render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} variant="default" />);
    expect(container.querySelector('.checkbox--card')).not.toBeInTheDocument();
  });

  // Custom className
  it('applies custom className', () => {
    const { container } = render(<Checkbox id="test" label="Test Label" checked={false} onChange={() => {}} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
