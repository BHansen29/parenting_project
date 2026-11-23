import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Archive, CarFront, Check, CircleHelp, Eye, EyeOff, House, Plus, RotateCcw, Scale, Users, UserRound } from 'lucide-react';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import RadioQuestion from '../components/forms/RadioQuestion';
import TextQuestion from '../components/forms/TextQuestion';
import Disclaimer from '../components/forms/Disclaimer';
import SectionHeader from '../components/forms/SectionHeader';
import './AdminQuestionEditor.css';

const questionTypes = ['multiple choice', 'text input'];
const questionSections = [
  'getting-started',
  'parental-rights',
  'parenting-time-communication',
  'informationsharing',
  'tax-exemptions',
  'review'
];
const questionSectionLabels = {
  'getting-started': 'Getting Started',
  'parental-rights': 'Parental Rights',
  'parenting-time-communication': 'Parenting Time & Communication',
  'informationsharing': 'Information Sharing',
  'tax-exemptions': 'Tax Exemptions',
  'review': 'Review'
};
function getEditorPageSection(section) {
  if (section === 'health-insurance-coverage') return 'parental-rights';
  if (section === 'custody-schedule' || section === 'transportation') {
    return 'parenting-time-communication';
  }
  return section;
}
const questionIcons = ['scale-icon', 'user-icon', 'info-icon', 'users-icon', 'house-icon', 'car-icon'];
const iconComponents = {
  'scale-icon': Scale,
  'user-icon': UserRound,
  'info-icon': CircleHelp,
  'users-icon': Users,
  'house-icon': House,
  'car-icon': CarFront
};

const createDefaults = {
  qKey: '',
  qTitle: '',
  qIntro: '',
  qDisclaimer: '',
  qText: '',
  type: 'multiple choice',
  qIcon: 'scale-icon',
  section: 'parental-rights',
  appliesToGroup: '',
  multipleChildren: false,
  includeInComparison: true,
  options: []
};

async function adminRequest(user, path, options = {}) {
  const token = await user.getIdToken();
  const response = await fetch(buildApiUrl(`/api/admin${path}`), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Administrator request failed');
  }

  return payload;
}

function normalizeRule(rule) {
  return {
    isDefault: rule?.isDefault ?? true,
    goToDefault: rule?.goToDefault || '',
    notApplicableGoTo: rule?.notApplicableGoTo || '',
    nextQuestions: (rule?.nextQuestions || []).map(({ operator, value, goTo }) => ({
      operator,
      value,
      goTo
    }))
  };
}

function normalizeQuestion(question) {
  return {
    type: question.type,
    qTitle: question.qTitle,
    qIntro: question.qIntro || '',
    qDisclaimer: question.qDisclaimer || '',
    qIcon: question.qIcon,
    qText: question.qText,
    section: question.section,
    appliesToGroup: question.appliesToGroup || '',
    multipleChildren: question.multipleChildren === true,
    includeInComparison: question.includeInComparison !== false,
    options: (question.options || []).map(({ value = '', label = '', description = '' }) => ({
      value,
      label,
      description
    }))
  };
}

