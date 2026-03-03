import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import ScheduleBuilder from '../../../src/components/forms/ScheduleBuilder';

describe('ScheduleBuilder', () => {
  const mockOnScheduleChange = vi.fn();

  beforeEach(() => {
    mockOnScheduleChange.mockClear();
  });

  // Basic rendering
  it('renders without crashing', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
  });

  it('renders week headers', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('renders all 4 weeks', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    expect(screen.getByText('Week 1')).toBeInTheDocument();
    expect(screen.getByText('Week 2')).toBeInTheDocument();
    expect(screen.getByText('Week 3')).toBeInTheDocument();
    expect(screen.getByText('Week 4')).toBeInTheDocument();
  });

  it('renders 28 day cells (4 weeks × 7 days)', () => {
    const { container } = render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = container.querySelectorAll('[class*="schedule-builder__day"]');
    expect(dayCells.length).toBe(28);
  });

  // Day clicking and modal
  it('opens modal when clicking on a day', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
    fireEvent.click(dayCells[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('modal shows correct day label', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
    fireEvent.click(dayCells[0]); // First Sunday
    expect(screen.getByText(/Week 1 - Sunday/i)).toBeInTheDocument();
  });

  it('closes modal when clicking close button', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
    fireEvent.click(dayCells[0]);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // Adding time slots
  it('shows "Add Time Slot" button in modal', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
    fireEvent.click(dayCells[0]);
    expect(screen.getByRole('button', { name: /add time slot/i })).toBeInTheDocument();
  });

  // Parent selection
  it('shows parent selection radio buttons in modal', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
    fireEvent.click(dayCells[0]);
    expect(screen.getByLabelText(/parent 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parent 2/i)).toBeInTheDocument();
  });

  // Whole day checkbox
  it('shows whole day checkbox in modal', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
    fireEvent.click(dayCells[0]);
    expect(screen.getByLabelText(/whole day/i)).toBeInTheDocument();
  });

  // Existing schedule
  it('displays existing time slots for a day', () => {
    const schedule = {
      0: [
        { parent: 'parent1', timeFrame: '9:00 AM - 12:00 PM', wholeDay: false }
      ]
    };
    render(<ScheduleBuilder schedule={schedule} onScheduleChange={mockOnScheduleChange} />);
    expect(screen.getByText('9:00 AM - 12:00 PM')).toBeInTheDocument();
  });

  it('shows multiple time slots for a day', () => {
    const schedule = {
      0: [
        { parent: 'parent1', timeFrame: '9:00 AM - 12:00 PM', wholeDay: false },
        { parent: 'parent2', timeFrame: '12:00 PM - 5:00 PM', wholeDay: false }
      ]
    };
    render(<ScheduleBuilder schedule={schedule} onScheduleChange={mockOnScheduleChange} />);
    expect(screen.getByText('9:00 AM - 12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM - 5:00 PM')).toBeInTheDocument();
  });

  // Empty state
  it('shows "Click to add" when day has no time slots', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const clickToAddElements = screen.getAllByText(/click to add/i);
    expect(clickToAddElements.length).toBeGreaterThan(0);
  });

  // Schedule change callback
  it('calls onScheduleChange when schedule is modified', () => {
    render(<ScheduleBuilder schedule={{}} onScheduleChange={mockOnScheduleChange} />);
    const dayCells = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
    fireEvent.click(dayCells[0]);

    // Add a time slot
    const addButton = screen.getByRole('button', { name: /add time slot/i });
    fireEvent.click(addButton);

    expect(mockOnScheduleChange).toHaveBeenCalled();
  });
});
