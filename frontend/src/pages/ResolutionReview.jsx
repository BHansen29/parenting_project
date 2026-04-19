import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import { CheckCircle, Flag, AlertTriangle, ArrowLeft } from 'lucide-react';
import './ResolutionReview.css';

export default function ResolutionReview() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolutions, setResolutions] = useState([]); // P1's proposed answers
  const [diffMap, setDiffMap] = useState({});          // { qKey: { parent2Answer } }
  const [questionMap, setQuestionMap] = useState({});   // { qKey: qText }
  // { [qKey]: true (accepted) | false (flagged) }
  const [reviews, setReviews] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | saving | error

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/signin'); return; }
      try {
        const idToken = await user.getIdToken();

        // Guard: verify this user is P2 and status is resolutions_pending
        const statusRes = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/status`), {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!statusRes.ok) { setError('Failed to load case.'); setLoading(false); return; }
        const statusData = await statusRes.json();
        if (statusData.isParent1 || statusData.status !== 'resolutions_pending') {
          navigate(`/waiting/${caseId}`); return;
        }

        const [resRes, compRes, questionsRes] = await Promise.all([
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/resolutions`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/plan-comparison`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch(buildApiUrl('/api/logic-engine/questions')),
        ]);

        if (!resRes.ok) { setError('No resolutions found.'); setLoading(false); return; }
        const resData = await resRes.json();
        setResolutions(resData.resolutions || []);

        if (compRes.ok) {
          const compData = await compRes.json();
          const map = {};
          (compData.diff || []).filter((d) => !d.agreement).forEach((d) => {
            map[d.questionKey] = { parent2Answer: d.parent2Answer };
          });
          setDiffMap(map);
        }

        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          const questions = Array.isArray(questionsData) ? questionsData : questionsData.questions || [];
          const map = {};
          questions.forEach((q) => { if (q.qKey) map[q.qKey] = q.qText || q.qKey; });
          setQuestionMap(map);
        }
      } catch (e) {
        setError('Failed to load resolution data.');
      }
      setLoading(false);
    });
    return unsub;
  }, [caseId, navigate]);

  const formatAnswer = (val) => {
    if (val === null || val === undefined) return 'Not answered';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  };

  const allReviewed = resolutions.length > 0 && resolutions.every((r) => reviews[r.qKey] !== undefined);

  const handleSubmit = async () => {
    setSubmitStatus('saving');
    try {
      const idToken = await auth.currentUser.getIdToken();
      const reviewsArray = resolutions.map((r) => ({ qKey: r.qKey, accepted: reviews[r.qKey] }));

      const res = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/resolutions/review`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ reviews: reviewsArray }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      navigate(`/waiting/${caseId}`);
    } catch (e) {
      console.error(e);
      setSubmitStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="res-review res-review--centered">
        <div className="res-review__spinner" />
        <p>Loading resolutions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="res-review res-review--centered">
        <AlertTriangle size={40} color="#f97316" />
        <p className="res-review__error">{error}</p>
        <button className="res-review__back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const acceptedCount = Object.values(reviews).filter(Boolean).length;
  const flaggedCount = Object.values(reviews).filter((v) => v === false).length;

  return (
    <div className="res-review">
      <div className="res-review__header">
        <button className="res-review__nav-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div>
          <h1 className="res-review__title">Review Proposed Resolutions</h1>
          <p className="res-review__subtitle">
            Your co-parent has proposed answers for each point of disagreement. Accept each one or flag it for further discussion.
          </p>
        </div>
      </div>

      <div className="res-review__content">
        <div className="res-review__progress">
          <span className="res-review__progress-item res-review__progress-item--accepted">
            <CheckCircle size={14} /> {acceptedCount} accepted
          </span>
          <span className="res-review__progress-item res-review__progress-item--flagged">
            <Flag size={14} /> {flaggedCount} flagged
          </span>
          <span className="res-review__progress-item">
            {resolutions.length - acceptedCount - flaggedCount} remaining
          </span>
        </div>

        {resolutions.map((r) => {
          const accepted = reviews[r.qKey];
          return (
            <div
              key={r.qKey}
              className={`res-review__card ${accepted === true ? 'res-review__card--accepted' : accepted === false ? 'res-review__card--flagged' : ''}`}
            >
              <div className="res-review__question">{questionMap[r.qKey] || r.qKey}</div>

              <div className="res-review__answers">
                <div className="res-review__answer-block res-review__answer-block--proposed">
                  <span className="res-review__answer-label">Co-parent's proposed answer</span>
                  <span className="res-review__answer-value">{formatAnswer(r.proposedAnswer)}</span>
                </div>
                <div className="res-review__answer-block">
                  <span className="res-review__answer-label">Your original answer</span>
                  <span className="res-review__answer-value">{formatAnswer(diffMap[r.qKey]?.parent2Answer)}</span>
                </div>
              </div>

              <div className="res-review__actions">
                <button
                  className={`res-review__btn res-review__btn--accept ${accepted === true ? 'res-review__btn--active' : ''}`}
                  onClick={() => setReviews((prev) => ({ ...prev, [r.qKey]: true }))}
                >
                  <CheckCircle size={15} /> Accept
                </button>
                <button
                  className={`res-review__btn res-review__btn--flag ${accepted === false ? 'res-review__btn--active-flag' : ''}`}
                  onClick={() => setReviews((prev) => ({ ...prev, [r.qKey]: false }))}
                >
                  <Flag size={15} /> Flag for Discussion
                </button>
              </div>
            </div>
          );
        })}

        <div className="res-review__submit-row">
          <button
            className="res-review__submit-btn"
            onClick={handleSubmit}
            disabled={!allReviewed || submitStatus === 'saving'}
          >
            {submitStatus === 'saving' ? 'Sending…' : 'Send Feedback to Co-Parent →'}
          </button>
          {!allReviewed && (
            <p className="res-review__submit-hint">Review all items above to continue.</p>
          )}
          {submitStatus === 'error' && (
            <p className="res-review__submit-error">Failed to send. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
