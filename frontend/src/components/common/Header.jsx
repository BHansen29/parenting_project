import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/logos/ShareCare_Symmetrical Diamond Logo (1120 x 310 px).png';

export default function Header({
  showNavigation = true,
}) {
  const location = useLocation();

  const navSteps = [
    { path: '/parent-info', label: 'Parent Info' },
    { path: '/child-info', label: 'Child Info' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/review', label: 'Review' },
  ];

  return (
    <header className="header">
      <div className="header__container">
        <img src={logo} alt="ShareCare" className="header__logo" />

        {showNavigation && (
          <nav className="header__nav" aria-label="Form progress">
            <ol className="header__steps">
              {navSteps.map((step, index) => {
                const isActive = location.pathname === step.path;
                const isCompleted = navSteps.findIndex(s => s.path === location.pathname) > index;

                return (
                  <li
                    key={step.path}
                    className={[
                      'header__step',
                      isActive && 'header__step--active',
                      isCompleted && 'header__step--completed',
                    ].filter(Boolean).join(' ')}
                  >
                    <Link to={step.path} className="header__step-link">
                      <span className="header__step-number">{index + 1}</span>
                      <span className="header__step-label">{step.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </div>
    </header>
  );
}
