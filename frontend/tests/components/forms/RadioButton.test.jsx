import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RadioButton from '../../../src/components/forms/RadioButton';

describe('RadioButton', () => {
  // Basic rendering
  it('renders without crashing', () => {
    render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={() => {}} />);
  });

  it('renders with label', () => {
    render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={() => {}} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders radio input', () => {
    render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={() => {}} />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
  });

  // Checked state
  it('is unchecked when checked prop is false', () => {
    render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={() => {}} />);
    const radio = screen.getByRole('radio');
    expect(radio).not.toBeChecked();
  });

  it('is checked when checked prop is true', () => {
    render(<RadioButton name="test" value="option1" label="Option 1" checked={true} onChange={() => {}} />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeChecked();
  });

  // Name and value attributes
  it('sets name attribute correctly', () => {
    render(<RadioButton name="test-group" value="option1" label="Option 1" checked={false} onChange={() => {}} />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('name', 'test-group');
  });

  it('sets value attribute correctly', () => {
    render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={() => {}} />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('value', 'option1');
  });

  // Description
  it('renders description when provided', () => {
    render(<RadioButton name="test" value="option1" label="Option 1" description="This is option 1" checked={false} onChange={() => {}} />);
    expect(screen.getByText('This is option 1')).toBeInTheDocument();
  });

  it('renders without description when not provided', () => {
    const { container } = render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={() => {}} />);
    const description = container.querySelector('.radio-option-description');
    expect(description).toHaveTextContent('');
  });

  // onChange handler
  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={onChange} />);
    const radio = screen.getByRole('radio');
    fireEvent.click(radio);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when label is clicked', () => {
    const onChange = vi.fn();
    render(<RadioButton name="test" value="option1" label="Option 1" checked={false} onChange={onChange} />);
    const label = screen.getByText('Option 1');
    fireEvent.click(label);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // Radio button groups
  it('groups radio buttons with the same name', () => {
    render(
      <>
        <RadioButton name="test" value="option1" label="Option 1" checked={true} onChange={() => {}} />
        <RadioButton name="test" value="option2" label="Option 2" checked={false} onChange={() => {}} />
        <RadioButton name="test" value="option3" label="Option 3" checked={false} onChange={() => {}} />
      </>
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });
});
