import { X } from 'lucide-react';
import useModalAccessibility from '../../hooks/useModalAccessibility';
import './NextStepsModal.css';

export default function NextStepsModal({ isOpen, onClose, onContinue }) {
  const { dialogRef, handleKeyDown } = useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="next-steps-modal__overlay" role="presentation">
      <div
        ref={dialogRef}
        className="next-steps-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="next-steps-modal-title"
        tabIndex="-1"
        onKeyDown={handleKeyDown}
      >
        <header className="next-steps-modal__header">
          <h2 id="next-steps-modal-title">Next Steps for Completing Your Parenting Plan</h2>
          <button
            type="button"
            className="next-steps-modal__close"
            onClick={onClose}
            aria-label="Close next steps"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="next-steps-modal__body">
          <p className="next-steps-modal__notice">
            <strong>NOTICE:</strong> This final document is not a legally binding document. It will
            not be enforced by a court. It does not provide legal advice. It is for informational
            purposes only and is designed to help you organize your parenting decisions and complete
            Form 20 or Form 21 of the Ohio Supreme Court.
          </p>

          <h3>Now, What Do I Do?</h3>
          <ol className="next-steps-modal__steps">
            <li>
              <strong>Locate Form 20 or Form 21.</strong>
              <p>
                You can find the official Ohio Supreme Court forms{' '}
                <a
                  href="https://www.supremecourt.ohio.gov/courts/services-to-courts/children-families/dom-rel-juvenile-forms/parenting-time/"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                . Make sure you select the correct form for your situation.
              </p>
            </li>
            <li>
              <strong>Transfer your answers to Form 20 or Form 21.</strong>
              <p>
                Your responses throughout this tool will help you complete Form 20 or Form 21.
                However, not every question in this tool directly matches a question on the official
                court forms.
              </p>
              <ul>
                <li>
                  <strong>Responses that match the court forms:</strong> Use these responses to
                  complete the appropriate sections of Form 20 or Form 21.
                </li>
                <li>
                  <strong>Responses that do not match the court forms:</strong> Include these answers
                  in a separate document called <em>Addendum</em> and attach it to your completed
                  court form.
                </li>
                <li>
                  <strong>Calendars:</strong> You MUST attach both your parenting calendar and your
                  holiday calendar to your Addendum.
                </li>
              </ul>
            </li>
            <li>
              <strong>Answer every question on the official court form.</strong>
              <p>
                You must provide an answer to every question in Form 20 or Form 21. Do not leave
                any questions blank. If a question does not apply to your situation, write “This
                does not apply” or “N/A.”
              </p>
            </li>
            <li>
              <strong>Complete the child support information.</strong>
              <p>
                This tool does not cover child support. You must complete all required child support
                information separately before submitting your parenting plan to the court. You can
                find the Ohio Child Support Calculator{' '}
                <a
                  href="https://ohiochildsupportcalculator.ohio.gov/pages/calculator.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </p>
            </li>
            <li>
              <strong>Complete the steps to submit your parenting plan.</strong>
              <p>
                Once you have completely filled out Form 20 or Form 21, follow the applicable court
                instructions to submit your parenting plan. Before submitting, make sure you have
                included your Addendum, including your parenting calendar, holiday calendar, and
                any other miscellaneous provisions, as well as all other documents required by the
                court.
              </p>
            </li>
            <li>
              <strong>Keep this document for your records.</strong>
              <p>
                You may bring this document to a pretrial hearing, mediation, or other court-related
                proceedings to help explain and discuss your parenting decisions.
              </p>
            </li>
          </ol>

          <p className="next-steps-modal__reminder">
            <strong>FINAL REMINDER:</strong> This final document is NOT a legally enforceable
            document and will not be enforced by a court. You MUST transfer all applicable
            information from this document into Form 20 or Form 21 and complete all required steps
            to prepare and submit the official court form. Do not submit this document in place of
            Form 20 or Form 21.
          </p>
        </div>

        <footer className="next-steps-modal__footer">
          <button type="button" className="next-steps-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="next-steps-modal__continue" onClick={onContinue}>
            Continue to Print / Save PDF
          </button>
        </footer>
      </div>
    </div>
  );
}
