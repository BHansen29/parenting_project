import { Link } from 'react-router-dom';
import { FileText, Heart, Users, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import usePublicPageLanguage from '../hooks/usePublicPageLanguage';
import './LandingPage.css';
import logo from '../assets/logos/ShareCare_Symmetrical Diamond Logo (1120 x 310 px).png';

const copyByLanguage = {
  en: {
    howItWorks: 'How it works',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    safetyResources: 'Safety Resources:',
    safetyMessage: 'If you or your children are experiencing domestic violence or abuse, please contact the National Domestic Violence Hotline at 1-800-799-7233.',
    heroTitleStart: 'Create Your',
    heroTitleEnd: 'Parenting Plan',
    heroDescription: 'A step-by-step guide to help you create a comprehensive co-parenting plan that puts your children first.',
    guidedProcess: 'Guided Process',
    guidedDescription: 'Simple questions walk you through each section.',
    childFocused: 'Child-Focused',
    childFocusedDescription: "Designed to prioritize your child's well-being.",
    workTogether: 'Work Together',
    workTogetherDescription: 'Invite the other parent to collaborate and agree.',
    beginPlan: 'Begin Your Plan',
    importantNotice: 'Important Notice',
    noticeBefore: 'This tool helps you create a draft parenting plan. It is ',
    notLegalAdvice: 'not legal advice',
    noticeAfter: ' and does not create a legally binding agreement. Your plan must be reviewed and approved by the court to become legally enforceable. If you have questions about your specific situation, please consult with an attorney.',
    whyUseTool: 'Why use our tool?',
    courtReady: 'Court Ready Format',
    courtReadyDescription: 'We generate documents that align with standard court requirements, saving you time and formatting headaches.',
    freeAccessible: 'Free & Accessible',
    freeAccessibleDescription: 'Access professional-grade tools without the high costs. We believe every family deserves support.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    support: 'Contact Support',
    switchLanguage: 'Switch language to Spanish',
    copyright: '© 2026 Action for Children. All rights reserved.'
  },
  es: {
    howItWorks: 'Cómo funciona',
    signIn: 'Iniciar sesión',
    getStarted: 'Comenzar',
    safetyResources: 'Recursos de seguridad:',
    safetyMessage: 'Si tú o tus hijos están viviendo violencia doméstica o abuso, comunícate con la Línea Nacional contra la Violencia Doméstica al 1-800-799-7233.',
    heroTitleStart: 'Crea tu',
    heroTitleEnd: 'Plan de crianza',
    heroDescription: 'Una guía paso a paso para crear un plan integral de crianza compartida que ponga a tus hijos en primer lugar.',
    guidedProcess: 'Proceso guiado',
    guidedDescription: 'Preguntas sencillas te guían por cada sección.',
    childFocused: 'Centrado en tus hijos',
    childFocusedDescription: 'Diseñado para priorizar el bienestar de tus hijos.',
    workTogether: 'Trabajen en equipo',
    workTogetherDescription: 'Invita al otro padre o madre a colaborar y llegar a acuerdos.',
    beginPlan: 'Comienza tu plan',
    importantNotice: 'Aviso importante',
    noticeBefore: 'Esta herramienta te ayuda a crear un borrador de plan de crianza. No constituye ',
    notLegalAdvice: 'asesoría legal',
    noticeAfter: ' ni crea un acuerdo legalmente vinculante. Para que sea legalmente exigible, el tribunal debe revisar y aprobar tu plan. Si tienes preguntas sobre tu situación específica, consulta con un abogado.',
    whyUseTool: '¿Por qué usar nuestra herramienta?',
    courtReady: 'Formato listo para el tribunal',
    courtReadyDescription: 'Generamos documentos que siguen los requisitos habituales de los tribunales, para ahorrarte tiempo y problemas de formato.',
    freeAccessible: 'Gratis y accesible',
    freeAccessibleDescription: 'Accede a herramientas profesionales sin costos elevados. Creemos que todas las familias merecen apoyo.',
    privacy: 'Política de privacidad',
    terms: 'Términos del servicio',
    support: 'Contactar al equipo de soporte',
    switchLanguage: 'Cambiar idioma a inglés',
    copyright: '© 2026 Action for Children. Todos los derechos reservados.'
  }
};

export default function LandingPage() {
  const { language, toggleLanguage } = usePublicPageLanguage();
  const copy = copyByLanguage[language];

  return (
    <div className="landing-page" lang={language}>
      {/* Safety Resource Banner */}
      <div className="safety-banner">
        <div className="safety-banner__content">
            <div className="safety-banner__icon safety-banner__icon--red">
              <Shield size={24} aria-hidden="true" />
            </div>
          <span>
            <strong>{copy.safetyResources}</strong> {copy.safetyMessage}
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
            <Link to="/how-it-works" className="landing-header__link">{copy.howItWorks}</Link>
            <Link to="/signin" className="landing-header__sign-in">{copy.signIn}</Link>
            <Link to="/signup" className="landing-header__cta">
              {copy.getStarted}
            </Link>
            <button
              type="button"
              className="landing-header__language-toggle"
              onClick={toggleLanguage}
              aria-label={copy.switchLanguage}
            >
              <span className="landing-header__language-long">
                {language === 'en' ? 'Español' : 'English'}
              </span>
              <span className="landing-header__language-short" aria-hidden="true">
                {language === 'en' ? 'ES' : 'EN'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main">
        <section className="hero">
          <h1 className="hero__title">
            {copy.heroTitleStart} <br />
            <span className="hero__title-accent">{copy.heroTitleEnd}</span>
          </h1>

          <p className="hero__description">
            {copy.heroDescription}
          </p>

          {/* Feature Cards */}
          <div className="feature-cards">
            <div className="feature-card_left">
              <FileText className="feature-card_left__icon-bg" size={80} aria-hidden="true" />
              <FileText className="feature-card_left__icon" size={32} aria-hidden="true" />
              <h3 className="feature-card__title">{copy.guidedProcess}</h3>
              <p className="feature-card__description">{copy.guidedDescription}</p>
            </div>

            <div className="feature-card_center">
              <Heart className="feature-card_center__icon-bg" size={80} aria-hidden="true" />
              <Heart className="feature-card_center__icon" size={32} aria-hidden="true" />
              <h3 className="feature-card__title">{copy.childFocused}</h3>
              <p className="feature-card__description">{copy.childFocusedDescription}</p>
            </div>

            <div className="feature-card_right">
              <Users className="feature-card_right__icon-bg" size={80} aria-hidden="true" />
              <Users className="feature-card_right__icon" size={32} aria-hidden="true" />
              <h3 className="feature-card__title">{copy.workTogether}</h3>
              <p className="feature-card__description">{copy.workTogetherDescription}</p>
            </div>
          </div>

          <div className="hero__cta-section">
            <Link to="/signup" className="hero__cta-button">
              {copy.beginPlan}
              <ArrowRight size={24} aria-hidden="true" />
            </Link>

            {/* Important Notice Box */}
            <div className="notice-box">
              <div>
                <h4 className="notice-box__title">{copy.importantNotice}</h4>
                <p className="notice-box__text">
                  {copy.noticeBefore}<strong>{copy.notLegalAdvice}</strong>{copy.noticeAfter}
                </p>
              </div>
            </div>
          </div>  
        </section>

        {/* Value Props Section */}
        <section className="value-props">
          <div className="value-props__container">
            <div className="value-props__content">
              <h2 className="value-props__title">{copy.whyUseTool}</h2>
              <div className="value-props__list">
                <div className="value-prop">
                  <div className="value-prop__icon value-prop__icon--blue">
                    <Shield size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="value-prop__title">{copy.courtReady}</h3>
                    <p className="value-prop__description">
                      {copy.courtReadyDescription}
                    </p>
                  </div>
                </div>

                <div className="value-prop">
                  <div className="value-prop__icon value-prop__icon--green">
                    <CheckCircle2 size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="value-prop__title">{copy.freeAccessible}</h3>
                    <p className="value-prop__description">
                      {copy.freeAccessibleDescription}
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
                    <FileText size={48} aria-hidden="true" />
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
          <p className="landing-footer__copyright">{copy.copyright}</p>
          <div className="landing-footer__links">
            <Link className="landing-footer__link" to="/privacy-policy">{copy.privacy}</Link>
            <Link className="landing-footer__link" to="/terms-of-service">{copy.terms}</Link>
            <Link className="landing-footer__link" to="/contact-support">{copy.support}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
