import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './Layout.css';
import Footer from '../components/common/Footer';

export default function Layout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define the page navigation order
  const pageOrder = [
    '/getting-started',
    '/parental-rights',
    '/parenting-time-communication',
    '/informationsharing', 
    '/tax-exemptions',
    '/review'
  ];

  const currentPageIndex = pageOrder.indexOf(location.pathname);
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pageOrder.length - 1;

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();'/household-info'
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if current page should show navigation
  const shouldShowNavigation = ['/getting-started', '/parental-rights', '/parenting-time', '/custody-schedule', '/transportation', '/informationsharing', '/tax-exemptions', '/review'].includes(location.pathname);

  // Determine if current page should show header (not landing page)
  const shouldShowHeader = location.pathname !== '/';

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleBack = () => {
    if (currentPageIndex > 0) {
      navigate(pageOrder[currentPageIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < pageOrder.length - 1) {
      navigate(pageOrder[currentPageIndex + 1]);
    }
  };

  return (
    <div className="layout">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div className={`layout__main ${isSidebarCollapsed ? 'layout__main--sidebar-collapsed' : ''}`}>
        {shouldShowHeader && (
          <Header
            showNavigation={false} // Navigation is now in sidebar
            saved={false} // You can pass saved state if needed
          />
        )}

        <main className="layout__content">
          {children}
        </main>

        <Footer
          showBackButton={!isFirstPage}
          showNextButton={!isLastPage}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>

    </div>
  );
}