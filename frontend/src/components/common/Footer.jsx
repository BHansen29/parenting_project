import './Footer.css';

export default function Footer({
  showBackButton = false,
  showNextButton = true,
  onBack,
  onNext,
  nextButtonText = 'Next',
  nextButtonDisabled = false,
}) {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__actions">
          {showBackButton && (
            <button
              type="button"
              onClick={onBack}
              className="footer__button footer__button--back"
            >
              ← Back
            </button>
          )}

          {showNextButton && (
            <button
              type="button"
              onClick={onNext}
              disabled={nextButtonDisabled}
              className="footer__button footer__button--next"
            >
              {nextButtonText} →
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
