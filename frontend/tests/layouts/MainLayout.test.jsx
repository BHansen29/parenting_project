import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider } from '../../src/context/FormContext';
import MainLayout from '../../src/layouts/MainLayout';

// Mock the child component
const TestComponent = () => <div>Test Child Content</div>;

const renderWithProviders = (initialRoute = '/getting-started') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <FormProvider>
        <MainLayout>
          <TestComponent />
        </MainLayout>
      </FormProvider>
    </MemoryRouter>
  );
};

describe('MainLayout', () => {
  // Basic rendering
  it('renders without crashing', () => {
    renderWithProviders();
  });

  it('renders children content', () => {
    renderWithProviders();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('renders sidebar', () => {
    renderWithProviders();
    expect(screen.getByText('Navigate Sections')).toBeInTheDocument();
  });

  it('renders header', () => {
    renderWithProviders();
    // Header should render (checking for common header elements)
    expect(document.querySelector('.header')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderWithProviders();
    // Footer should render with navigation buttons
    const footer = document.querySelector('.footer');
    expect(footer).toBeInTheDocument();
  });

  // Sidebar collapse functionality
  it('sidebar is expanded by default', () => {
    renderWithProviders();
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).not.toHaveClass('sidebar--collapsed');
  });

  it('can toggle sidebar collapse', () => {
    renderWithProviders();
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--collapsed');
  });

  it('toggle button changes label when collapsed', () => {
    renderWithProviders();
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
  });

  // Footer navigation buttons
  it('hides back button on first page', () => {
    renderWithProviders('/getting-started');
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('shows back button on subsequent pages', () => {
    renderWithProviders('/parental-rights');
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('shows next button on non-final pages', () => {
    renderWithProviders('/getting-started');
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('hides next button on last page', () => {
    renderWithProviders('/review');
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  // Page order navigation
  it('navigates to correct page when next is clicked', () => {
    const { container } = renderWithProviders('/getting-started');
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // After clicking next from getting-started, should navigate to parental-rights
    // The sidebar should show parental-rights as active
    const activeLink = container.querySelector('.sidebar__nav-link--active');
    expect(activeLink).toHaveAttribute('href', '/parental-rights');
  });

  it('navigates to correct page when back is clicked', () => {
    const { container } = renderWithProviders('/parental-rights');
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    // After clicking back from parental-rights, should navigate to getting-started
    const activeLink = container.querySelector('.sidebar__nav-link--active');
    expect(activeLink).toHaveAttribute('href', '/getting-started');
  });

  // Page progression
  it('marks previous steps as completed', () => {
    const { container } = renderWithProviders('/custody-schedule');
    const completedLinks = container.querySelectorAll('.sidebar__nav-link--completed');
    // Should have 3 completed steps before custody-schedule (getting-started, parental-rights, parenting-time-communication)
    expect(completedLinks.length).toBeGreaterThanOrEqual(3);
  });

  // Responsive behavior
  it('layout main section has correct class when sidebar is expanded', () => {
    renderWithProviders();
    const mainSection = document.querySelector('.layout__main');
    expect(mainSection).not.toHaveClass('layout__main--sidebar-collapsed');
  });

  it('layout main section has collapsed class when sidebar is collapsed', () => {
    renderWithProviders();
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    const mainSection = document.querySelector('.layout__main');
    expect(mainSection).toHaveClass('layout__main--sidebar-collapsed');
  });
});
