import { useState, useEffect, useCallback } from 'react';
import { Car, Info, Calendar, Check, Radio, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';
import PolicyAgreementQuestion from '../components/forms/PolicyAgreementQuestion';
import ScheduleBuilder from '../components/forms/ScheduleBuilder';

export default function ParentingTimeAndCommunication() {
    const navigate = useNavigate();
    const { state, dispatch } = useForm();
    const { setOnNext, setOnBack } = useNavigation();

    const transportationAgreementFlag = useSectionFlag('transportationAgreement');
    const activitiesAndSchedulingFlag = useSectionFlag('activitiesAndScheduling');
    const parentingScheduleFlag = useSectionFlag('parentingSchedule');
    const communicationWithCoParentOnPhoneFlag = useSectionFlag('communicationWithCoParentOnPhone');
    const notifyCoParentOfChildRelatedEventsFlag = useSectionFlag('notifyCoParentOfChildRelatedEvents');

    const formData = state.timeAndCommunication ?? {
        agreeToTransportationPolicy: false,
        transportationArrangementDescription: '',
        agreeToActivityPolicy: false,
        activityPolicyDescription: '',
        parentingSchedule: {},
        communicationWithCoParentOnPhone: '',
        communicationWithCoParentOnPhoneDescription: '',
        notifyCoParentOfChildRelatedEvents: '',
        notifyCoParentOfChildRelatedEventsDescription: '',
        errors: {}
    };
    const errors = state.timeAndCommunication?.errors ?? {};

    // Separate error state for radio groups (not stored in formData.errors)
    const [communicationError, setCommunicationError] = useState('');
    const [notifyError, setNotifyError] = useState('');

    // ── Clear all errors on mount (e.g. user navigated away and came back) ──
    useEffect(() => {
        dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: {} } });
        setCommunicationError('');
        setNotifyError('');
    }, []);

    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        if (submitAttempted) {
            const firstError = document.querySelector(
                '.text-input__error-message, .date-picker__error-message, .radio-group-error'
            );
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setSubmitAttempted(false);
        }
    }, [formData, submitAttempted]);

    const handleChange = (field) => (value) => {
        dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { [field]: value } });
        if (errors[field]) {
            dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: { ...errors, [field]: '' } } });
        }
        if (field === 'communicationWithCoParentOnPhone') setCommunicationError('');
        if (field === 'notifyCoParentOfChildRelatedEvents') setNotifyError('');
    };

    const handlePolicyChange = (field) => (value) => {
        dispatch({
            type: 'UPDATE_SECTION',
            section: 'timeAndCommunication',
            payload: { [field]: value }
        });
        // Clear the paired description error when user agrees to the standard policy
        if (value === true) {
            const descriptionField = field === 'agreeToTransportationPolicy'
                ? 'transportationArrangementDescription'
                : 'activityPolicyDescription';
            if (errors[descriptionField]) {
                dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: { ...errors, [descriptionField]: '' } } });
            }
        }
    };

    const handleScheduleChange = useCallback((schedule) => {
        dispatch({
            type: 'UPDATE_SECTION',
            section: 'timeAndCommunication',
            payload: { parentingSchedule: schedule }
        });
        if (errors.parentingSchedule) {
            dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: { ...errors, parentingSchedule: '' } } });
        }
    }, [dispatch, errors.parentingSchedule]);

    const validateForm = () => {
        let isValid = true;
        const formErrors = {};

        // Transportation: must agree OR provide description
        if (!formData.agreeToTransportationPolicy && !formData.transportationArrangementDescription?.trim()) {
            formErrors.transportationArrangementDescription = 'Please agree to the standard policy or describe your preferred arrangement';
            isValid = false;
        }

        // Activities: must agree OR provide description
        if (!formData.agreeToActivityPolicy && !formData.activityPolicyDescription?.trim()) {
            formErrors.activityPolicyDescription = 'Please agree to the standard policy or describe your preferred arrangement';
            isValid = false;
        }

        // Communication with co-parent on phone (radio required)
        if (!formData.communicationWithCoParentOnPhone?.trim()) {
            setCommunicationError('Please select an option to continue');
            isValid = false;
        } else {
            setCommunicationError('');
            if (
                formData.communicationWithCoParentOnPhone === 'sometimes' &&
                !formData.communicationWithCoParentOnPhoneDescription?.trim()
            ) {
                formErrors.communicationWithCoParentOnPhoneDescription = 'Please describe the circumstances';
                isValid = false;
            }
        }

        // Notify co-parent of child-related events (radio required)
        if (!formData.notifyCoParentOfChildRelatedEvents?.trim()) {
            setNotifyError('Please select an option to continue');
            isValid = false;
        } else {
            setNotifyError('');
            if (
                formData.notifyCoParentOfChildRelatedEvents === 'sometimes' &&
                !formData.notifyCoParentOfChildRelatedEventsDescription?.trim()
            ) {
                formErrors.notifyCoParentOfChildRelatedEventsDescription = 'Please describe the circumstances';
                isValid = false;
            }
        }

        dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: formErrors } });
        return isValid;
    };

    const handleNext = () => {
        if (validateForm()) {
            navigate('/informationsharing');
        } else {
            setSubmitAttempted(true);
        }
    };

    const handleBack = () => {
        navigate('/parental-rights');
    };

    useEffect(() => {
        setOnNext(handleNext);
        setOnBack(handleBack);
    }, [state, communicationError, notifyError]);

    return (
        <div className="page-container">
            <div className="page-content">
                <Card>
                    <CardHeader>
                        <CardTitle>Parenting Time &amp; Communication</CardTitle>
                        <CardDescription>
                            Establish how parenting time will be structured and communication will work.
                            Fields marked with <span className="required-asterisk">*</span> are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <hr className="section-divider" />

                        {/* ── Transportation Agreement ── */}
                        <section className="transportation-agreement-section">
                            <SectionHeader
                                iconClassName="car-icon"
                                icon={<Car size={25} />}
                                title="Transportation Agreement"
                                help="Standard transportation arrangements"
                                flag={transportationAgreementFlag}
                            />
                        </section>
                        <PolicyAgreementQuestion
                            policyTitle="Standard Transportation Policy:"
                            policyItems={[
                                'Absent other agreement of the parties included in the attached parenting time schedule, each parent shall be responsible for providing transportation for the child(ren) at the beginning of the parent\'s parenting time period.',
                                'Each parent shall be responsible for providing transportation for the child(ren) to and from school during that parent\'s parenting time period.',
                            ]}
                            checkboxId="agreeToTransportationPolicy"
                            checkboxLabel="I agree to the standard transportation policy"
                            checked={formData.agreeToTransportationPolicy}
                            onCheckboxChange={handlePolicyChange('agreeToTransportationPolicy')}
                            requiredNote="You must either agree to the standard policy or describe your preferred arrangement"
                            textInput={{
                                id: 'transportationArrangementDescription',
                                label: 'Please describe your preferred transportation arrangement:',
                                value: formData.transportationArrangementDescription,
                                onChange: handleChange('transportationArrangementDescription'),
                                placeholder: 'Describe how you would like transportation to be handled if you do not agree to the standard policy',
                                error: errors.transportationArrangementDescription,
                            }}
                            disclaimer="Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer."
                            disclaimerVariant="info"
                        />

                        <hr className="section-divider" />
                        <section className="activities-and-scheduling-section">
                            <SectionHeader
                                iconClassName="car-icon"
                                icon={<Calendar size={25} />}
                                title="Activities & Scheduling"
                                help="Supporting your children's activities"
                                flag={activitiesAndSchedulingFlag}
                            />
                        </section>
                        <PolicyAgreementQuestion
                            policyTitle="Standard Activity Policy:"
                            policyItems={[
                                'The scheduling of events, appointments, and activities shall not be done in a manner to cause undue inconvenience or harassment to the other parent.',
                                'Both parents must understand that the child(ren) need(s) to be able to participate in regular activities without interference and with the support of both parents.',
                                'Absent other agreement by the parents, the child(ren) shall continue to participate in those extracurricular activities, school-related and other activities in which they are currently enrolled, uninterrupted.',
                                'Each parent shall provide the other with notice of all extracurricular activities, school-related or otherwise, in which the child(ren) participates, schedules of all activities (handwritten if no formal schedule is provided by the activity) and the name of the activity leader (including address and telephone number if reasonably available).',
                                'Absent other agreement by the parents, it is the responsibility of the parent in possession of the child(ren) to provide transportation to an activity.',
                            ]}
                            checkboxId="agreeToActivityPolicy"
                            checkboxLabel="I agree to the standard activity policy"
                            checked={formData.agreeToActivityPolicy}
                            onCheckboxChange={handlePolicyChange('agreeToActivityPolicy')}
                            textInput={{
                                id: 'activityPolicyDescription',
                                label: 'Please describe your preferred activity policy:',
                                value: formData.activityPolicyDescription,
                                onChange: handleChange('activityPolicyDescription'),
                                placeholder: 'Describe how you would like activities and scheduling to be handled if you do not agree to the standard policy',
                                error: errors.activityPolicyDescription,
                            }}
                            disclaimer="Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer."
                            disclaimerVariant="info"
                        />

                        <hr className="section-divider" />

                        {/* ── Parenting Schedule (optional) ── */}
                        <section className="parenting-schedule-section">
                            <SectionHeader
                                iconClassName="car-icon"
                                icon={<Calendar size={25} />}
                                title="Parenting Schedule"
                                help="Create your monthly parenting schedule"
                                flag={parentingScheduleFlag}
                            />
                        </section>
                        <Card>
                            <CardHeader>
                                <CardDescription>
                                    Create a typical week schedule that repeats. Click on any day to set up time slots with specific time frames.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScheduleBuilder
                                    value={formData.parentingSchedule}
                                    onChange={handleScheduleChange}
                                    parent1Label="You"
                                    parent2Label="Co-Parent"
                                    helpText="Click on a day to add time slots. You can specify exact time frames or mark whole days."
                                    error={errors.parentingSchedule}
                                />
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />

                        {/* ── Communication with Co-Parent ── */}
                        <section className="communication-section">
                            <SectionHeader
                                iconClassName="car-icon"
                                icon={<Info size={25} />}
                                title="Communication with Co-Parent"
                                help="Phone and communication access"
                            />
                        </section>
                        <RadioQuestion
                            question="If your child is with you, are they allowed to talk to your co-parent on the phone?"
                            name="communicationWithCoParentOnPhone"
                            value={formData.communicationWithCoParentOnPhone}
                            onChange={handleChange('communicationWithCoParentOnPhone')}
                            flag={communicationWithCoParentOnPhoneFlag}
                            error={communicationError}
                            options={[
                                { value: 'yes',                  label: 'Yes' },
                                { value: 'no',                   label: 'No' },
                                { value: 'sometimes',            label: 'Sometimes (please describe)' },
                                { value: 'needMoreInfo',         label: 'I need more information' },
                                { value: 'defaultToCoParentChoice', label: "Default to my co-parent's choice" },
                            ]}
                            conditionalInput={{
                                triggerValue: 'sometimes',
                                id: 'communicationWithCoParentOnPhoneDescription',
                                label: 'Please describe the circumstances under which your child can talk to your co-parent on the phone:',
                                value: formData.communicationWithCoParentOnPhoneDescription,
                                onChange: handleChange('communicationWithCoParentOnPhoneDescription'),
                                placeholder: 'Describe when your child can talk to your co-parent on the phone',
                                error: errors.communicationWithCoParentOnPhoneDescription,
                            }}
                            disclaimer="Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer."
                            disclaimerVariant="info"
                        />
                        <RadioQuestion
                            question="Should your co-parent be told if your children get sick or injured?"
                            name="notifyCoParentOfChildRelatedEvents"
                            value={formData.notifyCoParentOfChildRelatedEvents}
                            onChange={handleChange('notifyCoParentOfChildRelatedEvents')}
                            flag={notifyCoParentOfChildRelatedEventsFlag}
                            error={notifyError}
                            options={[
                                { value: 'yes',                  label: 'Yes' },
                                { value: 'no',                   label: 'No' },
                                { value: 'sometimes',            label: 'Sometimes (please describe)' },
                                { value: 'needMoreInfo',         label: 'I need more information' },
                                { value: 'defaultToCoParentChoice', label: "Default to my co-parent's choice" },
                            ]}
                            conditionalInput={{
                                triggerValue: 'sometimes',
                                id: 'notifyCoParentOfChildRelatedEventsDescription',
                                label: 'Please describe the circumstances under which you would notify your co-parent if your child gets sick or injured:',
                                value: formData.notifyCoParentOfChildRelatedEventsDescription,
                                onChange: handleChange('notifyCoParentOfChildRelatedEventsDescription'),
                                placeholder: 'Describe when you would notify your co-parent if your child gets sick or injured',
                                error: errors.notifyCoParentOfChildRelatedEventsDescription,
                            }}
                            disclaimer="Legal Disclaimer: This tool does not give instructions or legal advice about your rights or choices. If you have questions, please consult with a lawyer."
                            disclaimerVariant="info"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}