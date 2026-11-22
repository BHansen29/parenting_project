import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FileCheck2,
  Heart,
  MessageCircle,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from 'lucide-react';
import usePublicPageLanguage from '../hooks/usePublicPageLanguage';
import logo from '../assets/logos/ShareCare_Symmetrical Diamond Logo (1120 x 310 px).png';
import './HowItWorks.css';

const copyByLanguage = {
  en: {
    homeLink: 'Return to ShareCare home',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    switchLanguage: 'Switch language to Spanish',
    builtForFamilies: 'Built for families',
    heroTitle: 'Simplifying parenting plan creation for all families',
    heroDescription: 'ShareCare is a free tool, guiding parents through the process of creating a thoughtful parenting plan—one step at a time, with your child(ren) at the center.',
    createPlan: 'Create your plan',
    process: 'The process',
    stepsTitle: 'Choose the path that works for your family',
    stepsDescription: 'Start with your plan, then decide whether you want to finish on your own or collaborate.',
    startPlan: 'Start your plan',
    startPlanDescription: 'Answer clear, guided questions about your child(ren)’s schedule, care, school, health, and day-to-day needs.',
    choosePath: 'Then choose the path that works for you',
    soloPath: 'Path A: Complete it on your own',
    completeAlone: 'Complete it on your own',
    completeAloneDescription: 'Finish your plan independently of your co-parent.',
    generatePlan: 'Generate your completed plan',
    soloGenerateDescription: 'Generate a court-ready plan centered on your child(ren) based on your responses.',
    coParentPath: 'Path B: Work with your co-parent',
    inviteCoParent: 'Invite your co-parent',
    inviteDescription: 'Share a private invitation so your co-parent can fill out their own form.',
    compareAgree: 'Compare and agree',
    compareDescription: 'Use the automatic comparison tool to see where agreements and disagreements are between plans. Easily send resolutions to your co-parent allowing for faster collaboration. Finalize agreements and mark any remaining disagreements for future discussion.',
    sharedGenerateDescription: 'Generate a court-ready plan centered on your child(ren) and your co-parent’s shared decisions.',
    supportTitle: 'A calmer way to plan for what matters most.',
    supportDescription: 'You do not have to figure everything out at once. ShareCare helps organize the details, surface the important conversations, and keep decisions focused on your child(ren)’s well-being.',
    benefits: [
      'A step-by-step process that is easier to follow',
      'A child-focused approach to everyday decisions',
      'Private responses until both parents are ready to compare',
      'A clear summary of agreements and differences'
    ],
    familyFirst: 'Putting the family first.',
    familyFirstDescription: 'Every part of the experience is designed to help you build a plan that supports your family’s unique needs.',
    bottomTitle: 'Ready to take the first step?',
    bottomDescription: 'Start building a parenting plan that works for your family.',
    freeStart: 'Get started for free',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact Support',
    copyright: '© 2026 Action for Children. All rights reserved.'
  },
  es: {
    homeLink: 'Volver a la página de inicio de ShareCare',
    signIn: 'Iniciar sesión',
    getStarted: 'Comenzar',
    switchLanguage: 'Cambiar idioma a inglés',
    builtForFamilies: 'Creado para las familias',
    heroTitle: 'Hacemos más sencilla la creación de planes de crianza para todas las familias',
    heroDescription: 'ShareCare es una herramienta gratuita que guía a madres y padres paso a paso para crear un plan de crianza pensado en el bienestar de sus hijos.',
    createPlan: 'Crea tu plan',
    process: 'El proceso',
    stepsTitle: 'Elige la opción que mejor funcione para tu familia',
    stepsDescription: 'Comienza tu plan y luego decide si quieres terminarlo por tu cuenta o colaborar.',
    startPlan: 'Comienza tu plan',
    startPlanDescription: 'Responde preguntas claras y guiadas sobre los horarios, el cuidado, la escuela, la salud y las necesidades cotidianas de tus hijos.',
    choosePath: 'Después, elige el camino que mejor te funcione',
    soloPath: 'Camino A: Complétalo por tu cuenta',
    completeAlone: 'Completa tu plan por tu cuenta',
    completeAloneDescription: 'Termina tu plan de manera independiente del otro padre o madre.',
    generatePlan: 'Genera tu plan completo',
    soloGenerateDescription: 'Genera un plan en un formato listo para el tribunal, centrado en tus hijos y basado en tus respuestas.',
    coParentPath: 'Camino B: Colabora con el otro padre o madre',
    inviteCoParent: 'Invita al otro padre o madre',
    inviteDescription: 'Envía una invitación privada para que el otro padre o madre complete su propio formulario.',
    compareAgree: 'Comparen y lleguen a acuerdos',
    compareDescription: 'Usen la herramienta de comparación automática para identificar acuerdos y diferencias entre sus planes. Envíen propuestas de solución fácilmente para colaborar. Finalicen los acuerdos y marquen cualquier diferencia pendiente para conversarla más adelante.',
    sharedGenerateDescription: 'Genera un plan en un formato listo para el tribunal que refleje las decisiones compartidas sobre tus hijos.',
    supportTitle: 'Una manera más tranquila de planificar lo que más importa.',
    supportDescription: 'No tienes que resolverlo todo de una vez. ShareCare te ayuda a organizar los detalles, destacar conversaciones importantes y mantener las decisiones centradas en el bienestar de tus hijos.',
    benefits: [
      'Un proceso paso a paso fácil de seguir',
      'Un enfoque centrado en tus hijos para las decisiones cotidianas',
      'Respuestas privadas hasta que ambos padres estén listos para compararlas',
      'Un resumen claro de los acuerdos y las diferencias'
    ],
    familyFirst: 'La familia es lo primero.',
    familyFirstDescription: 'Cada parte de la experiencia está diseñada para ayudarte a crear un plan que apoye las necesidades particulares de tu familia.',
    bottomTitle: '¿Quieres dar el primer paso?',
    bottomDescription: 'Comienza a crear un plan de crianza que funcione para tu familia.',
    freeStart: 'Comienza gratis',
    privacy: 'Política de privacidad',
    terms: 'Términos del servicio',
    contact: 'Contactar al equipo de soporte',
    copyright: '© 2026 Action for Children. Todos los derechos reservados.'
  }
};

