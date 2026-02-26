import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/logos/ShareCare_Symmetrical Diamond Logo (1120 x 310 px).png';

export default function Header({
  showNavigation = true,
  saved = false,
}) {
  const location = useLocation();

  const navSteps = [
    { path: '/household-info', label: 'Household Info' },
    { path: '/custody-schedule', label: 'Custody Schedule' },
    { path: '/transportation', label: 'Transportation' },
    { path: '/review', label: 'Review' },
  ];

  const currentStepIndex = navSteps.findIndex(s => s.path === location.pathname);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
  const totalSteps = navSteps.length;

  return (
    <header className="header">
      <div className="header__top-bar">
        <img src={logo} alt="ShareCare" className="header__logo" />

        {showNavigation && (
          <div className="header__step-indicator">
            Step {currentStep} of {totalSteps}
          </div>
        )}

        {saved && (
          <div className="header__saved">
            <svg className="header__saved-icon" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Saved
          </div>
        )}
      </div>

      {showNavigation && (
        <nav className="header__progress" aria-label="Form progress">
          <ol className="header__steps">
            {navSteps.map((step, index) => {
              const isActive = location.pathname === step.path;
              const isCompleted = currentStepIndex > index;

              return (
                <li key={step.path} className="header__step">
                  {index > 0 && <div className="header__step-line" />}

                  <Link
                    to={step.path}
                    className={[
                      'header__step-circle',
                      isActive && 'header__step-circle--active',
                      isCompleted && 'header__step-circle--completed',
                    ].filter(Boolean).join(' ')}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <svg viewBox="0 0 16 16" fill="none" className="header__step-checkmark">
                        <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span className="header__step-number">{index + 1}</span>
                    )}
                  </Link>

                  {isActive && (
                    <span className="header__step-label">{step.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </header>
  );
}
