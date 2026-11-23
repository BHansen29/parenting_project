import { Link } from 'react-router-dom';
import './StaticPage.css';
import { useEffect } from 'react';

export default function ContactSupport() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="static-page">
      <div className="static-page__container">
        <Link className="static-page__back" to="/">
          ← Back
        </Link>

        <h1 className="static-page__title">Contact Support</h1>

        <p>
          If you have additional questions, you can reach us by email at{' '}
          <a href="mailto:info@actionforchildren.org">info@actionforchildren.org</a>. You can write
          to us at:
        </p>
        <address>
          Action for Children<br />
          105 Schrock Rd, Suite 125<br />
          Columbus, OH 43229
        </address>
        <p>
          Please include your email address, name, address, and telephone number when you contact
          us. This helps us answer you.
        </p>
      </div>
    </div>
  );
}
