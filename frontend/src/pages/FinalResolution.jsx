import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import { AlertTriangle, ArrowLeft, Flag } from 'lucide-react';
import './FinalResolution.css';

export default function FinalResolution() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [questionMap, setQuestionMap] = useState({});
  // { [qKey]: { choice: 'keep'|'coparent'|'custom', customText: string } }
  const [selections, setSelections] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/signin'); return; }
      try {
        const idToken = await user.getIdToken();

        const statusRes = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/status`), {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!statusRes.ok) { setError('Failed to load case.'); setLoading(false); return; }
        const statusData = await statusRes.json();
        if (!statusData.isParent1 || statusData.status !== 'resolutions_reviewed') {
          navigate(`/waiting/${caseId}`); return;
        }

        const [resRes, reviewRes, questionsRes, compRes] = await Promise.all([
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/resolutions`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/resolutions/review`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch(buildApiUrl('/api/logic-engine/questions')),
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/plan-comparison`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
        ]);

        if (!resRes.ok || !reviewRes.ok) { setError('Failed to load resolution data.'); setLoading(false); return; }

        const resData = await resRes.json();
        const reviewData = await reviewRes.json();

        const flaggedKeys = new Set(
          (reviewData.reviews || []).filter((r) => !r.accepted).map((r) => r.qKey)
        );

        // Attach P2's original answer from plan-comparison
        const p2Map = {};
        if (compRes.ok) {
          const compData = await compRes.json();
          (compData.diff || []).forEach((d) => { p2Map[d.questionKey] = d.parent2Answer; });
        }

        const items = (resData.resolutions || [])
          .filter((r) => flaggedKeys.has(r.qKey))
          .map((r) => ({ ...r, parent2Answer: p2Map[r.qKey] }));
        setFlaggedItems(items);

        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          const questions = Array.isArray(questionsData) ? questionsData : questionsData.questions || [];
          const map = {};
          questions.forEach((q) => { if (q.qKey) map[q.qKey] = q.qText || q.qKey; });
          setQuestionMap(map);
        }
      } catch (e) {
        setError('Failed to load data.');
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

  const setChoice = (qKey, choice) =>
    setSelections((prev) => ({ ...prev, [qKey]: { choice, customText: prev[qKey]?.customText ?? '' } }));

  const setCustomText = (qKey, text) =>
    setSelections((prev) => ({ ...prev, [qKey]: { choice: 'custom', customText: text } }));

  const allSelected = flaggedItems.length === 0 && flaggedItems.every((r) => {
    const sel = selections[r.qKey];
    if (!sel) return false;
    if (sel.choice === 'custom') return sel.customText.trim().length > 0;
    return true;
  });

  const handleSubmit = async () => {
    setSubmitStatus('saving');
    try {
      const idToken = await auth.currentUser.getIdToken();

      // Build finalAnswers: only include items where P1 is NOT keeping their original answer.
      // Backend counts items missing from finalAnswers as still-disagreed.
      const finalAnswers = {};
      flaggedItems.forEach((r) => {
        const sel = selections[r.qKey];
        if (!sel) return;
        if (sel.choice === 'coparent') {
          finalAnswers[r.qKey] = r.parent2Answer;
        } else if (sel.choice === 'custom') {
          finalAnswers[r.qKey] = sel.customText.trim();
        }
        // 'keep' → omit from finalAnswers → backend marks as remaining disagreement
      });

      const res = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/resolutions/final`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ finalAnswers }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      navigate(`/comparison/${caseId}`);
    } catch (e) {
      console.error(e);
      setSubmitStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="final-res final-res--centered">
        <div className="final-res__spinner" />
        <p>Loading flagged items…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="final-res final-res--centered">
        <AlertTriangle size={40} color="#f97316" />
        <p className="final-res__error">{error}</p>
        <button className="final-res__back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="final-res">
      <div className="final-res__header">
        <button className="final-res__nav-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div>
          <h1 className="final-res__title">Final Review</h1>
          <p className="final-res__subtitle">
            Your co-parent flagged {flaggedItems.length} item{flaggedItems.length !== 1 ? 's' : ''} for further discussion.
            For each, choose your final answer. Items you keep will be marked for mediation discussion.
          </p>
        </div>
      </div>

      <div className="final-res__content">
        {flaggedItems.length === 0 ? (
          <div className="final-res__empty">
            No flagged items — your co-parent accepted all proposed resolutions.
          </div>
        ) : (
          flaggedItems.map((r) => {
            const sel = selections[r.qKey] ?? {};
            return (
              <div key={r.qKey} className="final-res__card">
                <div className="final-res__question-row">
                  <Flag size={15} color="#f97316" />
                  <span className="final-res__question">{questionMap[r.qKey] || r.qKey}</span>
                </div>

                <div className="final-res__ref-row">
                  <div className="final-res__ref-block">
                    <span className="final-res__ref-label">Your proposed answer</span>
                    <span className="final-res__ref-value">{formatAnswer(r.proposedAnswer)}</span>
                  </div>
                  <div className="final-res__ref-block">
                    <span className="final-res__ref-label">Co-parent's answer</span>
                    <span className="final-res__ref-value">{formatAnswer(r.parent2Answer)}</span>
                  </div>
                </div>

                <div className="final-res__choices">
                  <label className={`final-res__choice ${sel.choice === 'keep' ? 'final-res__choice--selected' : ''}`}>
                    <input type="radio" name={r.qKey} value="keep" checked={sel.choice === 'keep'} onChange={() => setChoice(r.qKey, 'keep')} />
                    Keep my answer
                  </label>
                  <label className={`final-res__choice ${sel.choice === 'coparent' ? 'final-res__choice--selected' : ''}`}>
                    <input type="radio" name={r.qKey} value="coparent" checked={sel.choice === 'coparent'} onChange={() => setChoice(r.qKey, 'coparent')} />
                    Use co-parent's answer
                  </label>
                  <label className={`final-res__choice ${sel.choice === 'custom' ? 'final-res__choice--selected' : ''}`}>
                    <input type="radio" name={r.qKey} value="custom" checked={sel.choice === 'custom'} onChange={() => setChoice(r.qKey, 'custom')} />
                    Enter a custom answer
                  </label>
                  {sel.choice === 'custom' && (
                    <input
                      className="final-res__custom-input"
                      type="text"
                      placeholder="Type your final answer…"
                      value={sel.customText ?? ''}
                      onChange={(e) => setCustomText(r.qKey, e.target.value)}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}

        <div className="final-res__submit-row">
          <button
            className="final-res__submit-btn"
            onClick={handleSubmit}
            disabled={!allSelected || submitStatus === 'saving'}
          >
            {submitStatus === 'saving' ? 'Submitting…' : 'Submit Final Answers →'}
          </button>
          {!allSelected && flaggedItems.length > 0 && (
            <p className="final-res__submit-hint">Make a selection for each item above to continue.</p>
          )}
          {submitStatus === 'error' && (
            <p className="final-res__submit-error">Failed to submit. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
