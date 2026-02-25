import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import './Layout.css';

export default function Layout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

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

  // Determine if current page should show navigation
  const shouldShowNavigation = ['/household-info', '/custody-schedule', '/transportation', '/review'].includes(location.pathname);

  // Determine if current page should show header (not landing page)
  const shouldShowHeader = location.pathname !== '/';

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
      </div>
    </div>
  );
}