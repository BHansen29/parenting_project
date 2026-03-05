import { useState, useEffect } from 'react';
import { Car, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';
import FlagButton from '../components/forms/FlagButton';
import RadioButton from '../components/forms/RadioButton';
import Checkbox from '../components/forms/Checkbox';
import TextInput from '../components/forms/TextInput';
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
        errors: {}
    };
    const errors = state.timeAndCommunication?.errors ?? {};

    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        if (submitAttempted) {
            const firstError = document.querySelector('.text-input__error-message, .date-picker__error-message');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setSubmitAttempted(false);
        }
    }, [formData, submitAttempted]);

    const handleChange = (field) => (value) => {
        dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { [field]: value } });
        if (errors[field]) {
            dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: { ...errors, [field]: '' } } });
        }
    };

    const handlePolicyChange = (field) => (value) => {
        dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { [field]: value } });
        const checkboxTransportation = document.getElementById('hide-checkbox-transportation');
        const checkboxActivity = document.getElementById('hide-checkbox-activity');
        const targetDescriptionField = document.getElementById('invisibility-target-transportation');
        const targetDescriptionFieldActivity = document.getElementById('invisibility-target-activity');
        checkboxTransportation.checked ? targetDescriptionField.style.display = 'none' : targetDescriptionField.style.display = 'flex';
        checkboxActivity.checked ? targetDescriptionFieldActivity.style.display = 'none' : targetDescriptionFieldActivity.style.display = 'flex';
        if (value === true) {
            const descriptionField = field === 'agreeToTransportationPolicy'
                ? 'transportationArrangementDescription'
                : 'activityPolicyDescription';
            if (errors[descriptionField]) {
                dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: { ...errors, [descriptionField]: '' } } });
            }
        }
    };

    const handleScheduleChange = (schedule) => {
        dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { parentingSchedule: schedule } });
        if (errors.parentingSchedule) {
            dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: { ...errors, parentingSchedule: '' } } });
        }
    };

    const validateForm = () => {
        const formErrors = {};
        if (!formData.agreeToTransportationPolicy && !formData.transportationArrangementDescription?.trim()) {
            formErrors.transportationArrangementDescription = 'Please describe your transportation arrangement if you do not agree to the standard policy';
        }
        if (!formData.agreeToActivityPolicy && !formData.activityPolicyDescription?.trim()) {
            formErrors.activityPolicyDescription = 'Please describe your activity scheduling arrangement if you do not agree to the standard policy';
        }
        if (!formData.communicationWithCoParentOnPhone?.trim()) {
            formErrors.communicationWithCoParentOnPhone = 'Please describe your phone communication arrangement with your co-parent';
        }
        if (!formData.notifyCoParentOfChildRelatedEvents?.trim()) {
            formErrors.notifyCoParentOfChildRelatedEvents = 'Please describe how you will notify your co-parent of child-related events';
        }
        dispatch({ type: 'UPDATE_SECTION', section: 'timeAndCommunication', payload: { errors: formErrors } });
        return Object.keys(formErrors).length === 0;
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
    }, [state]);

    return (
        <div className="page-container">
            <div className="page-content">
                <Card>
                    <CardHeader>
                        <CardTitle>Parenting Time & Communication</CardTitle>
                        <CardDescription>Establish how parenting time will be structured and communication will work.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <hr className="section-divider" />
                        <section className="transportation-agreement-section">
                            <div className="section-header-with-flag">
                                <div className="section-header">
                                    <div className="car-icon"><Car size={25} /></div>
                                    <div className="section-title-group">
                                        <h2 className="section-title">Transportation Agreement</h2>
                                        <p className="section-intro">Standard transportation arrangements</p>
                                    </div>
                                </div>
                                <div className="section-flag">
                                    <FlagButton isFlagged={transportationAgreementFlag.isFlagged} onClick={() => transportationAgreementFlag.toggleFlag()} />
                                </div>
                            </div>
                        </section>
                        <Card>
                            <CardHeader>
                                <CardDescription>
                                    <div className="policy-description-group">
                                        <h3 className="policy-title">Standard Transportation Policy:</h3>
                                        <ul className="policy-description-list">
                                            <li>Absent other agreement of the parties included in the attached parenting time schedule, each parent shall be responsible for providing transportation for the child(ren) at the beginning of the parent's parenting time period.</li>
                                            <li>Each parent shall be responsible for providing transportation for the child(ren) to and from school during that parent's parenting time period.</li>
                                        </ul>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Checkbox id="hide-checkbox-transportation" label="I agree to the standard transportation policy"
                                    name="agreeToTransportationPolicy" checked={formData.agreeToTransportationPolicy}
                                    onChange={handlePolicyChange('agreeToTransportationPolicy')} />
                                <div className="custom-description-section" id="invisibility-target-transportation">
                                    <div className="or-divider">OR</div>
                                    <TextInput className="text-input-long-text" id="transportationArrangementDescription"
                                        label="Please describe your preferred transportation arrangement:"
                                        type="text" value={formData.transportationArrangementDescription}
                                        onChange={handleChange('transportationArrangementDescription')}
                                        placeholder="Describe how you would like transportation to be handled if you do not agree to the standard policy" />
                                </div>
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />
                        <section className="activities-and-sceduling-section">
                            <div className="section-header-with-flag">
                                <div className="section-header">
                                    <div className="car-icon"><Calendar size={25} /></div>
                                    <div className="section-title-group">
                                        <h2 className="section-title">Activities & Scheduling</h2>
                                        <p className="section-intro">Supporting your children's activities</p>
                                    </div>
                                </div>
                                <div className="section-flag">
                                    <FlagButton isFlagged={activitiesAndSchedulingFlag.isFlagged} onClick={() => activitiesAndSchedulingFlag.toggleFlag()} />
                                </div>
                            </div>
                        </section>
                        <Card>
                            <CardHeader>
                                <CardDescription>
                                    <div className="policy-description-group">
                                        <h3 className="policy-title">Standard Activity Policy:</h3>
                                        <ul className="policy-description-list">
                                            <li>The scheduling of events, appointments, and activities shall not be done in a manner to cause undue inconvenience or harassment to the other parent.</li>
                                            <li>Both parents must understand that the child(ren) need(s) to be able to participate in regular activities without interference and with the support of both parents.</li>
                                            <li>Absent other agreement by the parents, the child(ren) shall continue to participate in those extracurricular activities, school-related and other activities in which they are currently enrolled, uninterrupted.</li>
                                            <li>Each parent shall provide the other with notice of all extracurricular activities, school-related or otherwise, in which the child(ren) participates, schedules of all activities and the name of the activity leader.</li>
                                            <li>Absent other agreement by the parents, it is the responsibility of the parent in possession of the child(ren) to provide transportation to an activity.</li>
                                        </ul>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Checkbox id="hide-checkbox-activity" label="I agree to the standard activity policy"
                                    name="agreeToActivityPolicy" checked={formData.agreeToActivityPolicy}
                                    onChange={handlePolicyChange('agreeToActivityPolicy')} />
                                <div className="custom-description-section" id="invisibility-target-activity">
                                    <div className="or-divider">OR</div>
                                    <TextInput className="text-input-long-text" id="activityArrangementDescription"
                                        label="Please describe your preferred activity policy:"
                                        type="text" value={formData.activityArrangementDescription}
                                        onChange={handleChange('activityArrangementDescription')}
                                        placeholder="Describe how you would like activities and scheduling to be handled if you do not agree to the standard policy" />
                                </div>
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />
                        <section className="parenting-schedule-section">
                            <div className="section-header-with-flag">
                                <div className="section-header">
                                    <div className="car-icon"><Calendar size={25} /></div>
                                    <div className="section-title-group">
                                        <h2 className="section-title">Parenting Schedule</h2>
                                        <p className="section-intro">Create your monthly parenting schedule</p>
                                    </div>
                                </div>
                                <div className="section-flag">
                                    <FlagButton isFlagged={parentingScheduleFlag.isFlagged} onClick={() => parentingScheduleFlag.toggleFlag()} />
                                </div>
                            </div>
                        </section>
                        <Card>
                            <CardHeader>
                                <CardDescription>
                                    Create a typical week schedule that repeats. Click on any day to set up time slots with specific time frames.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScheduleBuilder value={formData.parentingSchedule} onChange={handleScheduleChange}
                                    parent1Label="You" parent2Label="Co-Parent"
                                    helpText="Click on a day to add time slots. You can specify exact time frames or mark whole days."
                                    error={errors.parentingSchedule} />
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />
                        <section className="communication-section">
                            <div className="section-header">
                                <div className="car-icon"><Info size={25} /></div>
                                <div className="section-title-group">
                                    <h2 className="section-title">Communication with Co-Parent</h2>
                                    <p className="section-intro">Phone and communication access</p>
                                </div>
                            </div>
                        </section>
                        <Card>
                            <CardHeader className="card-header-with-flag">
                                <CardDescription className={"card-heading-question-bold"}>
                                    If your child is with you, are they allowed to talk to your co-parent on the phone?
                                </CardDescription>
                                <FlagButton isFlagged={communicationWithCoParentOnPhoneFlag.isFlagged} onClick={() => communicationWithCoParentOnPhoneFlag.toggleFlag()} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="communicationWithCoParentOnPhone" value="yes"
                                        onChange={(e) => handleChange('communicationWithCoParentOnPhone')(e.target.value)}
                                        label="Yes" checked={formData.communicationWithCoParentOnPhone === 'yes'} />
                                    <RadioButton name="communicationWithCoParentOnPhone" value="no"
                                        onChange={(e) => handleChange('communicationWithCoParentOnPhone')(e.target.value)}
                                        label="No" checked={formData.communicationWithCoParentOnPhone === 'no'} />
                                    <RadioButton name="communicationWithCoParentOnPhone" value="sometimes"
                                        onChange={(e) => handleChange('communicationWithCoParentOnPhone')(e.target.value)}
                                        label="Sometimes (please describe)" checked={formData.communicationWithCoParentOnPhone === 'sometimes'} />
                                    {formData.communicationWithCoParentOnPhone === 'sometimes' && (
                                        <TextInput className="text-input-long-text" id="communicationWithCoParentOnPhoneDescription"
                                            label="Please describe the circumstances under which your child can talk to your co-parent on the phone:"
                                            type="text" value={formData.communicationWithCoParentOnPhoneDescription}
                                            onChange={handleChange('communicationWithCoParentOnPhoneDescription')}
                                            placeholder="Describe when your child can talk to your co-parent on the phone" />
                                    )}
                                    <RadioButton name="communicationWithCoParentOnPhone" value="needMoreInfo"
                                        onChange={(e) => handleChange('communicationWithCoParentOnPhone')(e.target.value)}
                                        label="I need more information" checked={formData.communicationWithCoParentOnPhone === 'needMoreInfo'} />
                                    <RadioButton name="communicationWithCoParentOnPhone" value="defaultToCoParentChoice"
                                        onChange={(e) => handleChange('communicationWithCoParentOnPhone')(e.target.value)}
                                        label="Default to my co-parent's choice" checked={formData.communicationWithCoParentOnPhone === 'defaultToCoParentChoice'} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="card-header-with-flag">
                                <CardDescription className={"card-heading-question-bold"}>
                                    Should your co-parent be told if your children get sick or injured?
                                </CardDescription>
                                <FlagButton isFlagged={notifyCoParentOfChildRelatedEventsFlag.isFlagged} onClick={() => notifyCoParentOfChildRelatedEventsFlag.toggleFlag()} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="notifyCoParentOfChildRelatedEvents" value="yes"
                                        onChange={(e) => handleChange('notifyCoParentOfChildRelatedEvents')(e.target.value)}
                                        label="Yes" checked={formData.notifyCoParentOfChildRelatedEvents === 'yes'} />
                                    <RadioButton name="notifyCoParentOfChildRelatedEvents" value="no"
                                        onChange={(e) => handleChange('notifyCoParentOfChildRelatedEvents')(e.target.value)}
                                        label="No" checked={formData.notifyCoParentOfChildRelatedEvents === 'no'} />
                                    <RadioButton name="notifyCoParentOfChildRelatedEvents" value="sometimes"
                                        onChange={(e) => handleChange('notifyCoParentOfChildRelatedEvents')(e.target.value)}
                                        label="Sometimes (please describe)" checked={formData.notifyCoParentOfChildRelatedEvents === 'sometimes'} />
                                    {formData.notifyCoParentOfChildRelatedEvents === 'sometimes' && (
                                        <TextInput className="text-input-long-text" id="notifyCoParentOfChildRelatedEventsDescription"
                                            label="Please describe the circumstances under which you would notify your co-parent if your child gets sick or injured:"
                                            type="text" value={formData.notifyCoParentOfChildRelatedEventsDescription}
                                            onChange={handleChange('notifyCoParentOfChildRelatedEventsDescription')}
                                            placeholder="Describe when you would notify your co-parent if your child gets sick or injured" />
                                    )}
                                    <RadioButton name="notifyCoParentOfChildRelatedEvents" value="needMoreInfo"
                                        onChange={(e) => handleChange('notifyCoParentOfChildRelatedEvents')(e.target.value)}
                                        label="I need more information" checked={formData.notifyCoParentOfChildRelatedEvents === 'needMoreInfo'} />
                                    <RadioButton name="notifyCoParentOfChildRelatedEvents" value="defaultToCoParentChoice"
                                        onChange={(e) => handleChange('notifyCoParentOfChildRelatedEvents')(e.target.value)}
                                        label="Default to my co-parent's choice" checked={formData.notifyCoParentOfChildRelatedEvents === 'defaultToCoParentChoice'} />
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}