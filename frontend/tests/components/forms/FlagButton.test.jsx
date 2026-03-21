import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FlagButton from '../../../src/components/forms/FlagButton';

describe('FlagButton', () => {
  // Basic rendering
  it('renders without crashing', () => {
    render(<FlagButton isFlagged={false} onClick={() => {}} />);
  });

  it('renders as button element', () => {
    render(<FlagButton isFlagged={false} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  // Unflagged state
  it('shows "Flag Item" text when not flagged', () => {
    render(<FlagButton isFlagged={false} onClick={() => {}} />);
    expect(screen.getByText('Flag Item')).toBeInTheDocument();
  });

  it('has correct aria-label when not flagged', () => {
    render(<FlagButton isFlagged={false} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Flag item');
  });

  it('applies unflagged class when isFlagged is false', () => {
    render(<FlagButton isFlagged={false} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flag-button');
  });

  // Flagged state
  it('shows "Flagged" text when flagged', () => {
    render(<FlagButton isFlagged={true} onClick={() => {}} />);
    expect(screen.getByText('Flagged')).toBeInTheDocument();
  });

  it('has correct aria-label when flagged', () => {
    render(<FlagButton isFlagged={true} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Unflag item');
  });

  it('applies flagged class when isFlagged is true', () => {
    render(<FlagButton isFlagged={true} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flag-button--flagged');
  });

  // onClick handler
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FlagButton isFlagged={false} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when flagged button is clicked', () => {
    const onClick = vi.fn();
    render(<FlagButton isFlagged={true} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Icon rendering
  it('renders flag icon', () => {
    const { container } = render(<FlagButton isFlagged={false} onClick={() => {}} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
