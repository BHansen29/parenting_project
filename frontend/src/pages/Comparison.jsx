import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import { CheckCircle, AlertTriangle, Users, Download, ArrowLeft } from 'lucide-react';
import './Comparison.css';

export default function Comparison() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diff, setDiff] = useState([]);
  const [caseStatus, setCaseStatus] = useState('');
  const [questionMap, setQuestionMap] = useState({}); // qKey → qText
  const [activeTab, setActiveTab] = useState('merged');
  // tracks which parent's answer was selected for each disagreed question
  const [selections, setSelections] = useState({});
  // tracks the save state of the merge action
  const [mergeStatus, setMergeStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/signin'); return; }

      try {
        const idToken = await user.getIdToken();

        const [compRes, questionsRes] = await Promise.all([
          fetch(buildApiUrl(`/api/v1/cases/${caseId}/plan-comparison`), {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch(buildApiUrl('/api/logic-engine/questions')),
        ]);

        const compData = await compRes.json();
        if (!compRes.ok) {
          setError(compData.error || 'Failed to load comparison.');
          setLoading(false);
          return;
        }

        setCaseStatus(compData.status);
        setDiff(compData.diff || []);

        // Build qKey → qText lookup from questions response
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          const questions = Array.isArray(questionsData) ? questionsData : questionsData.questions || [];
          const map = {};
          questions.forEach(q => { if (q.qKey) map[q.qKey] = q.qText || q.qKey; });
          setQuestionMap(map);
        }
      } catch (e) {
        setError('Failed to load comparison data.');
      }

      setLoading(false);
    });
    return unsub;
  }, [caseId]);

  const agreed = diff.filter(d => d.agreement);
  const disagreed = diff.filter(d => !d.agreement);

  const formatAnswer = (val) => {
    if (val === null || val === undefined) return 'Not answered';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  };

  const handleMerge = async () => {
    setMergeStatus('saving');
    // Guard against auth session expiring between page load and clicking save
    if (!auth.currentUser) { setMergeStatus('error'); return; }
    try {
      const idToken = await auth.currentUser.getIdToken();

      // Build the full merged answer map:
      // - Agreed items: both parents gave the same answer, use parent1's
      // - Disagreed items: use whichever parent the user selected
      const mergedAnswers = {};
      agreed.forEach(item => { mergedAnswers[item.questionKey] = item.parent1Answer; });
      disagreed.forEach(item => {
        const pick = selections[item.questionKey];
        mergedAnswers[item.questionKey] = pick === 'parent1' ? item.parent1Answer : item.parent2Answer;
      });

      const res = await fetch(buildApiUrl(`/api/v1/cases/${caseId}/merge`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ mergedAnswers }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMergeStatus('saved');
    } catch (err) {
      console.error('Merge failed:', err);
      setMergeStatus('error');
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

  // Only block if the co-parent hasn't joined yet — an empty diff just means
  // neither parent has answered questions yet, which is still a valid comparison.
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
          Merged Plan ({agreed.length})
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
              <h2>Your Agreed Plan</h2>
              <p>These answers are the same for both parents and form the basis of your parenting plan.</p>
              <button className="comparison__download-btn">
                <Download size={16} /> Download Plan
              </button>
            </div>
            {agreed.length === 0 ? (
              <div className="comparison__empty">No agreed answers yet — complete more of the questionnaire.</div>
            ) : (
              agreed.map((item) => (
                <div key={item.questionKey} className="comparison__card comparison__agreed">
                  <div className="comparison__question">{questionMap[item.questionKey] || item.questionKey}</div>
                  <div className="comparison__answer-agreed">
                    <CheckCircle size={16} color="#22c55e" />
                    {formatAnswer(item.parent1Answer)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'differences' && (
          <div>
            <div className="comparison__section-header">
              <h2>Items Needing Discussion</h2>
              <p>These are areas where you and your co-parent answered differently. Review and discuss to reach agreement.</p>
            </div>
            {disagreed.length === 0 ? (
              <div className="comparison__empty">No differences — you agree on everything!</div>
            ) : (
              disagreed.map((item) => {
                const selected = selections[item.questionKey];
                return (
                  <div key={item.questionKey} className="comparison__card comparison__disagreed">
                    <div className="comparison__question">{questionMap[item.questionKey] || item.questionKey}</div>
                    {/* Clicking a column selects that parent's answer for this question */}
                    <div className="comparison__answer-row">
                      <div
                        className="comparison__answer-col"
                        onClick={() => setSelections(prev => ({ ...prev, [item.questionKey]: 'parent1' }))}
                        style={{ cursor: 'pointer', borderRadius: 6, padding: 8, background: selected === 'parent1' ? '#dcfce7' : 'transparent', border: selected === 'parent1' ? '2px solid #22c55e' : '2px solid transparent' }}
                      >
                        <span className="comparison__parent-label">Parent 1</span>
                        <span className="comparison__answer-value">{formatAnswer(item.parent1Answer)}</span>
                      </div>
                      <div className="comparison__answer-divider">
                        <AlertTriangle size={16} color="#f97316" />
                      </div>
                      <div
                        className="comparison__answer-col"
                        onClick={() => setSelections(prev => ({ ...prev, [item.questionKey]: 'parent2' }))}
                        style={{ cursor: 'pointer', borderRadius: 6, padding: 8, background: selected === 'parent2' ? '#dcfce7' : 'transparent', border: selected === 'parent2' ? '2px solid #22c55e' : '2px solid transparent' }}
                      >
                        <span className="comparison__parent-label">Parent 2</span>
                        <span className="comparison__answer-value">{formatAnswer(item.parent2Answer)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {/* Save button — disabled until every disagreed item has a selection */}
            {disagreed.length > 0 && (
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button
                  className="comparison__download-btn"
                  onClick={handleMerge}
                  disabled={disagreed.some(item => !selections[item.questionKey]) || mergeStatus === 'saving'}
                >
                  {mergeStatus === 'saving' ? 'Saving...' : mergeStatus === 'saved' ? 'Saved!' : 'Save Merged Plan'}
                </button>
                {mergeStatus === 'error' && <p style={{ color: '#ef4444', marginTop: 8 }}>Failed to save. Try again.</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
