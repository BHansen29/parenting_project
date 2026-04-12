import './Footer.css';

/**
 * 
 * @param {showBackButton} param0 - Boolean indicating whether to show the back button
 * @param {showNextButton} param1 - Boolean indicating whether to show the next button
 * @param {onBack} param2 - Function to be called when the back button is clicked
 * @param {onNext} param3 - Function to be called when the next button is clicked
 * @param {nextButtonText} param4 - Text to display on the next button (default is 'Next')
 * @param {nextButtonDisabled} param5 - Boolean indicating whether the next button should be disabled (default is false)
 * 
 * Footer component that renders navigation buttons for a multi-step form.
 * It accepts props to control the visibility and behavior of the back and next buttons, including their click handlers, text, and disabled state.
 * The component is styled using CSS classes defined in Footer.css.
 *  
 * @returns The Footer component with navigation buttons for a multi-step form
 */
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
