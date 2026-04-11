import { useState, useEffect, useCallback } from 'react';
import { Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import { useNavigation } from '../context/NavigationContext';
import { buildApiUrl } from '../lib/apiClient';
import { auth } from '../lib/firebase';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';

export default function ParentalRights() {
    const navigate = useNavigate();
    const { state, dispatch } = useForm();
    const { setOnNext, setOnBack, setOnLeave } = useNavigation();
    const question = state.question ?? {};

    const formData = state.parental_rights ?? { planID: '', responses: [], errors: {} };
    const responses = Array.isArray(formData.responses) ? formData.responses : [];
    const curr = responses.find((response) => response.qKey === question.qKey);
    const currAnswer = curr?.answer ?? '';
    const errors = state.parental_rights?.errors ?? {};

    const childrenApplicationFlag = useSectionFlag('childrenApplication');

    const [saveError, setSaveError] = useState('');
    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        if (!state.plan?._id || formData.planID === state.plan._id) {
            return;
        }

        const planAnswers = Array.isArray(state.plan.answers)
            ? state.plan.answers.map((qAnswer) => ({ qKey: qAnswer.qKey, answer: qAnswer.answer }))
            : [];

        dispatch({
            type: 'UPDATE_SECTION',
            section: 'parental_rights',
            payload: { planID: state.plan._id, responses: planAnswers, errors: {} }
        });
    }, [dispatch, formData.planID, state.plan?._id, state.plan?.answers]);

    useEffect(() => {
        if (!question?.qKey) {
            return;
        }

        const savedAnswer = responses.find((response) => response.qKey === question.qKey)?.answer ?? '';
        if (state.currAnswer !== savedAnswer) {
            dispatch({
                type: 'UPDATE_SECTION',
                section: 'currAnswer',
                payload: savedAnswer
            });
        }
    }, [dispatch, question?.qKey, responses, state.currAnswer]);

    useEffect(() => {
        if (submitAttempted) {
            const firstError = document.querySelector('.text-input__error-message, .date-picker__error-message, .radio-group-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setSubmitAttempted(false);
        }
    }, [submitAttempted, state.parental_rights]);

    const handleFormChange = (section, field) => (value) => {
        const updated = responses.some((response) => response.qKey === question.qKey)
            ? responses.map((response) => (
                response.qKey === question.qKey
                    ? { qKey: response.qKey, answer: value }
                    : response
            ))
            : [...responses, { qKey: question.qKey, answer: value }];

        dispatch({
            type: 'UPDATE_SECTION',
            section,
            payload: { [field]: updated }
        });

        setSaveError('');
        if (errors.currAnswer) {
            dispatch({
                type: 'UPDATE_SECTION',
                section,
                payload: { errors: { ...errors, currAnswer: '' } }
            });
        }

        dispatch({
            type: 'UPDATE_SECTION',
            section: 'currAnswer',
            payload: value
        });
    };

    const validateForm = () => {
        const formErrors = {};
        if (!currAnswer?.trim()) {
            formErrors.currAnswer = 'Please select an option';
        }

        dispatch({
            type: 'UPDATE_SECTION',
            section: 'parental_rights',
            payload: { errors: formErrors }
        });

        return Object.keys(formErrors).length === 0;
    };

    const saveParentalRightsDraft = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser || !state.plan?._id || !question?._id || !question?.qKey || !currAnswer?.trim()) {
            setSaveError('');
            return;
        }

        try {
            const idToken = await currentUser.getIdToken();

            const updateCurrentResponse = await fetch(buildApiUrl(`api/plan/updateCurrent/${state.plan._id}/${question._id}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!updateCurrentResponse.ok) {
                throw new Error(`Response status: ${updateCurrentResponse.status}`);
            }

            const response = await fetch(buildApiUrl(`api/plan/${state.plan._id}/answer`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ qKey: question.qKey, answer: currAnswer }),
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const updatedPlan = await response.json();
            dispatch({
                type: 'UPDATE_SECTION',
                section: 'plan',
                payload: updatedPlan,
            });
            setSaveError('');
        } catch (error) {
            setSaveError('Failed to save this section. Please try again.');
            throw error;
        }
    }, [currAnswer, dispatch, question?._id, question?.qKey, state.plan?._id]);

    const handleNext = useCallback(async () => {
        if (!validateForm()) {
            setSubmitAttempted(true);
            return;
        }

        try {
            await saveParentalRightsDraft();
            navigate('/parenting-time-communication');
        } catch (error) {
            console.error('Failed to save parental rights answer:', error.message);
        }
    }, [navigate, saveParentalRightsDraft]);

    const handleBack = useCallback(() => {
        dispatch({
            type: 'UPDATE_SECTION',
            section: 'parental_rights',
            payload: { errors: {} }
        });
        navigate('/getting-started');
    }, [dispatch, navigate]);

    useEffect(() => {
        setOnNext(handleNext);
        setOnBack(handleBack);
        setOnLeave(saveParentalRightsDraft);

        return () => {
            setOnNext(null);
            setOnBack(null);
            setOnLeave(null);
        };
    }, [handleNext, handleBack, saveParentalRightsDraft, setOnNext, setOnBack, setOnLeave]);

    if (!question?.qKey) {
        return null;
    }

    return (
        <div className="page-container">
            <div className="page-content">
                <Card>
                    <CardHeader>
                        <CardTitle>Parental Rights</CardTitle>
                        <CardDescription>Define where your children live and who will make legal decisions. </CardDescription>
                        {saveError && (
                            <p className="text-input__error-message">{saveError}</p>
                        )}
                    </CardHeader>

                    <CardContent>
                        <hr className="section-divider" />
                        <section className={question.qKey + '-section'}>
                            <SectionHeader
                                iconClassName={question.qIcon}
                                icon={<Scale size={25} />}
                                title={question.qTitle}
                                intro={question.qIntro}
                            />
                        </section>
                        {question.type === 'multiple choice' && (
                            <RadioQuestion
                                question={question.qText}
                                name={question.qKey}
                                value={currAnswer}
                                onChange={handleFormChange(question.section.replaceAll('-', '_'), 'responses')}
                                flag={childrenApplicationFlag}
                                error={errors.currAnswer}
                                options={question.options}
                                disclaimers={[
                                    { disclaimer: 'Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer.', disclaimerVariant: 'info' }
                                ]}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
