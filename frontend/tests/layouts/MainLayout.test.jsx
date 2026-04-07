import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { FormProvider } from '../../src/context/FormContext';
import { NavigationProvider, useNavigation } from '../../src/context/NavigationContext';
import MainLayout from '../../src/layouts/MainLayout';

const TestComponent = () => <div>Test Child Content</div>;

// Helper that registers mock callbacks into NavigationContext
const RegisterCallbacks = ({ onNext, onBack }) => {
  const { setOnNext, setOnBack } = useNavigation();
  useEffect(() => {
    if (onNext) setOnNext(onNext);
    if (onBack) setOnBack(onBack);
  }, []);
  return null;
};

const renderWithProviders = (initialRoute = '/getting-started', { mockNext, mockBack } = {}) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <FormProvider>
        <NavigationProvider>
          <MainLayout>
            <RegisterCallbacks onNext={mockNext} onBack={mockBack} />
            <TestComponent />
          </MainLayout>
        </NavigationProvider>
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
    expect(document.querySelector('.header')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderWithProviders();
    expect(document.querySelector('.footer')).toBeInTheDocument();
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
    expect(document.querySelector('.sidebar')).toHaveClass('sidebar--collapsed');
  });

  it('toggle button changes label when collapsed', () => {
    renderWithProviders();
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
  });

  // Footer navigation button visibility
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

  // Callback invocation
  it('calls registered onNext when next button is clicked', () => {
    const mockNext = vi.fn();
    renderWithProviders('/getting-started', { mockNext });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockNext).toHaveBeenCalledOnce();
  });

  it('calls registered onBack when back button is clicked', () => {
    const mockBack = vi.fn();
    renderWithProviders('/parental-rights', { mockBack });
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(mockBack).toHaveBeenCalledOnce();
  });

  it('does not crash when next is clicked with no callback registered', () => {
    renderWithProviders('/getting-started');
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
    ).not.toThrow();
  });

  // Sidebar collapsed class on layout__main
  it('layout main section has correct class when sidebar is expanded', () => {
    renderWithProviders();
    expect(document.querySelector('.layout__main')).not.toHaveClass('layout__main--sidebar-collapsed');
  });

  it('layout main section has collapsed class when sidebar is collapsed', () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }));
    expect(document.querySelector('.layout__main')).toHaveClass('layout__main--sidebar-collapsed');
  });
});