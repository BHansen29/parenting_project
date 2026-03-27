import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { validateInviteToken, acceptInvite } from '../lib/inviteApi';
import { useForm } from '../hooks/useForm';
import Header from '../components/common/Header';

export default function InviteLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useForm();

  const [validationState, setValidationState] = useState('loading');
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);

  // Validate token on mount
  useEffect(() => {
    async function validate() {
      try {
        const result = await validateInviteToken(token);

        if (result.valid) {
          setInviteData(result);
          setValidationState('valid');
        } else {
          setValidationState('invalid');
          setError(result.reason || 'invalid');
        }
      } catch (err) {
        console.error('Token validation failed:', err);
        setValidationState('error');
        setError('network');
      }
    }

    validate();
  }, [token]);

  // Handle auth state changes
  useEffect(() => {
    if (validationState !== 'valid') return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated, accept the invite
        try {
          const result = await acceptInvite(token);

          // Store caseId in FormContext
          dispatch({
            type: 'UPDATE_SECTION',
            section: 'caseId',
            payload: result.caseId,
          });

          // Navigate to questionnaire
          navigate('/getting-started');
        } catch (error) {
          console.error('Failed to accept invite:', error);
          setValidationState('error');
          setError('accept_failed');
        }
      }
    });

    return () => unsubscribe();
  }, [validationState, token, navigate, dispatch]);

  const handleSignUp = () => {
    // Store token for post-auth flow
    localStorage.setItem('pendingInviteToken', token);
    navigate('/signup');
  };

  const handleSignIn = () => {
    // Store token for post-auth flow
    localStorage.setItem('pendingInviteToken', token);
    navigate('/signin');
  };

  // Loading state
  if (validationState === 'loading') {
    return (
      <div className="page-container">
        <Header />
        <main className="page-content">
          <div data-slot="card">
            <div data-slot="card-content">
              <p>Validating invitation...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error states
  if (validationState === 'invalid' || validationState === 'error') {
    let errorMessage = 'This invitation is invalid.';

    if (error === 'expired') {
      errorMessage = 'This invitation has expired. Please ask the sender to send a new invitation.';
    } else if (error === 'already_accepted') {
      errorMessage = 'This invitation has already been accepted.';
    } else if (error === 'network') {
      errorMessage = 'Unable to validate invitation. Please check your internet connection and try again.';
    }

    return (
      <div className="page-container">
        <Header />
        <main className="page-content">
          <div data-slot="card">
            <div data-slot="card-header">
              <h1 data-slot="card-title">Invitation Error</h1>
            </div>
            <div data-slot="card-content">
              <p style={{ color: '#ef4444' }}>{errorMessage}</p>
              <button
                onClick={() => navigate('/signin')}
                style={{ marginTop: '1rem' }}
                className="footer__button footer__button--next"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Valid invitation - show auth options
  return (
    <div className="page-container">
      <Header />
      <main className="page-content">
        <div data-slot="card">
          <div data-slot="card-header">
            <h1 data-slot="card-title">You're Invited!</h1>
            <p data-slot="card-description">
              {inviteData?.inviterEmail
                ? `${inviteData.inviterEmail} has invited you to collaborate on a parenting plan.`
                : 'You\'ve been invited to collaborate on a parenting plan.'}
            </p>
          </div>

          <div data-slot="card-content">
            <p style={{ marginBottom: '1.5rem' }}>
              To accept this invitation and start filling out your questionnaire,
              please sign in or create an account.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                onClick={handleSignUp}
                className="footer__button footer__button--next"
              >
                Create Account
              </button>

              <button
                onClick={handleSignIn}
                className="footer__button footer__button--back"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