function EditorField({ label, value, onChange, multiline = false, ...props }) {
  const Control = multiline ? 'textarea' : 'input';
  return (
    <label className="admin-editor__field">
      <span>{label}</span>
      <Control value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

function QuestionPreview({ question, onChange }) {
  const Icon = iconComponents[question.qIcon] || CircleHelp;
  const hasChoices = question.type === 'multiple choice' || question.type === 'checkbox';
  const showTextInput = question.type === 'text input' || question.type === 'integer input';
  const options = Array.isArray(question.options) ? question.options : [];

  return (
    <article className="admin-editor__question-card">
      <header className="admin-editor__question-heading">
        <div className={`admin-editor__question-icon ${question.qIcon}`}>
          <Icon size={23} aria-hidden="true" />
        </div>
        <div className="admin-editor__question-heading-fields">
          <EditorField
            label="Section title"
            value={question.qTitle}
            onChange={(value) => onChange('qTitle', value)}
            required
            maxLength={500}
          />
          <span className="admin-editor__question-key">{question.qKey}</span>
        </div>
      </header>

      <div className="admin-editor__prompt-card">
        <EditorField
          label="Question"
          value={question.qText}
          onChange={(value) => onChange('qText', value)}
          multiline
          rows={2}
          required
          maxLength={10000}
        />

        <EditorField
          label={question.type === 'multiple choice' ? 'Help text' : 'Intro'}
          value={question.qIntro || ''}
          onChange={(value) => onChange('qIntro', value)}
          multiline
          rows={2}
          maxLength={5000}
        />

        {hasChoices && (
          <div className="admin-editor__choice-list">
            {options.map((option, index) => (
              <div className="admin-editor__choice" key={`${question.qKey}-option-${index}`}>
                <span className={question.type === 'checkbox' ? 'admin-editor__checkbox-mark' : 'admin-editor__radio-mark'} />
                <div className="admin-editor__choice-fields">
                  <EditorField
                    label="Answer option"
                    value={option.label}
                    onChange={(value) => onChange('options', value, index, 'label')}
                    maxLength={1000}
                  />
                  <EditorField
                    label="Option value"
                    value={option.value}
                    onChange={(value) => onChange('options', value, index, 'value')}
                    maxLength={1000}
                    disabled={question.pageManaged}
                  />
                  <EditorField
                    label="Option description"
                    value={option.description}
                    onChange={(value) => onChange('options', value, index, 'description')}
                    multiline
                    rows={2}
                    maxLength={3000}
                  />
                  <button
                    className="admin-editor__text-button admin-editor__remove"
                    type="button"
                    onClick={() => onChange('remove-option', null, index)}
                  >
                    Remove option
                  </button>
                </div>
              </div>
            ))}
            <button
              className="admin-editor__secondary-button"
              type="button"
              onClick={() => onChange('add-option')}
              disabled={options.length >= 100}
            >
              Add answer option
            </button>
          </div>
        )}

        {showTextInput && (
          <div className="admin-editor__answer-preview">
            {question.type === 'integer input' ? '123' : 'Your answer'}
          </div>
        )}

        <EditorField
          label="Disclaimer"
          value={question.qDisclaimer || ''}
          onChange={(value) => onChange('qDisclaimer', value)}
          multiline
          rows={2}
          maxLength={5000}
        />
      </div>

      {!question.pageManaged && (
        <details className="admin-editor__settings">
          <summary>Question settings</summary>
          <div className="admin-editor__settings-grid">
          <label className="admin-editor__field">
            <span>Question type</span>
            <select value={question.type} onChange={(event) => onChange('type', event.target.value)}>
              {questionTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="admin-editor__field">
            <span>Icon</span>
            <select value={question.qIcon} onChange={(event) => onChange('qIcon', event.target.value)}>
              {questionIcons.map((icon) => <option key={icon}>{icon}</option>)}
            </select>
          </label>
          <label className="admin-editor__field">
            <span>Section</span>
            <select value={question.section} onChange={(event) => onChange('section', event.target.value)}>
              {questionSections.map((section) => (
                <option key={section} value={section}>{questionSectionLabels[section]}</option>
              ))}
            </select>
          </label>
          <label className="admin-editor__field">
            <span>Applies to circumstance</span>
            <select
              value={question.appliesToGroup || ''}
              onChange={(event) => onChange('appliesToGroup', event.target.value)}
            >
              <option value="">All circumstances</option>
              <option value="married">Married</option>
              <option value="not_married">Not married</option>
            </select>
          </label>
          <label className="admin-editor__field">
            <span>Multiple children</span>
            <input
              type="checkbox"
              checked={question.multipleChildren === true}
              onChange={(event) => onChange('multipleChildren', event.target.checked)}
            />
          </label>
          <label className="admin-editor__field">
            <span>Do not include in comparison</span>
            <input
              type="checkbox"
              checked={question.includeInComparison === false}
              onChange={(event) => onChange('includeInComparison', !event.target.checked)}
            />
          </label>
          </div>
        </details>
      )}
    </article>
  );
}

function PublishedQuestionPreview({ question }) {
  const [answer, setAnswer] = useState('');
  const pageSection = getEditorPageSection(question.section);
  const isGettingStarted = pageSection === 'getting-started';
  const isParentalRights = pageSection === 'parental-rights';
  const Icon = iconComponents[question.qIcon] || CircleHelp;

  return (
    <div className="admin-editor__published-preview">
      <p className="admin-editor__preview-label">
        Preview of this unsaved question in {questionSectionLabels[pageSection] || pageSection}
      </p>
      {isGettingStarted && (
        <SectionHeader
          iconClassName="info-icon"
          icon={<CircleHelp size={25} aria-hidden="true" />}
          title="Additional Questions"
          help="Please answer the remaining Getting Started questions."
        />
      )}
      {isParentalRights && (
        <SectionHeader
          iconClassName={question.qIcon}
          icon={<Icon size={25} aria-hidden="true" />}
          title={question.qTitle}
        />
      )}
      {question.type === 'text input' ? (
        <>
          <TextQuestion
            question={question.qText}
            help={isParentalRights ? undefined : question.qIntro}
            id={`published-preview-${question.qKey}`}
            value={answer}
            onChange={setAnswer}
            placeholder={isGettingStarted ? 'Enter your answer' : undefined}
            required
          />
          {isParentalRights && question.qIntro && (
            <Disclaimer variant="info">{question.qIntro}</Disclaimer>
          )}
          {isParentalRights && question.qDisclaimer && (
            <Disclaimer variant="warning">{question.qDisclaimer}</Disclaimer>
          )}
        </>
      ) : (
        <RadioQuestion
          question={question.qText}
          help={question.qIntro}
          name={`published-preview-${question.qKey}`}
          value={answer}
          onChange={setAnswer}
          options={question.options || []}
          disclaimers={question.qDisclaimer
            ? [{
              disclaimer: question.qDisclaimer,
              disclaimerVariant: isParentalRights ? 'warning' : 'info'
            }]
            : undefined}
        />
      )}
    </div>
  );
}

function SectionQuestionForm({ section, draft, setDraft, creating, onSubmit, onCancel, updateOption }) {
  return (
    <form className="admin-editor__create" onSubmit={onSubmit}>
      <h3>Add a {questionSectionLabels[section]} question</h3>
      <p>This question will be added to the end of the section.</p>
      <div className="admin-editor__create-fields">
        <EditorField
          label="Question key"
          value={draft.qKey}
          onChange={(qKey) => setDraft((current) => ({ ...current, qKey }))}
          placeholder="new_question_key"
          pattern="[a-z][a-z0-9_]{1,99}"
          required
        />
        <EditorField
          label="Admin label"
          value={draft.qTitle}
          onChange={(qTitle) => setDraft((current) => ({ ...current, qTitle }))}
          required
          maxLength={500}
        />
        <EditorField
          label="Question"
          value={draft.qText}
          onChange={(qText) => setDraft((current) => ({ ...current, qText }))}
          multiline
          rows={2}
          required
          maxLength={10000}
        />
        <label className="admin-editor__field">
          <span>Question type</span>
          <select
            value={draft.type}
            onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
          >
            {questionTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <EditorField
          label="Help text"
          value={draft.qIntro}
          onChange={(qIntro) => setDraft((current) => ({ ...current, qIntro }))}
          multiline
          rows={2}
          maxLength={5000}
        />
        <EditorField
          label="Disclaimer"
          value={draft.qDisclaimer}
          onChange={(qDisclaimer) => setDraft((current) => ({ ...current, qDisclaimer }))}
          multiline
          rows={2}
          maxLength={5000}
        />
      </div>
      {draft.type === 'multiple choice' && (
        <div className="admin-editor__choice-list">
          <h4>Answer choices</h4>
          {draft.options.map((option, index) => (
            <div className="admin-editor__choice-fields" key={`${section}-option-${index}`}>
              <EditorField
                label="Answer"
                value={option.label}
                onChange={(value) => updateOption(index, 'label', value)}
                required
                maxLength={1000}
              />
              <EditorField
                label="Stored answer value"
                value={option.value}
                onChange={(value) => updateOption(index, 'value', value)}
                required
                maxLength={1000}
              />
              <EditorField
                label="Answer description"
                value={option.description}
                onChange={(value) => updateOption(index, 'description', value)}
                multiline
                rows={2}
                maxLength={3000}
              />
              <button
                className="admin-editor__text-button admin-editor__remove"
                type="button"
                disabled={draft.options.length <= 1}
                onClick={() => setDraft((current) => ({
                  ...current,
                  options: current.options.filter((_, optionIndex) => optionIndex !== index)
                }))}
              >
                Remove answer
              </button>
            </div>
          ))}
          <button
            className="admin-editor__secondary-button"
            type="button"
            onClick={() => setDraft((current) => ({
              ...current,
              options: [...current.options, { value: '', label: '', description: '' }]
            }))}
            disabled={draft.options.length >= 100}
          >
            Add answer choice
          </button>
        </div>
      )}
      <div className="admin-editor__entry-actions">
        <button className="admin-editor__save" type="submit" disabled={creating}>
          {creating ? 'Adding...' : 'Add question'}
        </button>
        <button className="admin-editor__cancel-insert" type="button" onClick={onCancel} disabled={creating}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminQuestionEditor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [rules, setRules] = useState([]);
  const [ruleDrafts, setRuleDrafts] = useState({});
  const [history, setHistory] = useState({});
  const [historyLoaded, setHistoryLoaded] = useState({});
  const [historyLoadingKeys, setHistoryLoadingKeys] = useState([]);
  const [previewQuestionKey, setPreviewQuestionKey] = useState('');
  const [questionnaireVersions, setQuestionnaireVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState('');
  const [createDraft, setCreateDraft] = useState(createDefaults);
  const [insertAfterKey, setInsertAfterKey] = useState(null);
  const [insertSection, setInsertSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingKeys, setSavingKeys] = useState([]);
  const [savingRuleKeys, setSavingRuleKeys] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dirtyQuestionKeys = useRef(new Set());
  const dirtyRuleKeys = useRef(new Set());

  const loadQuestions = useCallback(async (activeUser) => {
    const [questionResult, ruleResult] = await Promise.all([
      adminRequest(activeUser, '/questions'),
      adminRequest(activeUser, '/question-rules')
    ]);
    setQuestions((current) => questionResult.questions.map((question) => {
      if (!dirtyQuestionKeys.current.has(question.qKey)) return question;
      const localDraft = current.find((item) => item.qKey === question.qKey);
      return localDraft
        ? { ...question, ...normalizeQuestion(localDraft), isArchived: question.isArchived }
        : question;
    }));
    setRules(ruleResult.rules);
    setRuleDrafts((current) => Object.fromEntries(ruleResult.rules.map((rule) => [
      rule.qKey,
      dirtyRuleKeys.current.has(rule.qKey) && current[rule.qKey]
        ? current[rule.qKey]
        : JSON.stringify(normalizeRule(rule), null, 2)
    ])));
  }, []);

  const loadQuestionnaireVersions = useCallback(async (activeUser) => {
    setLoadingVersions(true);
    try {
      const result = await adminRequest(activeUser, '/questionnaire-versions');
      setQuestionnaireVersions(result.versions);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingVersions(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) navigate('/signin');
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      adminRequest(user, '/access'),
      loadQuestions(user),
      loadQuestionnaireVersions(user)
    ]).then(([access]) => {
      if (active) setIsAdmin(access.isAdmin === true);
    }).catch((requestError) => {
      if (!active) return;
      setIsAdmin(false);
      setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [user, loadQuestions, loadQuestionnaireVersions]);

  function updateQuestion(qKey, field, value, optionIndex, optionField) {
    dirtyQuestionKeys.current.add(qKey);
    setQuestions((current) => current.map((question) => {
      if (question.qKey !== qKey) return question;
      if (field === 'add-option') {
        return { ...question, options: [...(question.options || []), { value: '', label: '', description: '' }] };
      }
      if (field === 'remove-option') {
        return { ...question, options: (question.options || []).filter((_, index) => index !== optionIndex) };
      }
      if (field === 'options') {
        return {
          ...question,
          options: (question.options || []).map((option, index) =>
            index === optionIndex ? { ...option, [optionField]: value } : option
          )
        };
      }
      return { ...question, [field]: value };
    }));
  }

  async function saveQuestion(question) {
    setSavingKeys((current) => [...current, question.qKey]);
    setError('');
    setNotice('');
    try {
      const payload = normalizeQuestion(question);
      const result = await adminRequest(user, `/questions/${encodeURIComponent(question.qKey)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      setQuestions((current) => current.map((item) =>
        item.qKey === question.qKey ? { ...item, ...result.question } : item
      ));
      dirtyQuestionKeys.current.delete(question.qKey);
      await loadQuestions(user);
      await loadQuestionnaireVersions(user);
      setPreviewQuestionKey('');
      setNotice(`Saved “${question.qTitle}”.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingKeys((current) => current.filter((key) => key !== question.qKey));
    }
  }

  async function saveRules(question) {
    let parsedRules;
    try {
      parsedRules = JSON.parse(ruleDrafts[question.qKey] || '');
    } catch {
      setError(`Branching rules for “${question.qTitle}” must be valid JSON.`);
      return;
    }

    setSavingRuleKeys((current) => [...current, question.qKey]);
    setError('');
    setNotice('');
    try {
      const result = await adminRequest(user, `/question-rules/${encodeURIComponent(question.qKey)}`, {
        method: 'PUT',
        body: JSON.stringify(parsedRules)
      });
      setRules((current) => [
        ...current.filter((rule) => rule.qKey !== question.qKey),
        { qKey: question.qKey, ...result.rule }
      ]);
      dirtyRuleKeys.current.delete(question.qKey);
      setRuleDrafts((current) => ({
        ...current,
        [question.qKey]: JSON.stringify(result.rule, null, 2)
      }));
      await loadQuestions(user);
      await loadQuestionnaireVersions(user);
      setNotice(`Saved branching rules for “${question.qTitle}”.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingRuleKeys((current) => current.filter((key) => key !== question.qKey));
    }
  }

  function getInsertAfterBlockReason(question) {
    if (dirtyRuleKeys.current.has(question.qKey)) {
      return 'Save this question’s branching-rule changes before inserting after it.';
    }
    const rule = rules.find((item) => item.qKey === question.qKey);
    if (!rule) return '';
    const destinations = (rule.isDefault
      ? [rule.goToDefault || '', rule.notApplicableGoTo || '']
      : [
        ...rule.nextQuestions.map((nextQuestion) => nextQuestion.goTo),
        rule.notApplicableGoTo || '',
      ]).filter(Boolean);
    if (destinations.length === 0) {
      return 'Save valid branching rules before inserting after this question.';
    }
    return new Set(destinations).size > 1
      ? 'This question has multiple different branch destinations. Add after a question within one branch.'
      : '';
  }

  function updateCreateOption(index, field, value) {
    setCreateDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option
      )
    }));
  }

  function openSectionQuestionForm(section) {
    setCreateDraft({
      ...createDefaults,
      section,
      options: [{ value: '', label: '', description: '' }]
    });
    setInsertSection(section);
  }

  async function createSectionQuestion(event) {
    event.preventDefault();
    setCreating(true);
    setError('');
    setNotice('');
    try {
      const result = await adminRequest(user, '/questions', {
        method: 'POST',
        body: JSON.stringify(createDraft)
      });
      await loadQuestions(user);
      await loadQuestionnaireVersions(user);
      setHistoryLoaded((current) => ({ ...current, [result.question.qKey]: false }));
      setCreateDraft(createDefaults);
      setInsertSection('');
      setNotice(`Added “${result.question.qTitle}” to ${questionSectionLabels[result.question.section]}.`);
      document.getElementById(`admin-question-${result.question.qKey}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  async function createQuestion(event, afterQuestionKey) {
    event.preventDefault();
    setCreating(true);
    setError('');
    setNotice('');
    try {
      const result = await adminRequest(
        user,
        `/questions/${encodeURIComponent(afterQuestionKey)}/after`,
        {
          method: 'POST',
          body: JSON.stringify(createDraft)
        }
      );
      await loadQuestions(user);
      await loadQuestionnaireVersions(user);
      setHistoryLoaded((current) => ({ ...current, [result.question.qKey]: false }));
      setCreateDraft(createDefaults);
      setInsertAfterKey(null);
      setNotice(`Added “${result.question.qTitle}” after “${questions.find((question) => question.qKey === afterQuestionKey)?.qTitle || afterQuestionKey}”.`);
      document.getElementById(`admin-question-${result.question.qKey}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  }

  async function setArchived(question, isArchived) {
    if (isArchived && dirtyQuestionKeys.current.has(question.qKey)) {
      setError(`Save “${question.qTitle}” before archiving it.`);
      return;
    }
    if (isArchived && !window.confirm(`Archive “${question.qTitle}”? Existing responses are preserved.`)) {
      return;
    }
    setError('');
    setNotice('');
    try {
      const result = await adminRequest(user, `/questions/${encodeURIComponent(question.qKey)}/archive`, {
        method: 'PATCH',
        body: JSON.stringify({ isArchived })
      });
      await loadQuestions(user);
      await loadQuestionnaireVersions(user);
      if (isArchived) {
        const rewireNote = result.rewiredRules
          ? ` Bypassed it in ${result.rewiredRules} branching rule${result.rewiredRules === 1 ? '' : 's'}.`
          : '';
        setNotice(`Archived “${question.qTitle}”. Existing answers and revisions are preserved.${rewireNote}`);
      } else {
        setNotice(`Restored “${question.qTitle}”. It remains disconnected unless branching rules point to it.`);
      }
      setHistory({});
      setHistoryLoaded({});
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function restoreQuestionnaireVersion(version) {
    if (dirtyQuestionKeys.current.size > 0 || dirtyRuleKeys.current.size > 0) {
      setError('Save or discard all unsaved question and branching-rule edits before restoring a questionnaire version.');
      return;
    }
    if (!window.confirm(
      `Restore the entire questionnaire to the version before “${version.action}”? Questions added afterward will be archived, and existing user answers will be preserved.`
    )) {
      return;
    }

    setRestoringVersionId(version._id);
    setError('');
    setNotice('');
    try {
      const result = await adminRequest(user, `/questionnaire-versions/${encodeURIComponent(version._id)}/restore`, {
        method: 'POST'
      });
      dirtyQuestionKeys.current.clear();
      dirtyRuleKeys.current.clear();
      setHistory({});
      setHistoryLoaded({});
      await Promise.all([
        loadQuestions(user),
        loadQuestionnaireVersions(user)
      ]);
      setNotice(
        `Restored the questionnaire to before “${version.action}”. ${result.archivedQuestions} later-added question${result.archivedQuestions === 1 ? ' was' : 's were'} archived; existing user answers were preserved.`
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRestoringVersionId('');
    }
  }

  async function loadHistory(qKey, force = false) {
    if (historyLoaded[qKey] && !force) return;
    setHistoryLoadingKeys((current) => [...new Set([...current, qKey])]);
    try {
      const [questionHistory, ruleHistory] = await Promise.all([
        adminRequest(user, `/questions/${encodeURIComponent(qKey)}/history`),
        adminRequest(user, `/question-rules/${encodeURIComponent(qKey)}/history`)
      ]);
      setHistory((current) => ({
        ...current,
        [qKey]: [
          ...questionHistory.revisions.map((revision) => ({ ...revision, target: 'Question' })),
          ...ruleHistory.revisions.map((revision) => ({ ...revision, target: 'Rules' }))
        ].sort((left, right) => new Date(right.changedAt) - new Date(left.changedAt))
      }));
      setHistoryLoaded((current) => ({ ...current, [qKey]: true }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setHistoryLoadingKeys((current) => current.filter((key) => key !== qKey));
    }
  }

  const activeQuestions = questions.filter((question) => !question.isArchived);
  const archivedQuestions = questions.filter((question) => question.isArchived);
  const displayItems = [
    ...activeQuestions
      .filter((question) => getEditorPageSection(question.section) === 'getting-started')
      .map((question) => ({ type: 'question', question })),
    ...questionSections.slice(1).flatMap((section) => [
      { type: 'section', section },
      ...activeQuestions
        .filter((question) => getEditorPageSection(question.section) === section)
        .map((question) => ({ type: 'question', question }))
    ]),
    ...(archivedQuestions.length > 0 ? [{ type: 'archived-section' }] : []),
    ...archivedQuestions.map((question) => ({ type: 'question', question }))
  ];
  const sectionNavigation = questionSections.map((section) => ({
    id: `admin-section-${section}`,
    label: questionSectionLabels[section]
  }));
  if (archivedQuestions.length > 0) {
    sectionNavigation.push({ id: 'admin-section-archived', label: 'Archived Questions' });
  }

  if (!authReady) {
    return <main className="admin-editor"><p>Checking your sign-in...</p></main>;
  }

  return (
    <main className="admin-editor">
      <header className="admin-editor__header">
        <div>
          <Link to="/dashboard" className="admin-editor__back">Back to dashboard</Link>
          <h1>Question administration</h1>
          <p>Edit questions as they appear in the questionnaire.</p>
        </div>
      </header>

      {error && <p className="admin-editor__message admin-editor__message--error" role="alert">{error}</p>}
      {notice && <p className="admin-editor__message admin-editor__message--success" role="status">{notice}</p>}

      {isAdmin && (
        <section className="admin-editor__revert-panel" aria-labelledby="admin-revert-heading">
          <h2 id="admin-revert-heading">Questionnaire versions</h2>
          <p>
            Each saved question or branching-rule change records the entire questionnaire. Restoring a version preserves user answers and archives questions added afterward.
          </p>
          {loadingVersions && <p role="status">Loading recent versions...</p>}
          {!loadingVersions && questionnaireVersions.length === 0 && (
            <p>No versions yet. A checkpoint will be created before the next saved change.</p>
          )}
          {questionnaireVersions.map((version) => (
            <article className="admin-editor__version" key={version._id}>
              <div>
                <strong>{version.action}</strong>
                <span>{new Date(version.createdAt).toLocaleString()}</span>
              </div>
              <button
                className="admin-editor__restore-button"
                type="button"
                onClick={() => restoreQuestionnaireVersion(version)}
                disabled={Boolean(restoringVersionId)}
              >
                {restoringVersionId === version._id
                  ? 'Restoring questionnaire...'
                  : 'Restore this questionnaire version'}
              </button>
            </article>
          ))}
        </section>
      )}

      {!isAdmin && !loading && (
        <section className="admin-editor__access" role="status">
          <h2>Administrator access required</h2>
          <p>{error || 'This account does not have permission to edit questions.'}</p>
        </section>
      )}

      {isAdmin && (
        <>
          <div className="admin-editor__workspace">
            <nav className="admin-editor__section-nav" aria-label="Question sections">
              <h2>Sections</h2>
              <ul>
                {sectionNavigation.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <section className="admin-editor__list" aria-label="Editable questionnaire">
            <div className="admin-editor__flow-item">
              <h2 className="admin-editor__section-header" id="admin-section-getting-started">
                Getting Started
              </h2>
              {!insertSection && (
                <div className="admin-editor__insert">
                  <button
                    className="admin-editor__insert-button"
                    type="button"
                    onClick={() => openSectionQuestionForm('getting-started')}
                    disabled={creating}
                  >
                    <Plus size={20} aria-hidden="true" />
                    <span>Add question to Getting Started</span>
                  </button>
                </div>
              )}
              {insertSection === 'getting-started' && (
                <SectionQuestionForm
                  section={insertSection}
                  draft={createDraft}
                  setDraft={setCreateDraft}
                  creating={creating}
                  onSubmit={createSectionQuestion}
                  onCancel={() => setInsertSection('')}
                  updateOption={updateCreateOption}
                />
              )}
            </div>
            {displayItems.map((item) => {
              if (item.type === 'section') {
                return (
                  <div className="admin-editor__flow-item" key={`section-${item.section}`}>
                    <h2
                      className="admin-editor__section-header"
                      id={`admin-section-${item.section}`}
                    >
                      {questionSectionLabels[item.section]}
                    </h2>
                    {item.section !== 'parental-rights' && item.section !== 'review' && (
                      <>
                        {insertSection !== item.section && (
                          <div className="admin-editor__insert">
                            <button
                              className="admin-editor__insert-button"
                              type="button"
                              onClick={() => openSectionQuestionForm(item.section)}
                              disabled={creating}
                            >
                              <Plus size={20} aria-hidden="true" />
                              <span>Add question to {questionSectionLabels[item.section]}</span>
                            </button>
                          </div>
                        )}
                        {insertSection === item.section && (
                          <SectionQuestionForm
                            section={item.section}
                            draft={createDraft}
                            setDraft={setCreateDraft}
                            creating={creating}
                            onSubmit={createSectionQuestion}
                            onCancel={() => setInsertSection('')}
                            updateOption={updateCreateOption}
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              }
              if (item.type === 'archived-section') {
                return (
                  <div className="admin-editor__flow-item" key="section-archived">
                    <h2
                      className="admin-editor__section-header admin-editor__section-header--archived"
                      id="admin-section-archived"
                    >
                      Archived Questions
                    </h2>
                  </div>
                );
              }

              const { question } = item;
              const currentRule = rules.find((rule) => rule.qKey === question.qKey);
              const isSaving = savingKeys.includes(question.qKey);
              const isSavingRules = savingRuleKeys.includes(question.qKey);
              const insertAfterBlockReason = question.isArchived ? '' : getInsertAfterBlockReason(question);

              return (
                <div className="admin-editor__flow-item" key={question.qKey}>
                  <section
                    className={`admin-editor__entry${question.isArchived ? ' admin-editor__entry--archived' : ''}`}
                    id={`admin-question-${question.qKey}`}
                  >
                    {question.isArchived && <div className="admin-editor__archived-label">Archived</div>}
                    <QuestionPreview
                      question={question}
                      onChange={(field, value, index, optionField) =>
                        updateQuestion(question.qKey, field, value, index, optionField)
                      }
                    />

                    <div className="admin-editor__entry-actions">
                      <button
                        className="admin-editor__preview-button"
                        type="button"
                        onClick={() => setPreviewQuestionKey((current) =>
                          current === question.qKey ? '' : question.qKey
                        )}
                        disabled={question.isArchived}
                        aria-expanded={previewQuestionKey === question.qKey}
                        aria-controls={`published-preview-${question.qKey}`}
                      >
                        {previewQuestionKey === question.qKey
                          ? <><EyeOff size={16} aria-hidden="true" /> Hide published preview</>
                          : <><Eye size={16} aria-hidden="true" /> Preview published page</>}
                      </button>
                      <button
                        className="admin-editor__save"
                        type="button"
                        onClick={() => saveQuestion(question)}
                        disabled={isSaving || question.isArchived}
                      >
                        <Check size={16} aria-hidden="true" />
                        {isSaving ? 'Saving...' : 'Save question'}
                      </button>
                      {!question.pageManaged && (
                        <button
                          className="admin-editor__archive-button"
                          type="button"
                          onClick={() => setArchived(question, !question.isArchived)}
                        >
                          {question.isArchived
                            ? <><RotateCcw size={16} aria-hidden="true" /> Restore question</>
                            : <><Archive size={16} aria-hidden="true" /> Archive question</>}
                        </button>
                      )}
                    </div>

                    {previewQuestionKey === question.qKey && (
                      <div id={`published-preview-${question.qKey}`}>
                        <PublishedQuestionPreview key={question.qKey} question={question} />
                      </div>
                    )}

                    {!question.isArchived && (
                      <details
                        className="admin-editor__advanced"
                        onToggle={(event) => {
                          if (event.currentTarget.open && !historyLoaded[question.qKey]) {
                            loadHistory(question.qKey);
                          }
                        }}
                      >
                        <summary>Branching rules and revision history</summary>
                        <form
                          className="admin-editor__rules-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            saveRules(question);
                          }}
                        >
                          <label className="admin-editor__field">
                            <span>Branching rules (JSON)</span>
                            <textarea
                              className="admin-editor__json"
                              value={ruleDrafts[question.qKey] ?? JSON.stringify(normalizeRule(currentRule), null, 2)}
                              onChange={(event) => {
                                dirtyRuleKeys.current.add(question.qKey);
                                setRuleDrafts((current) => ({
                                  ...current,
                                  [question.qKey]: event.target.value
                                }));
                              }}
                              rows={10}
                              spellCheck="false"
                              aria-label={`Branching rules for ${question.qTitle}`}
                            />
                          </label>
                          <button className="admin-editor__save" type="submit" disabled={isSavingRules}>
                            {isSavingRules ? 'Saving...' : 'Save branching rules'}
                          </button>
                        </form>

                        <div className="admin-editor__history">
                          <h3>Recent changes</h3>
                          {!historyLoaded[question.qKey] && <p>Loading history...</p>}
                          {history[question.qKey]?.map((revision, index) => (
                            <details key={`${revision.changedAt}-${revision.target}-${index}`}>
                              <summary>{revision.target} · {new Date(revision.changedAt).toLocaleString()}</summary>
                              <p>Administrator UID: <code>{revision.actorUid}</code></p>
                              <pre>{JSON.stringify({ before: revision.before, after: revision.after }, null, 2)}</pre>
                            </details>
                          ))}
                          {historyLoaded[question.qKey] && history[question.qKey]?.length === 0 && (
                            <p>No recorded changes yet.</p>
                          )}
                        </div>
                      </details>
                    )}
                  </section>

                  {!question.isArchived && question.section !== 'getting-started' && !insertAfterBlockReason && (
                    <div className="admin-editor__insert">
                      <button
                        className="admin-editor__insert-button"
                        type="button"
                        onClick={() => {
                          setCreateDraft({ ...createDefaults, section: question.section });
                          setInsertAfterKey((current) => current === question.qKey ? null : question.qKey);
                        }}
                        disabled={creating}
                        aria-label={`Add a question after ${question.qTitle}`}
                        title={`Add a question after ${question.qTitle}`}
                      >
                        <Plus size={20} aria-hidden="true" />
                        <span>Add question after</span>
                      </button>
                    </div>
                  )}

                  {insertAfterKey === question.qKey && (
                    <form
                      className="admin-editor__create"
                      onSubmit={(event) => createQuestion(event, question.qKey)}
                    >
                      <h2>Add after “{question.qTitle}”</h2>
                      <p>The existing next question will follow the new question.</p>
                      <div className="admin-editor__create-fields">
                        <EditorField
                          label="Question key"
                          value={createDraft.qKey}
                          onChange={(qKey) => setCreateDraft((current) => ({ ...current, qKey }))}
                          placeholder="new_question_key"
                          pattern="[a-z][a-z0-9_]{1,99}"
                          required
                        />
                        <EditorField
                          label="Section title"
                          value={createDraft.qTitle}
                          onChange={(qTitle) => setCreateDraft((current) => ({ ...current, qTitle }))}
                          required
                          maxLength={500}
                        />
                        <EditorField
                          label="Question"
                          value={createDraft.qText}
                          onChange={(qText) => setCreateDraft((current) => ({ ...current, qText }))}
                          multiline
                          rows={2}
                          required
                          maxLength={10000}
                        />
                        <label className="admin-editor__field">
                          <span>Section</span>
                          <select
                            value={createDraft.section}
                            onChange={(event) => setCreateDraft((current) => ({ ...current, section: event.target.value }))}
                          >
                            {questionSections.map((section) => (
                              <option key={section} value={section}>{questionSectionLabels[section]}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="admin-editor__entry-actions">
                        <button className="admin-editor__save" type="submit" disabled={creating}>
                          {creating ? 'Adding...' : 'Add question'}
                        </button>
                        <button
                          className="admin-editor__cancel-insert"
                          type="button"
                          onClick={() => setInsertAfterKey(null)}
                          disabled={creating}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
