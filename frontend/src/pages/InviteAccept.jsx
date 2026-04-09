import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import { useForm } from '../hooks/useForm';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import './InviteAccept.css';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useForm();

  const [pageState, setPageState] = useState('loading');
  const [caseId, setCaseId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState(undefined); // undefined = auth not yet determined

  // Step 1: validate token
  useEffect(() => {
    fetch(buildApiUrl(`/api/v1/invitations/${token}`))
      .then(res => res.json())
      .then(data => {
        if (data.caseId) {
          setCaseId(data.caseId);
        } else {
          setPageState('invalid');
        }
      })
      .catch(() => setPageState('invalid'));
  }, [token]);

  // Step 2: watch Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Step 3: when token is valid AND auth is determined, proceed
  useEffect(() => {
    if (!caseId || user === undefined) return;
    if (!user) {
      setPageState('auth_required');
      return;
    }
    setPageState('accepting');
    user.getIdToken().then(async (idToken) => {
      try {
        const acceptRes = await fetch(buildApiUrl(`/api/v1/invitations/${token}/accept`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        });
        const acceptData = await acceptRes.json();
        if (!acceptRes.ok) {
          setErrorMsg(acceptData.error || 'Failed to accept invitation.');
          setPageState('error');
          return;
        }
        // Create a new Plan for parent 2
        try {
          const planRes = await fetch(buildApiUrl('/api/plan/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            // Pass the shared caseId so this plan links to the existing Case
            // (not a new one), enabling the comparison page to find both parents' answers.
            body: JSON.stringify({ caseId: acceptData.caseId }),
          });
          if (planRes.ok) {
            const plan = await planRes.json();
            dispatch({ type: 'UPDATE_SECTION', section: 'plan', payload: plan });
          }
        } catch (e) { /* non-fatal */ }

        setPageState('success');
        setTimeout(() => navigate('/getting-started'), 1500);
      } catch {
        setErrorMsg('Something went wrong. Please try again.');
        setPageState('error');
      }
    });
  }, [caseId, user]);

  return (
    <div className="invite-accept">
      <div className="invite-accept__card">
        <div className="invite-accept__logo">ShareCare</div>

        {pageState === 'loading' && (
          <div className="invite-accept__state">
            <Loader className="invite-accept__spinner" size={40} color="#14abdd" />
            <p>Validating your invite link...</p>
          </div>
        )}

        {pageState === 'invalid' && (
          <div className="invite-accept__state">
            <AlertCircle size={40} color="#ef4444" />
            <h2>Link Expired or Invalid</h2>
            <p>This invite link has expired or is no longer valid. Ask the other parent to send a new invite.</p>
            <Link to="/" className="invite-accept__btn">Go Home</Link>
          </div>
        )}

        {pageState === 'auth_required' && (
          <div className="invite-accept__state">
            <h2>Sign In to Accept</h2>
            <p>You've been invited to collaborate on a parenting plan. Sign in to accept the invitation.</p>
            <div className="invite-accept__auth-btns">
              <Link to={`/signin?redirect=/invite/${token}`} className="invite-accept__btn">Sign In</Link>
              <Link to={`/signup?redirect=/invite/${token}`} className="invite-accept__btn invite-accept__btn--secondary">Create Account</Link>
            </div>
          </div>
        )}

        {pageState === 'accepting' && (
          <div className="invite-accept__state">
            <Loader className="invite-accept__spinner" size={40} color="#14abdd" />
            <p>Accepting invitation...</p>
          </div>
        )}

        {pageState === 'error' && (
          <div className="invite-accept__state">
            <AlertCircle size={40} color="#ef4444" />
            <h2>Unable to Accept</h2>
            <p>{errorMsg}</p>
            <Link to="/dashboard" className="invite-accept__btn">Go to Dashboard</Link>
          </div>
        )}

        {pageState === 'success' && (
          <div className="invite-accept__state">
            <CheckCircle size={40} color="#22c55e" />
            <h2>You're In!</h2>
            <p>Invitation accepted. Taking you to your parenting plan...</p>
          </div>
        )}
      </div>
    </div>
  );
}
