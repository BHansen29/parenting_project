import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Plus, Printer, Trash2 } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import { buildApiUrl } from '../lib/apiClient';
import { CUSTOM_COMPARISON_QUESTIONS } from '../lib/comparisonQuestionDefinitions';
import './Page.css';
import './FormDesigner.css';

const STORAGE_KEY = 'shareCareFormTemplate';
const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCHEDULE_FIELDS = {
  parentingSchedule: 'Regular Parenting Schedule',
  holidaySchedule: 'Holiday Schedule',
  schoolSchedule: 'School Schedule',
};
const SCHEDULE_QKEYS = Object.keys(SCHEDULE_FIELDS).reduce((keys, field) => ({
  ...keys,
  [field]: `parentingTimeAndCommunication.${field}`,
}), {});
const QUESTION_PAGE_LABELS = {
  'getting-started': 'Getting Started',
  parents: 'Getting Started',
  plan: 'Getting Started',
  'parental-rights': 'Parental Rights',
  'health-insurance-coverage': 'Health Insurance Coverage',
  parentingtimeandcommunication: 'Parenting Time & Communication',
  timeandcommunication: 'Parenting Time & Communication',
  informationsharing: 'Information Sharing',
  taxexemptions: 'Tax Exemptions',
};
const DESIGNER_CUSTOM_QUESTIONS = {
  ...CUSTOM_COMPARISON_QUESTIONS,
  'parentingTimeAndCommunication.parentingSchedule': {
    qText: SCHEDULE_FIELDS.parentingSchedule,
    scheduleType: 'regular',
  },
  'parentingTimeAndCommunication.holidaySchedule': {
    qText: SCHEDULE_FIELDS.holidaySchedule,
    scheduleType: 'calendar',
  },
  'parentingTimeAndCommunication.schoolSchedule': {
    qText: SCHEDULE_FIELDS.schoolSchedule,
    scheduleType: 'calendar',
  },
  'taxExemptions.parentRole': {
    qText: 'Your parental role',
    options: [
      { value: 'residential', label: 'I am the residential parent' },
      { value: 'nonresidential', label: 'I am the non-residential parent' },
    ],
  },
  'taxExemptions.claimingChildren': {
    qText: 'Which children will you claim as tax exemptions?',
  },
  'taxExemptions.childAnswers': {
    qText: 'Tax exemption arrangements for each child',
    childAnswers: true,
  },
};
const CHILD_CLASSIFICATION_LABELS = {
  'under-18': 'Under 18',
  disabled: 'Disabled',
  'emancipated-adult': 'Emancipated adult',
};

function canonicalScheduleKey(qKey) {
  const field = String(qKey || '').split('.').pop();
  return SCHEDULE_QKEYS[field] || qKey;
}

function answerText(answer, question) {
  if (answer === null || answer === undefined || answer === '') return 'Not answered';
  if (question?.childDetails) {
    return formatChildDetails(answer);
  }
  if (question?.childAnswers) {
    const intentLabels = {
      everyYear: 'Claim every year',
      someYears: 'Claim some years',
      defer: 'Defer to co-parent',
    };
    const yearLabels = {
      odd: 'Odd-numbered tax years',
      even: 'Even-numbered tax years',
      custom: 'Custom tax years',
    };
    if (!answer || typeof answer !== 'object') return 'Not answered';
    const lines = Object.entries(answer).flatMap(([child, details]) => {
      if (!details || typeof details !== 'object') return [`${child}: ${details}`];
      const arrangement = intentLabels[details.intent] || details.intent || 'No arrangement entered';
      const years = details.taxYears === 'custom'
        ? details.customYears
        : yearLabels[details.taxYears] || details.taxYears;
      return [`${child}: ${[arrangement, years].filter(Boolean).join(' — ')}`];
    });
    return lines.length ? lines.join('\n') : 'No child arrangements entered';
  }
  if (question?.scheduleType) {
    return formatSchedule(answer, question.scheduleType);
  }
  const value = (item) => question?.options?.find((option) => option.value === item)?.label || String(item);
  return Array.isArray(answer) ? answer.map(value).join(', ') : value(answer);
}

function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

