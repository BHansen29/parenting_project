import { useEffect, useRef } from 'react';
import { Scale, House, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';

export default function ParentalRights() {

    const { state, dispatch } = useForm();
    const question = state.question

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
        if (!question?.qKey) return;
        const curr = state.parental_rights.responses.find(r => r.qKey === question.qKey);
        const currAnswer = curr?.answer ?? '';
        if (state.currAnswer !== currAnswer) {
            dispatch({ type: 'UPDATE_SECTION', section: 'currAnswer', payload: currAnswer });
        }
    }, [question?.qKey, state.parental_rights.responses, state.currAnswer, dispatch]);

    //flag states for this section
    const childrenApplicationFlag = useSectionFlag('childrenApplication');

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

    const formData = state.parental_rights
    let curr = formData.responses.find((response) => {return response.qKey === question.qKey})
    if (!curr) {
        curr = {qKey: question.qKey, answer: ''}
        formData.responses.push(curr)
    }
    const currAnswer = curr.answer

    const errors = state.parental_rights?.errors ?? {};

    //generic change handler for form fields in this section
    const handleFormChange = (section, field) => (value) => {
        // update the answer in the responses field
        const updated = formData.responses.map((res) => {return res.qKey === question.qKey ? {qKey: res.qKey, answer: value} : res})
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

    return (
        <div className="page-container">
            <div className="page-content">
                <Card>
                    <CardHeader>
                        <CardTitle>Parental Rights</CardTitle>
                        <CardDescription>Define where your children live and who will make legal decisions. </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <hr className="section-divider" />
                        <section className={question.qKey + "-section"}>
                            <SectionHeader
                                iconClassName={question.qIcon}
                                icon={<Scale size={25} />}
                                title={question.qTitle}
                            />
                            <SectionHeader
                                icon={<Info size={25} />}
                                help={question.qIntro}
                            />
                        </section>
                        {(() => {
                            if (question.type === "multiple choice") {
                                return (
                                    <RadioQuestion
                                        question={question.qText}
                                        help={question.qIntro}
                                        name={question.qKey}
                                        value={currAnswer}
                                        // need to change the 1st & 2nd value in FormContext.jsx maybe?
                                        // def need to make changes regarding this since i think it broke some things
                                        onChange={handleFormChange("parental_rights", 'responses')}
                                        //onchange={handleFormChange('parentalRights', 'appliesToAllChildren')}
                                        flag={childrenApplicationFlag}
                                        error={errors.currAnswer}
                                        options={question.options}
                                        disclaimers={[
                                            { disclaimer: "Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer.", disclaimerVariant: "info" },
                                            ...(question?.disclaimers || [])
                                        ]}
                                    />
                                );
                            }
                        })()}
                    </CardContent>    
                </Card>
            </div>
        </div>
    )
}
