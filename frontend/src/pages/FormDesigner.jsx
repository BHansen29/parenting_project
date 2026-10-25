import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Plus, Printer, Trash2 } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import { buildApiUrl } from '../lib/apiClient';
import './Page.css';
import './FormDesigner.css';

const STORAGE_KEY = 'shareCareFormTemplate';

function answerText(answer, question) {
  if (answer === null || answer === undefined || answer === '') return 'Not answered';
  const value = (item) => question?.options?.find((option) => option.value === item)?.label || String(item);
  return Array.isArray(answer) ? answer.map(value).join(', ') : value(answer);
}

function hasAnswer(answer) {
  return answer !== null &&
    answer !== undefined &&
    answer !== '' &&
    (!Array.isArray(answer) || answer.length > 0);
}

function createToken(response, question) {
  return {
    id: `${response.qKey}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'answer',
    qKey: response.qKey,
    questionText: question?.qText || question?.qTitle || response.label || response.qKey,
    section: response.section || '',
  };
}

const customFieldLabels = {
  agreeToTransportationPolicy: 'Agree to the standard transportation policy',
  transportationArrangementDescription: 'Preferred transportation arrangement',
  agreeToActivityPolicy: 'Agree to the standard activity policy',
  activityPolicyDescription: 'Preferred activity policy',
  communicationWithCoParentOnPhone: 'Phone communication with co-parent',
  communicationWithCoParentOnPhoneDescription: 'Phone communication circumstances',
  notifyCoParentOfChildRelatedEvents: 'Notify co-parent about illness or injury',
  notifyCoParentOfChildRelatedEventsDescription: 'Illness or injury notification circumstances',
  medicalRecords: 'Medical information access',
  schoolContact: 'School contact rights',
  schoolActivities: 'School activity participation',
};

const customOptionValues = {
  communicationWithCoParentOnPhone: {
    yes: 'Yes',
    no: 'No',
    sometimes: 'Sometimes (please describe)',
    needMoreInfo: 'I need more information',
    defaultToCoParentChoice: "Default to my co-parent's choice",
  },
  notifyCoParentOfChildRelatedEvents: {
    yes: 'Yes',
    no: 'No',
    sometimes: 'Sometimes (please describe)',
    needMoreInfo: 'I need more information',
    defaultToCoParentChoice: "Default to my co-parent's choice",
  },
  medicalRecords: {
    parent1: 'Just me',
    parent2: 'Just my co-parent',
    both: 'Both me and my co-parent',
    needInfo: 'I need more information',
    defer: "Default to my co-parent's choice",
  },
  schoolContact: {
    parent1: 'Just me',
    parent2: 'Just my co-parent',
    both: 'Both me and my co-parent',
    needInfo: 'I need more information',
    defer: "Default to my co-parent's choice",
  },
  schoolActivities: {
    parent1: 'Just me',
    parent2: 'Just my co-parent',
    both: 'Both me and my co-parent',
    needInfo: 'I need more information',
    defer: "Default to my co-parent's choice",
  },
};

function collectAnswers(state, questions) {
  const responses = (Array.isArray(state.plan?.answers) ? state.plan.answers : []).map((response) => ({
    ...response,
    section: questions[response.qKey]?.section || 'Questionnaire',
  }));

  const addFields = (source, section, fields = {}) => {
    Object.entries(source || {}).forEach(([key, answer]) => {
      if (
        key === 'errors' ||
        key === 'planID' ||
        key === 'responses' ||
        key === 'parentingSchedule' ||
        key === 'holidaySchedule' ||
        key === 'schoolSchedule' ||
        answer === '' ||
        answer === null ||
        answer === undefined
      ) return;
      const valueMap = customOptionValues[key];
      const options = valueMap
        ? Object.entries(valueMap).map(([value, label]) => ({ value, label }))
        : [];
      responses.push({
        qKey: `${section}.${key}`,
        answer,
        section,
        label: fields[key] || customFieldLabels[key] || key,
        question: { options },
      });
    });
  };

  addFields(state.parents, 'Getting Started', {
    firstName: 'Your first name',
    lastName: 'Your last name',
    age: 'Your age',
    phone: 'Your phone number',
    streetAddress: 'Street address',
    addressLine2: 'Address line 2',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP code',
  });
  addFields(state.plan, 'Getting Started', {
    collaborationMode: 'Plan collaboration mode',
    userRole: 'Case filing status',
    residentialParent: 'Residential parent',
  });
  addFields(state.plan?.parentingTimeAndCommunication || state.timeAndCommunication, 'Parenting Time & Communication');
  addFields(state.plan?.informationSharing, 'Information Sharing');
  addFields(state.taxExemptions, 'Tax Exemptions', {
    parentRole: 'Parental role',
    claimingChildren: 'Children claimed for tax exemptions',
  });

  const children = (state.plan?.children || []).map((child, index) =>
    [child.fName ?? child.firstName, child.lName ?? child.lastName].filter(Boolean).join(' ') || `Child ${index + 1}`,
  );
  if (children.length) {
    responses.push({
      qKey: 'getting-started.children',
      answer: children,
      section: 'Getting Started',
      label: 'Children',
    });
  }

  return responses;
}

const defaultTemplate = {
  title: 'Parenting Plan Questionnaire Responses',
  blocks: [{ id: 'intro', type: 'heading', text: 'Questionnaire Responses' }],
};

function loadTemplate() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.blocks)) return defaultTemplate;

    return {
      ...defaultTemplate,
      ...saved,
      title: typeof saved.title === 'string' ? saved.title : defaultTemplate.title,
      blocks: saved.blocks.filter((block) => (
        block &&
        typeof block.id === 'string' &&
        ['heading', 'text', 'answer'].includes(block.type)
      )),
    };
  } catch {
    return defaultTemplate;
  }
}

export default function FormDesigner() {
  const { state } = useForm();
  const [questions, setQuestions] = useState({});
  const [template, setTemplate] = useState(loadTemplate);
  const [draggedToken, setDraggedToken] = useState(null);

  useEffect(() => {
    fetch(buildApiUrl('/api/logic-engine/questions'))
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load question definitions');
        return response.json();
      })
      .then((items) => {
        const questionList = Array.isArray(items) ? items : items?.questions;
        if (!Array.isArray(questionList)) throw new Error('Question definitions were not returned as a list');
        setQuestions(Object.fromEntries(
          questionList
            .filter((question) => question?.qKey)
            .map((question) => [question.qKey, question]),
        ));
      })
      .catch((error) => console.error(error.message));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
  }, [template]);

  const allAnswers = useMemo(() => collectAnswers(state, questions), [state, questions]);
  const currentAnswersByKey = useMemo(
    () => Object.fromEntries(allAnswers.map((response) => [response.qKey, response])),
    [allAnswers],
  );
  const availableAnswers = useMemo(
    () => allAnswers.filter((response) => !template.blocks.some((block) => block.qKey === response.qKey)),
    [allAnswers, template.blocks],
  );

  const addBlock = (block) => setTemplate((current) => ({ ...current, blocks: [...current.blocks, block] }));

  const addText = () => addBlock({
    id: `text-${Date.now()}`,
    type: 'text',
    text: 'Enter your question or instructions here',
  });

  const addHeading = () => addBlock({ id: `heading-${Date.now()}`, type: 'heading', text: 'Section heading' });

  const addAnswer = (response) => addBlock(
    createToken(response, questions[response.qKey] || response.question),
  );

  const dropAnswer = (event) => {
    event.preventDefault();
    const response = draggedToken;
    setDraggedToken(null);
    if (response) addAnswer(response);
  };

  const updateBlock = (id, changes) => {
    setTemplate((current) => ({
      ...current,
      blocks: current.blocks.map((block) => block.id === id ? { ...block, ...changes } : block),
    }));
  };

  const moveBlock = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= template.blocks.length) return;
    setTemplate((current) => {
      const blocks = [...current.blocks];
      [blocks[index], blocks[nextIndex]] = [blocks[nextIndex], blocks[index]];
      return { ...current, blocks };
    });
  };

  const removeBlock = (id) => setTemplate((current) => ({
    ...current,
    blocks: current.blocks.filter((block) => block.id !== id),
  }));

  return (
    <div className="page-container form-designer">
      <div className="page-content">
        <div className="form-designer__header">
          <div>
            <h1>Form Designer</h1>
            <p>Write your own form text, then drag saved answers into the document.</p>
          </div>
          <button className="form-designer__print" onClick={() => window.print()}>
            <Printer size={16} /> Preview / Print PDF
          </button>
        </div>

        <div className="form-designer__workspace">
          <aside className="form-designer__palette">
            <h2>Document text</h2>
            <button onClick={addHeading}><Plus size={15} /> Add section heading</button>
            <button onClick={addText}><Plus size={15} /> Add question text</button>
            <h2>Saved answers</h2>
            <p className="form-designer__hint">Drag an answer onto the document.</p>
            {availableAnswers.length === 0 && <p className="form-designer__empty">All saved answers are placed.</p>}
            {availableAnswers.map((response) => (
              <button
                className="form-designer__answer-token"
                draggable
                key={response.qKey}
                onDragStart={() => setDraggedToken(response)}
                onClick={() => addAnswer(response)}
              >
                <GripVertical size={15} />
                {questions[response.qKey]?.qText || response.label || response.qKey}
              </button>
            ))}
          </aside>

          <main
            className="form-designer__canvas"
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropAnswer}
          >
            <input
              className="form-designer__title"
              value={template.title}
              onChange={(event) => setTemplate((current) => ({ ...current, title: event.target.value }))}
              aria-label="Document title"
            />
            <div className="form-designer__print-title">{template.title}</div>
            {template.blocks.map((block, index) => (
              <div
                className={`form-designer__block form-designer__block--${block.type}${
                  block.type === 'answer' && !hasAnswer(currentAnswersByKey[block.qKey]?.answer)
                    ? ' form-designer__block--unanswered'
                    : ''
                }`}
                key={block.id}
              >
                <div className="form-designer__block-controls">
                  <button onClick={() => moveBlock(index, -1)} aria-label="Move block up"><ArrowUp size={14} /></button>
                  <button onClick={() => moveBlock(index, 1)} aria-label="Move block down"><ArrowDown size={14} /></button>
                  <button onClick={() => removeBlock(block.id)} aria-label="Remove block"><Trash2 size={14} /></button>
                </div>
                {block.type === 'answer' ? (
                  <>
                    <label>Question text</label>
                    <textarea value={block.questionText} onChange={(event) => updateBlock(block.id, { questionText: event.target.value })} />
                    <div className="form-designer__print-text">{block.questionText}</div>
                    <label>Answer</label>
                    <div className="form-designer__answer-value">
                      {answerText(
                        currentAnswersByKey[block.qKey]?.answer,
                        questions[block.qKey] || currentAnswersByKey[block.qKey]?.question,
                      )}
                    </div>
                  </>
                ) : (
                  <textarea value={block.text} onChange={(event) => updateBlock(block.id, { text: event.target.value })} />
                )}
                {block.type !== 'answer' && <div className="form-designer__print-text">{block.text}</div>}
              </div>
            ))}
            <p className="form-designer__drop-hint">Drop answer values here</p>
          </main>
        </div>
      </div>
    </div>
  );
}
