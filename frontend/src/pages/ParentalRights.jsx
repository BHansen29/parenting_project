import { useEffect, useRef } from 'react';
import { Scale, House, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';
import TextQuestion from '../components/forms/TextQuestion';
import { buildApiUrl } from '../lib/apiClient';
import Disclaimer from '../components/forms/Disclaimer';
import { useNavigation } from '../context/NavigationContext';

const childKey = (child, index) => child?._id || child?.id || `child-${index + 1}`;
const childName = (child, index) => [child?.fName, child?.lName].filter(Boolean).join(' ') || `Child ${index + 1}`;

export default function ParentalRights() {

    const { state, dispatch } = useForm();
    const { setOnNext } = useNavigation();
    const question = state.question
    const children = Array.isArray(state.plan?.children) ? state.plan.children : [];
    const childOptions = children.map((child, index) => ({
        value: childKey(child, index),
        label: childName(child, index),
    }));
    const isChildQuestionSection = ['parental-rights', 'health-insurance-coverage']
        .includes(question?.section);
    const actsAsMultipleChildren = question?.multipleChildren === true || childOptions.length === 1;

    useEffect(() => {
        if (state.parental_rights.planID !== state.plan?._id) {
            const planAnswers = (state.plan?.answers ?? []).map((qAnswer) => ({ qKey: qAnswer.qKey, answer: qAnswer.answer }));
            dispatch({
                type: 'UPDATE_SECTION',
                section: 'parental_rights',
                payload: { planID: state.plan._id, responses: planAnswers, errors: {} },
            });
        }
    }, [state.plan?._id]);

    useEffect(() => {
        const needsLoad = !question?.qKey || (question.section !== 'parental-rights' && question.section !== 'health-insurance-coverage');
        if (needsLoad) {
            fetch(buildApiUrl('api/logic-engine/question/allocation_parental_rights'))
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load starting question');
                    return res.json();
                })
                .then(q => {
                    dispatch({ type: 'UPDATE_SECTION', section: 'question', payload: q });
                })
                .catch(err => console.error(err.message));
        }
    }, []);

    useEffect(() => {
        if (
            !question?.qKey ||
            (isChildQuestionSection && !actsAsMultipleChildren && childOptions.length > 0)
        ) {
            if (isChildQuestionSection && !actsAsMultipleChildren && childOptions.length > 0) {
                const existing = state.parental_rights.responses.find(r => r.qKey === question.qKey);
                const byChild = existing?.answer?.byChild;
                const loadedAnswer = byChild
                    ? Object.values(byChild).find((value) => value !== undefined && value !== '')
                    : undefined;
                if (loadedAnswer !== undefined && state.currAnswer !== loadedAnswer) {
                    dispatch({ type: 'UPDATE_SECTION', section: 'currAnswer', payload: loadedAnswer });
                }
            }
            return;
        }
        const curr = state.parental_rights.responses.find(r => r.qKey === question.qKey);
        const currAnswer = curr?.answer ?? '';
        if (state.currAnswer !== currAnswer) {
            dispatch({ type: 'UPDATE_SECTION', section: 'currAnswer', payload: currAnswer });
        }
    }, [question?.qKey, state.parental_rights.responses, state.currAnswer, dispatch]);

    const isChildSpecific = isChildQuestionSection
        && !actsAsMultipleChildren
        && childOptions.length > 0;
    const childAnswerResponse = state.parental_rights.responses.find((response) => response.qKey === question?.qKey);
    const childAnswers = childAnswerResponse?.answer?.byChild ?? {};

    useEffect(() => {
        if (!isChildSpecific) {
            setOnNext(null);
            return undefined;
        }

        setOnNext(() => {
            return childOptions.every(({ value }) => {
                const answer = childAnswers[value];
                return answer !== undefined && answer !== '';
            });
        });
        return () => setOnNext(null);
    }, [isChildSpecific, childAnswers, childOptions, setOnNext]);

    //flag states for this section
    const childrenApplicationFlag = useSectionFlag(
      question?.qKey ? `question-${question.qKey}` : 'childrenApplication',
    );

    //scroll to first error when validation fails
    const submitAttempted = useRef(false);
    useEffect(() => {
        if (submitAttempted.current) {
            submitAttempted.current = false;
            const firstError = document.querySelector('.text-input__error-message, .date-picker__error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [state.parental_rights]);

    // If the question hasn't been loaded into context yet, show nothing rather than crash
    if (!question?.qKey) return null;

    const formData = state.parental_rights;
    const currAnswer = childAnswerResponse?.answer ?? '';

    const errors = state.parental_rights?.errors ?? {};

    //generic change handler for form fields in this section
    const handleFormChange = (section, field, childId) => (value) => {
        const existing = formData.responses.find((response) => response.qKey === question.qKey);
        const answer = isChildSpecific
            ? { byChild: { ...(existing?.answer?.byChild || {}), [childId]: value } }
            : value;
        const updated = existing
            ? formData.responses.map((res) => res.qKey === question.qKey ? { ...res, answer } : res)
            : [...formData.responses, { qKey: question.qKey, answer }];
        dispatch({
            type: 'UPDATE_SECTION',
            section: section,
            payload: { [field]: updated }
        });
        if (errors[field]) {
            dispatch({
                type: 'UPDATE_SECTION',
                section: section,
                payload: { errors: { ...errors, [field]: '' } }
            });
        }
        // update question answer field
        dispatch({
            type: 'UPDATE_SECTION',
            section: 'currAnswer',
            payload: value
        });
    };

    const applyAnswerToAll = (childId) => {
        const answer = childAnswers[childId];
        if (answer === undefined || answer === '') return;

        const existing = formData.responses.find((response) => response.qKey === question.qKey);
        const byChild = Object.fromEntries(childOptions.map((child) => [child.value, answer]));
        const updatedAnswer = { byChild };
        const updated = existing
            ? formData.responses.map((response) => response.qKey === question.qKey
                ? { ...response, answer: updatedAnswer }
                : response)
            : [...formData.responses, { qKey: question.qKey, answer: updatedAnswer }];

        dispatch({
            type: 'UPDATE_SECTION',
            section: 'parental_rights',
            payload: { responses: updated },
        });
        dispatch({ type: 'UPDATE_SECTION', section: 'currAnswer', payload: answer });
    };

    const renderQuestion = (childId, childLabel) => {
        const questionText = isChildSpecific
            ? `${childLabel}: ${question.qText.replace('[x]', childLabel)}`
            : question.qText;
        const answer = isChildSpecific ? (childAnswers[childId] ?? '') : currAnswer;
        const name = isChildSpecific ? `${question.qKey}-${childId}` : question.qKey;
        const onChange = handleFormChange('parental_rights', 'responses', childId);

        const questionControl = question.type === 'multiple choice'
            ? (
                <RadioQuestion
                    question={questionText}
                    help={question.qIntro}
                    name={name}
                    value={answer}
                    onChange={onChange}
                    flag={childrenApplicationFlag}
                    error={errors.currAnswer}
                    options={question.options}
                    autoFocus={!childId || childId === childOptions[0]?.value}
                />
            )
            : question.type === 'text input'
                ? (
                    <TextQuestion
                        question={questionText}
                        id={name}
                        value={answer}
                        onChange={onChange}
                        flag={childrenApplicationFlag}
                        error={errors.currAnswer}
                        required
                        autoFocus={!childId || childId === childOptions[0]?.value}
                    />
                )
                : null;

        if (!questionControl) return null;
        return (
            <div key={name} className="parental-rights-child-question">
                {questionControl}
                {isChildSpecific && (
                    <button
                        type="button"
                        className="parental-rights-apply-all"
                        onClick={() => applyAnswerToAll(childId)}
                        disabled={answer === undefined || answer === ''}
                    >
                        Apply this answer to all children
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="page-content">
                <Card>
                    <CardHeader>
                        <CardTitle>Parental Rights</CardTitle>
                        <CardDescription>Define where your children live and who will make legal decisions. </CardDescription>
                    </CardHeader>
                    <Disclaimer variant="warning">
                        This tool is for informational purposes only. It does not provide legal advice about your rights or options available to you. Your responses do not create or establish any legal rights for either parent. This tool is intended to help co-parents think about important topics when making a shared parenting plan. Only a court can approve a parenting plan and make it legally binding. If you have any questions, please talk with a lawyer. 
                    </Disclaimer>
                    <CardContent>
                        <hr className="section-divider" />
                        <section className={question.qKey + "-section"}>
                            <SectionHeader
                                iconClassName={question.qIcon}
                                icon={<Scale size={25} />}
                                title={question.qTitle}
                            />
                        </section>
                        {isChildSpecific
                            ? childOptions.map((child) => renderQuestion(child.value, child.label))
                            : renderQuestion()}
                        {question.qDisclaimer && (
                            <Disclaimer variant="warning">
                                {question.qDisclaimer}
                            </Disclaimer>
                        )}
                        {!isChildSpecific && question.qIntro && question.type === 'text input' && (
                            <Disclaimer variant="info">
                                {question.qIntro}
                            </Disclaimer>
                        )}
                    </CardContent>    
                </Card>
            </div>
        </div>
    )
}
