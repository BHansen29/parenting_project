import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './Layout.css';
import Footer from '../components/common/Footer';
import { useNavigation } from '../context/NavigationContext';

export default function Layout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { onNext, onBack } = useNavigation();

  const pageOrder = [
    '/getting-started',
    '/parental-rights',
    '/parenting-time-communication',
    '/informationsharing',
    '/tax-exemptions',
    '/review',
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
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldShowHeader = location.pathname !== '/';

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="layout">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`layout__main ${isSidebarCollapsed ? 'layout__main--sidebar-collapsed' : ''}`}>
        {shouldShowHeader && (
          <Header showNavigation={false} saved={false} />
        )}
        <main className="layout__content">
          {children}
        </main>
        <Footer
          showBackButton={!isFirstPage}
          showNextButton={!isLastPage}
          onBack={onBack}
          onNext={onNext}
        />
      </div>
    </div>
  );
}