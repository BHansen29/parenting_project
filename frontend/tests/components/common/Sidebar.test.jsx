import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import Sidebar from '../../../src/components/common/Sidebar';
import { renderWithRouter } from '../../../src/utils/renderWithRouter';

describe('Sidebar', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  // Basic rendering
  it('renders without crashing', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
  });

  it('renders navigation list', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Parental Rights')).toBeInTheDocument();
    expect(screen.getByText('Parenting Time & Communication')).toBeInTheDocument();
    expect(screen.getByText('Information Sharing')).toBeInTheDocument();
    expect(screen.getByText('Tax Exemptions')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('renders toggle button', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleButton).toBeInTheDocument();
  });

  // Expanded state
  it('shows title when expanded', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Navigate Sections')).toBeInTheDocument();
  });

  it('shows navigation labels when expanded', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('shows step numbers when expanded', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('has correct aria-label for toggle button when expanded', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse sidebar');
  });

  it('does not have collapsed class when expanded', () => {
    const { container } = renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).not.toHaveClass('sidebar--collapsed');
  });

  // Collapsed state
  it('does not show title when collapsed', () => {
    renderWithRouter(<Sidebar isCollapsed={true} onToggle={mockOnToggle} />);
    expect(screen.queryByText('Navigate Sections')).not.toBeInTheDocument();
  });

  it('has correct aria-label for toggle button when collapsed', () => {
    renderWithRouter(<Sidebar isCollapsed={true} onToggle={mockOnToggle} />);
    const toggleButton = screen.getByRole('button', { name: /expand sidebar/i });
    expect(toggleButton).toHaveAttribute('aria-label', 'Expand sidebar');
  });

  it('has collapsed class when collapsed', () => {
    const { container } = renderWithRouter(<Sidebar isCollapsed={true} onToggle={mockOnToggle} />);
    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--collapsed');
  });

  // Active state
  it('marks current route as active', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />, { initialEntries: ['/getting-started'] });
    const link = screen.getByRole('link', { name: /getting started/i });
    expect(link).toHaveClass('sidebar__nav-link--active');
  });

  // Completed state
  it('marks previous steps as completed when on a later step', () => {
    const { container } = renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />, { initialEntries: ['/informationsharing'] });
    const completedLinks = container.querySelectorAll('.sidebar__nav-link--completed');
    expect(completedLinks.length).toBeGreaterThan(0);
  });

  // Progress indicator
  it('shows progress indicator when on a form step and not collapsed', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />, { initialEntries: ['/getting-started'] });
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();
  });

  it('does not show progress indicator when collapsed', () => {
    renderWithRouter(<Sidebar isCollapsed={true} onToggle={mockOnToggle} />, { initialEntries: ['/getting-started'] });
    expect(screen.queryByText(/step 1 of 6/i)).not.toBeInTheDocument();
  });

  it('shows correct step number in progress indicator', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />, { initialEntries: ['/informationsharing'] });
    expect(screen.getByText(/step 4 of 6/i)).toBeInTheDocument();
  });

  // Navigation links
  it('navigation items are links', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    const link = screen.getByRole('link', { name: /getting started/i });
    expect(link).toHaveAttribute('href', '/getting-started');
  });

  it('all navigation items have correct hrefs', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    expect(screen.getByRole('link', { name: /getting started/i })).toHaveAttribute('href', '/getting-started');
    expect(screen.getByRole('link', { name: /parental rights/i })).toHaveAttribute('href', '/parental-rights');
    expect(screen.getByRole('link', { name: /parenting time & communication/i })).toHaveAttribute('href', '/parenting-time-communication');
    expect(screen.getByRole('link', { name: /information sharing/i })).toHaveAttribute('href', '/informationsharing');
    expect(screen.getByRole('link', { name: /tax exemptions/i })).toHaveAttribute('href', '/tax-exemptions');
    expect(screen.getByRole('link', { name: /review/i })).toHaveAttribute('href', '/review');
  });

  // Accessibility
  it('has proper ARIA navigation label', () => {
    renderWithRouter(<Sidebar isCollapsed={false} onToggle={mockOnToggle} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('navigation items have title attribute when collapsed', () => {
    renderWithRouter(<Sidebar isCollapsed={true} onToggle={mockOnToggle} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('title', 'Getting Started');
  });
});