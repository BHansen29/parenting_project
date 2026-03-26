import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dropdown from '../../../src/components/forms/Dropdown';

describe('Dropdown', () => {
  const defaultOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  // Basic rendering
  it('renders without crashing', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
  });

  it('renders with label', () => {
    render(<Dropdown label="Test Dropdown" value="" onChange={() => {}} options={defaultOptions} />);
    expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
  });

  it('shows placeholder when no value selected', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} placeholder="Choose an option" />);
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('shows selected option label when value is set', () => {
    render(<Dropdown value="option2" onChange={() => {}} options={defaultOptions} />);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  // Opening and closing
  it('dropdown menu is closed by default', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens dropdown menu when button is clicked', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes dropdown when button is clicked again', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown when Escape key is pressed', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // Options rendering
  it('renders all options when opened', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('shows "No options available" when options array is empty', () => {
    render(<Dropdown value="" onChange={() => {}} options={[]} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  // Selection
  it('calls onChange when an option is selected', () => {
    const onChange = vi.fn();
    render(<Dropdown value="" onChange={onChange} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    const option2 = screen.getByText('Option 2');
    fireEvent.click(option2);
    expect(onChange).toHaveBeenCalledWith('option2');
  });

  it('closes dropdown after selecting an option', () => {
    const onChange = vi.fn();
    render(<Dropdown value="" onChange={onChange} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks selected option with aria-selected', () => {
    render(<Dropdown value="option2" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
  });

  // Required field
  it('shows required asterisk when required is true', () => {
    render(<Dropdown label="Test" value="" onChange={() => {}} options={defaultOptions} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  // Error and help text
  it('displays error message when error prop is provided', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} error="This field has an error" />);
    expect(screen.getByText('This field has an error')).toBeInTheDocument();
  });

  it('displays help text when provided', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} helpText="This is help text" />);
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('does not show help text when error is present', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} helpText="Help text" error="Error" />);
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  // ARIA attributes
  it('sets aria-haspopup on button', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('sets aria-expanded to true when open', () => {
    render(<Dropdown value="" onChange={() => {}} options={defaultOptions} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
