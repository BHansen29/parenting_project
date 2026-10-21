import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import { CUSTOM_COMPARISON_QUESTIONS } from '../lib/comparisonQuestionDefinitions';
import { CheckCircle, AlertTriangle, Users, ArrowLeft, Printer } from 'lucide-react';
import './Comparison.css';

const MEDIATION_RESOURCES = [
  'Ohio Mediation Association: ohiomediation.org',
  'Ohio State Bar Association Lawyer Referral: ohiobar.org',
  'Family Court Self-Help Center: contact your local courthouse',
];
export default function Comparison() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diff, setDiff] = useState([]);
  const [caseStatus, setCaseStatus] = useState('');
  const [isParent1, setIsParent1] = useState(false);
  const [parentNames, setParentNames] = useState({ parent1: 'Parent 1', parent2: 'Parent 2' });
  const [sharedAnswers, setSharedAnswers] = useState({});
  const [questionMap, setQuestionMap] = useState({});
  const [activeTab, setActiveTab] = useState('merged');

  // P1 resolution selections: { [qKey]: { choice: 'parent1'|'parent2'|'custom', customText: '' } }
  const [selections, setSelections] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | saving | saved | error

  // qKeys P2 flagged that P1 kept (still need discussion)
  const [needsDiscussionKeys, setNeedsDiscussionKeys] = useState(new Set());
  const [restartStatus, setRestartStatus] = useState('idle');

  const parent1Name = isParent1 ? 'Your' : "Co-parent's";
  const parent2Name = isParent1 ? "Co-parent's" : 'Your';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/signin'); return; }
      try {
        const idToken = await user.getIdToken();

        const [statusRes, compRes, questionsRes] = await Promise.all([
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/status`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/plan-comparison`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch(buildApiUrl('/api/logic-engine/questions')),
        ]);

        if (!statusRes.ok) { setError('Failed to load case status.'); setLoading(false); return; }
        const statusData = await statusRes.json();
        const status = statusData.status;
        const parent1 = statusData.isParent1;
        setCaseStatus(status);
        setIsParent1(parent1);
        setParentNames({
          parent1: statusData.parent1Name || 'Parent 1',
          parent2: statusData.parent2Name || 'Parent 2',
        });
        setSharedAnswers(statusData.sharedAnswers || {});

        // Redirect based on status + role
        if (status === 'comparison_ready' && !parent1) {
          navigate(`/waiting/${caseId}`); return;
        }
        if (status === 'resolutions_pending') {
          navigate(parent1 ? `/waiting/${caseId}` : `/resolution-review/${caseId}`); return;
        }
        const compData = await compRes.json();
        if (!compRes.ok) { setError(compData.error || 'Failed to load comparison.'); setLoading(false); return; }

        setDiff(compData.diff || []);

        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          const questions = Array.isArray(questionsData) ? questionsData : questionsData.questions || [];
          const map = { ...CUSTOM_COMPARISON_QUESTIONS };
          questions.forEach((q) => { if (q.qKey) map[q.qKey] = q; });
          setQuestionMap(map);
        }

        // For resolved/needs_discussion: fetch resolutions and P2's review.
        if (['resolved', 'needs_discussion', 'resolutions_reviewed'].includes(status)) {
          const reviewRes = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/resolutions/review`), {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (reviewRes?.ok) {
            const reviewData = await reviewRes.json();
            // Items P2 flagged AND P1 kept (not in resolvedAnswers changes) are still disagreed.
            // The backend already computed this: status is needs_discussion only for kept items.
            // We show exactly the items P2 flagged that P1 chose "keep my answer" for —
            // those are flagged keys where P1's final answer equals their original proposed answer.
            const flaggedKeys = new Set(
              (reviewData.reviews || []).filter((r) => !r.accepted).map((r) => r.qKey)
            );
            setNeedsDiscussionKeys(flaggedKeys);
          }
        }
      } catch (e) {
        setError('Failed to load comparison data.');
      }
      setLoading(false);
    });
    return unsub;
  }, [caseId, navigate]);

  const agreed = diff.filter((d) => d.agreement);
  const disagreed = diff.filter((d) => !d.agreement);

  const formatAnswer = (val, answerOwner, questionKey) => {
    if (val === null || val === undefined) return 'Not answered';
    if (typeof val === 'string' && answerOwner) {
      if (['me', 'meOnly'].includes(val)) return 'Just me';
      if (['coParent', 'coParentOnly'].includes(val)) return 'Just my co-parent';
      if (val === 'parent1') return answerOwner === 'parent1' ? 'Just me' : 'Just my co-parent';
      if (val === 'parent2') return answerOwner === 'parent1' ? 'Just my co-parent' : 'Just me';
    }
    if (Array.isArray(val)) return val.map((value) => formatAnswer(value, answerOwner, questionKey)).join(', ');
    if (val && typeof val === 'object') return JSON.stringify(val);
    const option = questionMap[questionKey]?.options?.find((item) => item.value === val);
    if (option?.label) return option.label;
    return String(val);
  };

  const setSelection = (qKey, choice) => {
    setSelections((prev) => ({
      ...prev,
      [qKey]: { choice, customText: prev[qKey]?.customText ?? '' },
    }));
  };

  const setCustomText = (qKey, text) => {
    setSelections((prev) => ({
      ...prev,
      [qKey]: { choice: 'custom', customText: text },
    }));
  };

  const allResolved = disagreed.length > 0 && disagreed.every((item) => {
    const sel = selections[item.questionKey];
    if (!sel) return false;
    if (sel.choice === 'custom') return sel.customText.trim().length > 0;
    return true;
  });

  const handleSendResolutions = async () => {
    setSubmitStatus('saving');
    try {
      const idToken = await auth.currentUser.getIdToken();
      const resolutions = disagreed.map((item) => {
        const sel = selections[item.questionKey];
        const proposedAnswer = sel.choice === 'parent1'
          ? item.parent1Answer
          : sel.choice === 'parent2'
            ? item.parent2Answer
            : sel.customText.trim();
        return { qKey: item.questionKey, proposedAnswer, source: sel.choice };
      });

      const res = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/resolutions`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ resolutions }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitStatus('saved');
      navigate(`/waiting/${caseId}`);
    } catch (e) {
      console.error(e);
      setSubmitStatus('error');
    }
  };

  const handleRestartComparison = async () => {
    if (!window.confirm('Restart the comparison? This clears the shared merged answers but keeps both individual plans unchanged.')) return;

    setRestartStatus('saving');
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/restart-comparison`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Failed to restart comparison');
      window.location.reload();
    } catch (e) {
      console.error(e);
      setRestartStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="comparison comparison--centered">
        <div className="comparison__spinner" />
        <p>Loading comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison comparison--centered">
        <AlertTriangle size={40} color="#f97316" />
        <p className="comparison__error">{error}</p>
        <button className="comparison__back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  if (caseStatus === 'waiting_for_coparent') {
    return (
      <div className="comparison comparison--centered">
        <Users size={48} color="#14abdd" />
        <h2>Waiting for Co-parent</h2>
        <p>Your co-parent hasn't joined yet. Once they accept the invite, you'll see the comparison here.</p>
        <button className="comparison__back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  // ── final comparison view ─────────────────────────────────────────────────
  if (['resolved', 'needs_discussion', 'resolutions_reviewed'].includes(caseStatus)) {
    const sharedItems = Object.entries(sharedAnswers).map(([qKey, answer]) => ({ qKey, answer }));
    const agreedItems = sharedItems.filter((item) => !needsDiscussionKeys.has(item.qKey));
    const discussionItems = sharedItems.filter((item) => needsDiscussionKeys.has(item.qKey));
    return (
      <div className="comparison">
        <div className="comparison__header">
          <button className="comparison__nav-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <div>
            <h1 className="comparison__title">Final Parenting Plan Comparison</h1>
            <p className="comparison__subtitle">
              <CheckCircle size={16} color="#22c55e" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              {agreedItems.length} agreed, {discussionItems.length} need discussion
            </p>
          </div>
        </div>
        <div className="comparison__tabs">
          <button
            className={`comparison__tab ${activeTab === 'merged' ? 'comparison__tab--active' : ''}`}
            onClick={() => setActiveTab('merged')}
          >
            Agreed ({agreedItems.length})
          </button>
          <button
            className={`comparison__tab ${activeTab === 'discussion' ? 'comparison__tab--active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            Needs Discussion ({discussionItems.length})
          </button>
        </div>
        <div className="comparison__content">
          <div className="comparison__submit-row comparison__final-actions">
              <button
                className="comparison__download-btn"
              >
                <Printer size={16} /> Print / Save PDF
              </button>
              <button
                className="comparison__download-btn"
                onClick={handleRestartComparison}
                disabled={restartStatus === 'saving'}
              >
                {restartStatus === 'saving' ? 'Restarting...' : 'Restart Comparison'}
              </button>
              {restartStatus === 'error' && (
                <p className="comparison__submit-error">Failed to restart. Please try again.</p>
              )}
            </div>
          {activeTab === 'merged' && agreedItems.map((item) => (
            <div key={item.qKey} className="comparison__card comparison__agreed">
              <div className="comparison__question">{questionMap[item.qKey]?.qText || item.qKey}</div>
              <div className="comparison__answer-agreed">
                <CheckCircle size={16} color="#22c55e" />
                {formatAnswer(item.answer, isParent1 ? 'parent1' : 'parent2', item.qKey)}
              </div>
            </div>
          ))}
          {activeTab === 'discussion' && (
            <>
              <div className="comparison__discussion-banner">
                <AlertTriangle size={20} color="#f97316" />
                <p>These items still need agreement. Please discuss them together or consider seeking mediation support.</p>
              </div>
              {discussionItems.map((item) => (
                <div key={item.qKey} className="comparison__card comparison__disagreed">
                  <div className="comparison__question">{questionMap[item.qKey]?.qText || item.qKey}</div>
                  <div className="comparison__answer-row">
                    <div className="comparison__answer-col">
                      <span className="comparison__parent-label">Shared answer</span>
                      <span className="comparison__answer-value">{formatAnswer(item.answer, isParent1 ? 'parent1' : 'parent2', item.qKey)}</span>
                    </div>
                    <div className="comparison__answer-divider"><AlertTriangle size={16} color="#f97316" /></div>
                    <div className="comparison__answer-col">
                      <span className="comparison__parent-label">Status</span>
                      <span className="comparison__answer-value">Needs discussion</span>
                    </div>
                  </div>
                </div>
              ))}
              {discussionItems.length > 0 && (
                <div className="comparison__mediation-box">
                  <h3>Mediation Resources</h3>
                  <ul>{MEDIATION_RESOURCES.map((resource) => <li key={resource}>{resource}</li>)}</ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── comparison_ready view (P1 resolution mode) ────────────────────────────
  return (
    <div className="comparison">
      <div className="comparison__header">
        <button className="comparison__nav-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div>
          <h1 className="comparison__title">Parenting Plan Comparison</h1>
          <p className="comparison__subtitle">
            <CheckCircle size={16} color="#22c55e" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            {agreed.length} of {diff.length} questions in agreement
          </p>
        </div>
      </div>

      <div className="comparison__tabs">
        <button
          className={`comparison__tab ${activeTab === 'merged' ? 'comparison__tab--active' : ''}`}
          onClick={() => setActiveTab('merged')}
        >
          Agreed ({agreed.length})
        </button>
        <button
          className={`comparison__tab ${activeTab === 'differences' ? 'comparison__tab--active' : ''}`}
          onClick={() => setActiveTab('differences')}
        >
          Differences ({disagreed.length})
        </button>
      </div>

      <div className="comparison__content">
        {activeTab === 'merged' && (
          <div>
            <div className="comparison__section-header">
              <h2>Agreed Answers</h2>
              <p>These answers are identical for both parents and will be included in the final plan.</p>
            </div>
            {agreed.length === 0 ? (
              <div className="comparison__empty">No agreed answers yet — complete more of the questionnaire.</div>
            ) : (
              agreed.map((item) => (
                <div key={item.questionKey} className="comparison__card comparison__agreed">
                  <div className="comparison__question">{questionMap[item.questionKey]?.qText || item.questionKey}</div>
                  <div className="comparison__answer-agreed">
                    <CheckCircle size={16} color="#22c55e" />
                    {formatAnswer(
                      isParent1 ? item.parent1Answer : item.parent2Answer,
                      isParent1 ? 'parent1' : 'parent2',
                      item.questionKey
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'differences' && (
          <div>
            <div className="comparison__section-header">
              <h2>Resolve Differences</h2>
              <p>
                {isParent1
                  ? 'For each difference, choose which answer to propose or enter a custom one. When done, send your proposed resolutions to your co-parent.'
                  : 'Your co-parent is reviewing these differences and will propose resolutions.'}
              </p>
            </div>

            {disagreed.length === 0 ? (
              <div className="comparison__empty">No differences — you agree on everything!</div>
            ) : (
              disagreed.map((item) => {
                const sel = selections[item.questionKey] ?? {};
                return (
                  <div key={item.questionKey} className="comparison__card comparison__disagreed">
                    <div className="comparison__question">{questionMap[item.questionKey]?.qText || item.questionKey}</div>
                    <div className="comparison__answer-row">
                      <div className="comparison__answer-col">
                        <span className="comparison__parent-label">{parent1Name} answer</span>
                        <span className="comparison__answer-value">{formatAnswer(item.parent1Answer, 'parent1', item.questionKey)}</span>
                      </div>
                      <div className="comparison__answer-divider"><AlertTriangle size={16} color="#f97316" /></div>
                      <div className="comparison__answer-col">
                        <span className="comparison__parent-label">{parent2Name} answer</span>
                        <span className="comparison__answer-value">{formatAnswer(item.parent2Answer, 'parent2', item.questionKey)}</span>
                      </div>
                    </div>

                    {isParent1 && (
                      <div className="comparison__resolution-choices">
                        <label className={`comparison__choice ${sel.choice === 'parent1' ? 'comparison__choice--selected' : ''}`}>
                          <input type="radio" name={item.questionKey} value="parent1" checked={sel.choice === 'parent1'} onChange={() => setSelection(item.questionKey, 'parent1')} />
                          Keep my answer
                        </label>
                        <label className={`comparison__choice ${sel.choice === 'parent2' ? 'comparison__choice--selected' : ''}`}>
                          <input type="radio" name={item.questionKey} value="parent2" checked={sel.choice === 'parent2'} onChange={() => setSelection(item.questionKey, 'parent2')} />
                          Use co-parent's answer
                        </label>
                        <label className={`comparison__choice ${sel.choice === 'custom' ? 'comparison__choice--selected' : ''}`}>
                          <input type="radio" name={item.questionKey} value="custom" checked={sel.choice === 'custom'} onChange={() => setSelection(item.questionKey, 'custom')} />
                          Enter a custom answer
                        </label>
                        {sel.choice === 'custom' && (
                          <input
                            className="comparison__custom-input"
                            type="text"
                            placeholder="Type your proposed answer..."
                            value={sel.customText ?? ''}
                            onChange={(e) => setCustomText(item.questionKey, e.target.value)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isParent1 && disagreed.length > 0 && (
              <div className="comparison__submit-row">
                <button
                  className="comparison__download-btn"
                  onClick={handleSendResolutions}
                  disabled={!allResolved || submitStatus === 'saving'}
                >
                  {submitStatus === 'saving' ? 'Sending...' : 'Send Resolutions to Co-Parent →'}
                </button>
                {!allResolved && (
                  <p className="comparison__submit-hint">Resolve all differences above to continue.</p>
                )}
                {submitStatus === 'error' && (
                  <p className="comparison__submit-error">Failed to send. Please try again.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