export default function HowItWorks() {
  const { language, toggleLanguage } = usePublicPageLanguage();
  const copy = copyByLanguage[language];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="how-it-works" lang={language}>
      <div className="how-it-works__pattern" aria-hidden="true" />

      <header className="how-it-works__header">
        <Link
          to="/"
          className="how-it-works__logo-link"
          aria-label={copy.homeLink}
        >
          <img src={logo} alt="ShareCare" />
        </Link>
        <div className="how-it-works__header-actions">
          <Link className="how-it-works__sign-in" to="/signin">
            {copy.signIn}
          </Link>
          <Link className="how-it-works__header-cta" to="/signup">
            {copy.getStarted}
          </Link>
          <button
            type="button"
            className="how-it-works__language-toggle"
            onClick={toggleLanguage}
            aria-label={copy.switchLanguage}
          >
            <span className="how-it-works__language-long">
              {language === 'en' ? 'Español' : 'English'}
            </span>
            <span className="how-it-works__language-short" aria-hidden="true">
              {language === 'en' ? 'ES' : 'EN'}
            </span>
          </button>
        </div>
      </header>

      <main>
        <section className="how-it-works__hero">
          <div className="how-it-works__eyebrow">
            <Heart size={17} fill="currentColor" aria-hidden="true" />
            {copy.builtForFamilies}
          </div>
          <h1>{copy.heroTitle}</h1>
          <p>
            {copy.heroDescription}
          </p>
          <Link className="how-it-works__primary-cta" to="/signup">
            {copy.createPlan}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </section>

        <section className="how-it-works__steps" aria-labelledby="steps-heading">
          <div className="how-it-works__section-heading">
            <p className="how-it-works__eyebrow">{copy.process}</p>
            <h2 id="steps-heading">{copy.stepsTitle}</h2>
            <p>{copy.stepsDescription}</p>
          </div>
          <div className="how-it-works__process">
            <article className="how-it-works__step how-it-works__step--blue">
              <div className="how-it-works__step-top">
                <div className="how-it-works__step-icon"><FileText size={25} aria-hidden="true" /></div>
                <span>01</span>
              </div>
              <h3>{copy.startPlan}</h3>
              <p>{copy.startPlanDescription}</p>
            </article>

            <div className="how-it-works__path-intro">
              <span>{copy.choosePath}</span>
            </div>

            <div className="how-it-works__paths">
              <div className="how-it-works__path how-it-works__path--solo">
                <div className="how-it-works__path-title">
                  <UserRound size={20} aria-hidden="true" />
                  <span>{copy.soloPath}</span>
                </div>
                <article className="how-it-works__step how-it-works__step--purple">
                  <div className="how-it-works__step-top">
                    <div className="how-it-works__step-icon"><UserRound size={25} aria-hidden="true" /></div>
                    <span>02A</span>
                  </div>
                  <h3>{copy.completeAlone}</h3>
                  <p>{copy.completeAloneDescription}</p>
                </article>
                <div className="how-it-works__path-arrow" aria-hidden="true">↓</div>
                <article className="how-it-works__step how-it-works__step--orange">
                  <div className="how-it-works__step-top">
                    <div className="how-it-works__step-icon"><FileCheck2 size={25} aria-hidden="true" /></div>
                    <span>03A</span>
                  </div>
                  <h3>{copy.generatePlan}</h3>
                  <p>{copy.soloGenerateDescription}</p>
                </article>
              </div>

              <div className="how-it-works__path how-it-works__path--co-parent">
                <div className="how-it-works__path-title">
                  <UserRoundPlus size={20} aria-hidden="true" />
                  <span>{copy.coParentPath}</span>
                </div>
                <article className="how-it-works__step how-it-works__step--green">
                  <div className="how-it-works__step-top">
                    <div className="how-it-works__step-icon"><UserRoundPlus size={25} aria-hidden="true" /></div>
                    <span>02B</span>
                  </div>
                  <h3>{copy.inviteCoParent}</h3>
                  <p>{copy.inviteDescription}</p>
                </article>
                <div className="how-it-works__path-arrow" aria-hidden="true">↓</div>
                <article className="how-it-works__step how-it-works__step--orange">
                  <div className="how-it-works__step-top">
                    <div className="how-it-works__step-icon"><MessageCircle size={25} aria-hidden="true" /></div>
                    <span>03B</span>
                  </div>
                  <h3>{copy.compareAgree}</h3>
                  <p>{copy.compareDescription}</p>
                </article>
                <div className="how-it-works__path-arrow" aria-hidden="true">↓</div>
                <article className="how-it-works__step how-it-works__step--purple">
                  <div className="how-it-works__step-top">
                    <div className="how-it-works__step-icon"><FileCheck2 size={25} aria-hidden="true" /></div>
                    <span>04B</span>
                  </div>
                  <h3>{copy.generatePlan}</h3>
                  <p>{copy.sharedGenerateDescription}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works__support">
          <div className="how-it-works__support-copy">
            <h2>{copy.supportTitle}</h2>
            <p>
              {copy.supportDescription}
            </p>
            <ul>
              {copy.benefits.map((benefit) => (
                <li key={benefit}>
                  <CheckCircle2 size={19} aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="how-it-works__support-card">
            <Heart size={34} aria-hidden="true" />
            <h3>{copy.familyFirst}</h3>
            <p>
              {copy.familyFirstDescription}
            </p>
          </div>
        </section>

        <section className="how-it-works__bottom-cta">
          <h2>{copy.bottomTitle}</h2>
          <p>{copy.bottomDescription}</p>
          <Link className="how-it-works__primary-cta" to="/signup">
            {copy.freeStart}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <footer className="how-it-works__footer">
        <span>{copy.copyright}</span>
        <div>
          <Link to="/privacy-policy">{copy.privacy}</Link>
          <Link to="/terms-of-service">{copy.terms}</Link>
          <Link to="/contact-support">{copy.contact}</Link>
        </div>
      </footer>
    </div>
  );
}
