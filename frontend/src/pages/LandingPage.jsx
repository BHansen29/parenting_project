import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import logo from '../assets/logos/ShareCare_Symmetrical Diamond Logo (1120 x 310 px).png';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/household-info');
  };

  return (
    <div className="landing-page">
      {/* Safety Resource Banner */}
      <div className="safety-banner">
        <div className="safety-banner__content">
          <span>
            <strong>Safety Resources:</strong> If you or your children are experiencing domestic violence or abuse,
            please consult with an attorney or contact the National Domestic Violence Hotline at 1-800-799-7233.
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-header__container">
          <div className="landing-header__logo-section">
            <img src={logo} alt="ShareCare" className="landing-header__logo" />
          </div>
          <div className="landing-header__actions">
            <button className="landing-header__link">How it works</button>
            <button className="landing-header__sign-in">Sign In</button>
            <button onClick={handleGetStarted} className="landing-header__cta">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main">
        <section className="hero">
          <h1 className="hero__title">
            Create Your <br />
            <span className="hero__title-accent">Parenting Plan</span>
          </h1>

          <p className="hero__description">
            A step-by-step guide to help you create a comprehensive co-parenting plan that puts your children first.
          </p>

          {/* Feature Cards */}
          <div className="feature-cards">
            <div className="feature-card">
              <svg className="feature-card__icon-bg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <svg className="feature-card__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h3 className="feature-card__title">Guided Process</h3>
              <p className="feature-card__description">Simple questions walk you through each section.</p>
            </div>

            <div className="feature-card">
              <svg className="feature-card__icon-bg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <svg className="feature-card__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <h3 className="feature-card__title">Child-Focused</h3>
              <p className="feature-card__description">Designed to prioritize your child's well-being.</p>
            </div>

            <div className="feature-card">
              <svg className="feature-card__icon-bg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <svg className="feature-card__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <h3 className="feature-card__title">Save Progress</h3>
              <p className="feature-card__description">Continue anytime - your work is saved.</p>
            </div>
          </div>

          <div className="hero__cta-section">
            <button onClick={handleGetStarted} className="hero__cta-button">
              Begin Your Plan
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            {/* Important Notice Box */}
            <div className="notice-box">
              <div>
                <h4 className="notice-box__title">Important Notice</h4>
                <p className="notice-box__text">
                  This tool helps you create a draft parenting plan. It is <strong>not legal advice</strong> and does not create a legally binding agreement.
                  Your plan must be reviewed and approved by the court to become legally enforceable. If you have questions about your specific situation,
                  please consult with an attorney.
                </p>
              </div>
            </div>
          </div>  
        </section>

        {/* Value Props Section */}
        <section className="value-props">
          <div className="value-props__container">
            <div className="value-props__content">
              <h2 className="value-props__title">Why use our tool?</h2>
              <div className="value-props__list">
                <div className="value-prop">
                  <div className="value-prop__icon value-prop__icon--blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="value-prop__title">Court Ready Format</h3>
                    <p className="value-prop__description">
                      We generate documents that align with standard court requirements, saving you time and formatting headaches.
                    </p>
                  </div>
                </div>

                <div className="value-prop">
                  <div className="value-prop__icon value-prop__icon--green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="value-prop__title">Free & Accessible</h3>
                    <p className="value-prop__description">
                      Access professional-grade tools without the high costs. We believe every family deserves support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="value-props__visual">
              <div className="mockup">
                <div className="mockup__header">
                  <div className="mockup__dot mockup__dot--red"></div>
                  <div className="mockup__dot mockup__dot--yellow"></div>
                  <div className="mockup__dot mockup__dot--green"></div>
                </div>
                <div className="mockup__content">
                  <div className="mockup__line mockup__line--75"></div>
                  <div className="mockup__line mockup__line--100"></div>
                  <div className="mockup__document">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div className="mockup__line mockup__line--66"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__container">
          <p className="landing-footer__copyright">&copy; 2026 Action for Children. All rights reserved.</p>
          <div className="landing-footer__links">
            <button className="landing-footer__link">Privacy Policy</button>
            <button className="landing-footer__link">Terms of Service</button>
            <button className="landing-footer__link">Contact Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
