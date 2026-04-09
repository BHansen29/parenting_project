import { useState, useEffect } from 'react';
import { Scale, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';

export default function ParentalRights() {

    const navigate = useNavigate();
    const { state, dispatch } = useForm();
    const question = state.question
    //form data and errors for this section

    // if plan doesn't match plan in the context, update context to be consistent
    if (state.parental_rights.planID !== state.plan._id) {
        let planAnswers = state.plan.answers.map((qAnswer) => {return {qKey: qAnswer.qKey, answer: qAnswer.answer}})
        if (!planAnswers) {
            planAnswers = []
        }
        dispatch({
            type: 'UPDATE_SECTION',
            section: "parental_rights",
            payload: {planID: state.plan._id, responses: planAnswers, errors: {}}
        });
    }
    const formData = state.parental_rights
    let curr = formData.responses.find((response) => {return response.qKey === question.qKey})
    if (!curr) {
        curr = {qKey: question.qKey, answer: ''}
        formData.responses.push(curr)
    }
    const currAnswer = curr.answer

    const errors = state.parental_rights?.errors ?? {};

    //flag states for this section
    const childrenApplicationFlag = useSectionFlag('childrenApplication');
    const livingArrangementsFlag = useSectionFlag('livingArrangements');
    const decisionMakingFlag = useSectionFlag('decisionMaking');

    //scroll to first error when validation fails
    const [submitAttempted, setSubmitAttempted] = useState(false);
    useEffect(() => {
        if (submitAttempted) {
            const firstError = document.querySelector('.text-input__error-message, .date-picker__error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setSubmitAttempted(false);
        }
    }, [formData, submitAttempted]);

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

    const validateForm = () => {
        const formErrors = {};
        if (!formData.appliesToAllChildren) {
            formErrors.appliesToAllChildren = 'Please select an option';
        }
        if (!formData.livingArrangements) {
            formErrors.livingArrangements = 'Please select an option';
        }
        if (!formData.decisionMaking) {
            formErrors.decisionMaking = 'Please select an option';
        }

        dispatch({
            type: 'UPDATE_SECTION',
            section: 'parental_rights',
            payload: { errors: formErrors }
        });

        return Object.keys(formErrors).length === 0;
    }

    const handleNext = () => {
    if (validateForm()) {
      navigate('/parenting-time-communication');
    } else {
      setSubmitAttempted(true);
    }
  };

   const handleBack = () => {
    dispatch({
      type: 'UPDATE_SECTION',
      section: 'parental_rights',
      payload: { errors: {} }
    });
    navigate('/getting-started');
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
                                intro={question.qIntro}
                            />
                        </section>
                        {(() => {
                            if (question.type === "multiple choice") {
                                return (
                                    <RadioQuestion
                                        question={question.qText}
                                        name={question.qKey}
                                        value={currAnswer}
                                        // need to change the 1st & 2nd value in FormContext.jsx maybe?
                                        // def need to make changes regarding this since i think it broke some things
                                        onChange={handleFormChange(question.section.replaceAll("-", "_"), 'responses')}
                                        //onchange={handleFormChange('parentalRights', 'appliesToAllChildren')}
                                        flag={childrenApplicationFlag}
                                        error={errors.currAnswer}
                                        options={question.options}
                                        disclaimer="Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer."
                                        disclaimerVariant="info"
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