function formatBirthday(birthday) {
  if (!birthday) return 'Birthday not entered';
  const date = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(birthday);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatChildDetails(children) {
  if (!Array.isArray(children) || !children.length) return 'No children entered';
  return children.map((child, index) => {
    const name = [child?.fName ?? child?.firstName, child?.lName ?? child?.lastName]
      .filter(Boolean)
      .join(' ') || `Child ${index + 1}`;
    const classifications = Array.isArray(child?.classifications)
      ? child.classifications.map((classification) => (
        CHILD_CLASSIFICATION_LABELS[classification] || classification
      ))
      : [];
    const details = [
      `Birthday: ${formatBirthday(child?.birthday)}`,
      `Classification: ${classifications.length ? classifications.join(', ') : 'None entered'}`,
    ];
    return `${name}\n${details.join('\n')}`;
  }).join('\n\n');
}

function formatScheduleSlot(slot) {
  if (!slot || typeof slot !== 'object') return '';
  if (slot.wholeDay) return 'All day';
  const start = formatTime(slot.startTime);
  const end = formatTime(slot.endTime);
  return start && end ? `${start}–${end}` : start || end;
}

function formatSchedule(answer, scheduleType) {
  if (!answer || typeof answer !== 'object') return 'Not scheduled';
  const entries = Object.entries(answer);
  if (!entries.length) return 'Not scheduled';

  if (scheduleType === 'regular') {
    const lines = entries.flatMap(([dayIndex, slots]) => {
      if (!Array.isArray(slots) || !slots.length) return [];
      const index = Number(dayIndex);
      const week = Math.floor(index / 7) + 1;
      const day = WEEK_DAYS[index % 7] || `Day ${dayIndex}`;
      return slots.map((slot) => {
        const parent = slot?.parent ? ` (${slot.parent === 'parent1' ? 'Parent 1' : 'Parent 2'})` : '';
        return `Week ${week}, ${day}: ${formatScheduleSlot(slot) || 'No time set'}${parent}`;
      });
    });
    return lines.length ? lines.join('\n') : 'Not scheduled';
  }

  const lines = entries.map(([name, details]) => {
    if (!details || typeof details !== 'object') return `${name}: ${details}`;
    if (details.doesNotApply) return `${name}: Does not apply`;
    const detailsText = [details.year, details.time, details.alternativeRequest]
      .filter(Boolean)
      .join(' · ');
    return `${name}: ${detailsText || 'No preference entered'}`;
  });
  return lines.join('\n');
}

function ScheduleCalendar({ schedule = {} }) {
  const hasSlots = Object.values(schedule).some((slots) => Array.isArray(slots) && slots.length);
  if (!hasSlots) return <span>Not scheduled</span>;

  return (
    <div className="form-designer__schedule-calendar" aria-label="Regular parenting schedule calendar">
      <div className="form-designer__schedule-weekday-header">
        <span />
        {WEEK_DAYS.map((day) => <span key={day}>{day.slice(0, 3)}</span>)}
      </div>
      {[0, 1, 2, 3].map((week) => (
        <div className="form-designer__schedule-week-row" key={week}>
          <span className="form-designer__schedule-week-label">Week {week + 1}</span>
          {WEEK_DAYS.map((day, dayOfWeek) => {
            const dayIndex = week * 7 + dayOfWeek;
            const slots = Array.isArray(schedule[dayIndex]) ? schedule[dayIndex] : [];
            return (
              <div
                className={`form-designer__schedule-day-cell${slots.length ? ' form-designer__schedule-day-cell--assigned' : ''}`}
                key={day}
              >
                {slots.map((slot, index) => (
                  <div
                    className={`form-designer__schedule-slot form-designer__schedule-slot--${slot.parent || 'parent1'}`}
                    key={`${dayIndex}-${index}`}
                  >
                    <span>{slot.parent === 'parent2' ? 'Parent 2' : 'Parent 1'}</span>
                    <span>{formatScheduleSlot(slot) || 'No time set'}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function hasAnswer(answer) {
  if (answer === null || answer === undefined || answer === '') return false;
  if (Array.isArray(answer)) return answer.length > 0 && answer.some(hasAnswer);
  if (typeof answer === 'object') return Object.values(answer).some(hasAnswer);
  return true;
}

const INTERNAL_FORM_FIELDS = new Set([
  'caseid',
  'planid',
  'isshared',
  'ownerid',
  'userid',
  '_id',
  'createdat',
  'updatedat',
  '__v',
  'status',
  'currentquestion',
  'aggregatedata',
  'collaborationmode',
  'children',
  'taxexemptions',
  'parentingtimeandcommunication',
  'informationsharing',
  'errors',
  'responses',
  'answers',
]);

function isInternalFormField(key) {
  return INTERNAL_FORM_FIELDS.has(String(key).toLowerCase());
}

function questionPageLabel(question) {
  if (question.section) {
    const sectionKey = String(question.section).toLowerCase();
    return QUESTION_PAGE_LABELS[sectionKey] || question.section;
  }
  const prefix = String(question.qKey || '').split('.')[0].toLowerCase();
  return QUESTION_PAGE_LABELS[prefix] || 'Other questions';
}

function shouldShowQuestionLabel(question) {
  const section = String(question.section || String(question.qKey || '').split('.')[0]).toLowerCase();
  return section === 'parental-rights' || section === 'health-insurance-coverage';
}

function questionLabel(question) {
  return question.qTitle || question.label || question.qKey;
}

function questionDisplayText(question) {
  return question.qText || question.qTitle || question.label || question.qKey;
}

function createToken(response, question) {
  return {
    id: `${response.qKey}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'answer',
    qKey: response.qKey,
    questionText: questionDisplayText(question || response),
    section: response.section || '',
  };
}

function createQuestionToken(question) {
  return {
    id: `${question.qKey}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'answer',
    qKey: question.qKey,
    questionText: questionDisplayText(question),
    section: question.section || 'Questionnaire',
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
  const responses = (Array.isArray(state.plan?.answers) ? state.plan.answers : [])
    .filter((response) => (
      response &&
      !isInternalFormField(String(response.qKey || '').split('.').pop()) &&
      !SCHEDULE_QKEYS[String(response.qKey || '').split('.').pop()]
    ))
    .map((response) => ({
    ...response,
    section: questions[response.qKey]?.section || 'Questionnaire',
    }));

  const addFields = (source, section, fields = {}, questionSection = section, personalInfo = false) => {
    Object.entries(source || {}).forEach(([key, answer]) => {
      if (
        isInternalFormField(key) ||
        key === 'childAnswers' ||
        SCHEDULE_FIELDS[key] ||
        answer === '' ||
        answer === null ||
        answer === undefined
      ) return;
      const valueMap = customOptionValues[key];
      const options = valueMap
        ? Object.entries(valueMap).map(([value, label]) => ({ value, label }))
        : [];
      responses.push({
        qKey: `${questionSection}.${key}`,
        answer,
        section,
        personalInfo,
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
  }, 'personalInfo', true);
  addFields(state.plan, 'Getting Started', {
    userRole: 'Case filing status',
    residentialParent: 'Residential parent',
  });
  const parentingTimeData = {
    ...(state.timeAndCommunication || {}),
    ...(state.plan?.timeAndCommunication || {}),
    ...(state.plan?.parentingTime || {}),
    ...(state.plan?.parentingTimeAndCommunication || {}),
  };
  addFields(parentingTimeData, 'Parenting Time & Communication');
  addFields(state.plan?.informationSharing, 'Information Sharing');
  addFields(state.taxExemptions, 'Tax Exemptions', {
    parentRole: 'Parental role',
    claimingChildren: 'Children claimed for tax exemptions',
  }, 'taxExemptions');
  if (state.taxExemptions?.childAnswers && Object.keys(state.taxExemptions.childAnswers).length) {
    responses.push({
      qKey: 'taxExemptions.childAnswers',
      answer: state.taxExemptions.childAnswers,
      section: 'Tax Exemptions',
      label: 'Tax exemption arrangements for each child',
      question: DESIGNER_CUSTOM_QUESTIONS['taxExemptions.childAnswers'],
    });
  }

  const scheduleData = {
    ...(state.timeAndCommunication || {}),
    ...(state.plan?.timeAndCommunication || {}),
    ...(state.plan?.parentingTime || {}),
    ...(state.plan?.parentingTimeAndCommunication || {}),
  };
  Object.entries(SCHEDULE_FIELDS).forEach(([field, label]) => {
    const answer = scheduleData[field];
    if (!answer || typeof answer !== 'object' || !Object.keys(answer).length) return;
    responses.push({
      qKey: `parentingTimeAndCommunication.${field}`,
      answer,
      section: 'Parenting Time & Communication',
      label,
      question: {
        qText: label,
        scheduleType: field === 'parentingSchedule' ? 'regular' : 'calendar',
      },
    });
  });

  const children = (state.plan?.children || []).map((child, index) =>
    child,
  );
  if (children.length) {
    responses.push({
      qKey: 'getting-started.children',
      answer: children,
      section: 'Getting Started',
      personalInfo: true,
      label: 'Children',
      question: { qText: 'Children', childDetails: true },
    });
  }

  return responses;
}

const defaultTemplate = {
  title: 'Parenting Plan Questionnaire Responses',
  layout: 'blank',
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
      layout: 'blank',
      blocks: saved.blocks
        .map((block) => (
          block && SCHEDULE_QKEYS[String(block.qKey || '').split('.').pop()]
            ? { ...block, qKey: canonicalScheduleKey(block.qKey) }
            : block
        ))
        .filter((block) => (
        block &&
        typeof block.id === 'string' &&
        ['heading', 'text', 'answer'].includes(block.type)
        ))
        .filter((block, index, blocks) => (
          !blocks.some((other, otherIndex) => (
            otherIndex < index && other.qKey && other.qKey === block.qKey
          ))
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
  const [hasSavedTemplate] = useState(() => Boolean(localStorage.getItem(STORAGE_KEY)));
  const [draggedToken, setDraggedToken] = useState(null);
  const [selectedPalettePage, setSelectedPalettePage] = useState('Getting Started');

  useEffect(() => {
    fetch(buildApiUrl('/api/logic-engine/questions'))
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load question definitions');
        return response.json();
      })
      .then((items) => {
        const questionList = Array.isArray(items) ? items : items?.questions;
        if (!Array.isArray(questionList)) throw new Error('Question definitions were not returned as a list');
        const validQuestions = questionList.filter((question) => question?.qKey);
        const mergedQuestions = Object.fromEntries([
          ...validQuestions.map((question) => [question.qKey, question]),
          ...Object.entries(DESIGNER_CUSTOM_QUESTIONS).map(([qKey, question]) => [
            qKey,
            { ...question, qKey },
          ]),
        ]);
        setQuestions(mergedQuestions);
        if (!hasSavedTemplate) {
          setTemplate((current) => ({
            ...current,
            blocks: [
              ...current.blocks,
              ...Object.values(mergedQuestions)
                .map(createQuestionToken),
            ],
          }));
        }
      })
      .catch((error) => console.error(error.message));
  }, [hasSavedTemplate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
  }, [template]);

  const allAnswers = useMemo(() => collectAnswers(state, questions), [state, questions]);
  const currentAnswersByKey = useMemo(
    () => Object.fromEntries(allAnswers.map((response) => [response.qKey, response])),
    [allAnswers],
  );
  const availableAnswers = useMemo(
    () => allAnswers.filter((response) => (
      response.personalInfo
    )),
    [allAnswers],
  );
  const availableQuestions = useMemo(
    () => Object.values(questions).filter((question) => (
      !template.blocks.some((block) => block.qKey === question.qKey)
    )),
    [questions, template.blocks],
  );
  const questionGroups = useMemo(() => {
    const groups = new Map();
    availableQuestions.forEach((question) => {
      const label = questionPageLabel(question);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(question);
    });
    return [...groups.entries()];
  }, [availableQuestions]);
  const palettePages = useMemo(
    () => [...questionGroups.map(([page]) => page), 'Personal info'],
    [questionGroups],
  );

  useEffect(() => {
    if (!palettePages.includes(selectedPalettePage)) {
      setSelectedPalettePage(palettePages[0] || 'Personal info');
    }
  }, [palettePages, selectedPalettePage]);

  const selectedQuestionGroup = questionGroups.find(([page]) => page === selectedPalettePage);

  const addBlock = (block) => setTemplate((current) => ({
    ...current,
    blocks: [...current.blocks, block],
  }));

  const addText = () => addBlock({
    id: `text-${Date.now()}`,
    type: 'text',
    text: 'Enter your question or instructions here',
  });

  const addHeading = () => addBlock({
    id: `heading-${Date.now()}`, type: 'heading', text: 'Section heading',
  });

  const addAnswer = (response) => addBlock(
    createToken(response, questions[response.qKey] || response.question),
  );

  const addQuestion = (question) => addBlock(createQuestionToken(question));

  const dropAnswer = (event) => {
    event.preventDefault();
    const response = draggedToken;
    setDraggedToken(null);
    if (!response) return;
    addAnswer(response);
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
            <p>Create a document, then add questions and answers from the palette.</p>
          </div>
          <button className="form-designer__print" onClick={() => window.print()}>
            <Printer size={16} /> Preview / Print
          </button>
        </div>

        <div className="form-designer__workspace">
          <aside className="form-designer__palette">
            <h2>Document text</h2>
            <button onClick={addHeading}><Plus size={15} /> Add section heading</button>
            <button onClick={addText}><Plus size={15} /> Add question text</button>
            <h2>Pages</h2>
            <div className="form-designer__page-tabs" role="tablist" aria-label="Question pages">
              {palettePages.map((page) => (
                <button
                  className={selectedPalettePage === page ? 'form-designer__page-tab--active' : ''}
                  key={page}
                  onClick={() => setSelectedPalettePage(page)}
                  role="tab"
                  aria-selected={selectedPalettePage === page}
                >
                  {page}
                </button>
              ))}
            </div>
            {selectedQuestionGroup && (
              <>
                <h2>{selectedQuestionGroup[0]}</h2>
                <p className="form-designer__hint">Drag a question onto the document.</p>
                {selectedQuestionGroup[1].map((question) => (
                  <button
                    className="form-designer__answer-token"
                    draggable
                    key={question.qKey}
                    onDragStart={() => setDraggedToken(question)}
                    onClick={() => addQuestion(question)}
                  >
                    <GripVertical size={15} />
                    {shouldShowQuestionLabel(question) && (
                      <span className="form-designer__question-label">{questionLabel(question)}</span>
                    )}
                    <span className="form-designer__question-text">{questionDisplayText(question)}</span>
                  </button>
                ))}
              </>
            )}
            {availableQuestions.length === 0 && selectedPalettePage !== 'Personal info' && (
              <p className="form-designer__empty">All questions are placed.</p>
            )}
            {selectedPalettePage === 'Personal info' && (
              <>
                <h2>Personal info</h2>
                <p className="form-designer__hint">Add parent and children information to the document as often as needed.</p>
                {availableAnswers.length === 0 && <p className="form-designer__empty">No personal information is available.</p>}
              </>
            )}
            {selectedPalettePage === 'Personal info' && availableAnswers.map((response) => (
              <button
                className="form-designer__answer-token"
                draggable
                key={response.qKey}
                onDragStart={() => setDraggedToken(response)}
                onClick={() => addAnswer(response)}
              >
                <GripVertical size={15} />
                {shouldShowQuestionLabel(questions[response.qKey] || response) && (
                  <span className="form-designer__question-label">
                    {questionLabel(questions[response.qKey] || response)}
                  </span>
                )}
                <span className="form-designer__question-text">
                  {questionDisplayText(questions[response.qKey] || response)}
                </span>
              </button>
            ))}
          </aside>

          <main
            className="form-designer__canvas form-designer__canvas--blank"
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
                      {(questions[block.qKey] || currentAnswersByKey[block.qKey]?.question)?.scheduleType === 'regular'
                        ? <ScheduleCalendar schedule={currentAnswersByKey[block.qKey]?.answer || {}} />
                        : answerText(
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
            <p className="form-designer__drop-hint">
              Drop questions or answers into the document
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
