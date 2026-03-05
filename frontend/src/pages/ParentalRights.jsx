import { useState, useEffect } from 'react';
import { Scale, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';
import FlagButton from '../components/forms/FlagButton';
import RadioButton from '../components/forms/RadioButton';

export default function ParentalRights() {
    const navigate = useNavigate();
    const { state, dispatch } = useForm();
    const { setOnNext, setOnBack } = useNavigation();

    const formData = state.parentalRights ?? {
        appliesToAllChildren: '',
        livingArrangements: '',
        decisionMaking: '',
        errors: {}
    };

    const childrenApplicationFlag = useSectionFlag('childrenApplication');
    const livingArrangementsFlag = useSectionFlag('livingArrangements');
    const decisionMakingFlag = useSectionFlag('decisionMaking');

    // Separate error state for each radio group
    const [appliesToAllChildrenError, setAppliesToAllChildrenError] = useState('');
    const [livingArrangementsError, setLivingArrangementsError] = useState('');
    const [decisionMakingError, setDecisionMakingError] = useState('');

    // ── Clear all errors on mount (e.g. user navigated away and came back) ──
    useEffect(() => {
        setAppliesToAllChildrenError('');
        setLivingArrangementsError('');
        setDecisionMakingError('');
    }, []);

    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        if (submitAttempted) {
            const firstError = document.querySelector('.radio-group-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setSubmitAttempted(false);
        }
    }, [formData, submitAttempted]);

    const handleFormChange = (field) => (e) => {
        dispatch({ type: 'UPDATE_SECTION', section: 'parentalRights', payload: { [field]: e.target.value } });
        // Clear the corresponding error on selection
        if (field === 'appliesToAllChildren') setAppliesToAllChildrenError('');
        if (field === 'livingArrangements')   setLivingArrangementsError('');
        if (field === 'decisionMaking')       setDecisionMakingError('');
    };

    const validateForm = () => {
        let isValid = true;

        if (!formData.appliesToAllChildren) {
            setAppliesToAllChildrenError('Please select an option to continue');
            isValid = false;
        } else {
            setAppliesToAllChildrenError('');
        }

        if (!formData.livingArrangements) {
            setLivingArrangementsError('Please select an option to continue');
            isValid = false;
        } else {
            setLivingArrangementsError('');
        }

        if (!formData.decisionMaking) {
            setDecisionMakingError('Please select an option to continue');
            isValid = false;
        } else {
            setDecisionMakingError('');
        }

        return isValid;
    };

    const handleNext = () => {
        if (validateForm()) {
            navigate('/parenting-time-communication');
        } else {
            setSubmitAttempted(true);
        }
    };

    const handleBack = () => {
        navigate('/getting-started');
    };

    useEffect(() => {
        setOnNext(handleNext);
        setOnBack(handleBack);
    }, [state, formData]);

    return (
        <div className="page-container">
            <div className="page-content">
                <Card>
                    <CardHeader>
                        <CardTitle>Parental Rights</CardTitle>
                        <CardDescription>
                            Define where your children live and who will make legal decisions.
                            Fields marked with <span className="required-asterisk">*</span> are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <hr className="section-divider" />

                        {/* ── Applies to All Children ── */}
                        <section className="children-application-section">
                            <div className="section-header">
                                <div className="scale-icon"><Scale size={25} /></div>
                                <div className="section-title-group">
                                    <h2 className="section-title">Applies to All Children?</h2>
                                    <p className="section-intro">Simplify by applying answers to all children.</p>
                                </div>
                            </div>
                        </section>
                        <Card>
                            <CardHeader className="card-header-with-flag">
                                <CardDescription className="card-heading-question-bold">
                                    Will your answers apply to all of your children that you share with your co-parent?
                                    <span className="required-asterisk"> *</span>
                                </CardDescription>
                                <FlagButton isFlagged={childrenApplicationFlag.isFlagged} onClick={childrenApplicationFlag.toggleFlag} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="appliesToAllChildren" value="yes"
                                        checked={formData.appliesToAllChildren === 'yes'}
                                        onChange={handleFormChange('appliesToAllChildren')}
                                        label="Yes" description="My answers will be the same for all children" />
                                    <RadioButton name="appliesToAllChildren" value="no"
                                        checked={formData.appliesToAllChildren === 'no'}
                                        onChange={handleFormChange('appliesToAllChildren')}
                                        label="No" description="I need to answer separately for each child" />
                                    <RadioButton name="appliesToAllChildren" value="needMoreInfo"
                                        checked={formData.appliesToAllChildren === 'needMoreInfo'}
                                        onChange={handleFormChange('appliesToAllChildren')}
                                        label="I need more information" />
                                    <RadioButton name="appliesToAllChildren" value="defaultToCoParent"
                                        checked={formData.appliesToAllChildren === 'defaultToCoParent'}
                                        onChange={handleFormChange('appliesToAllChildren')}
                                        label="Default to my co-parent's choice" />
                                </div>
                                {appliesToAllChildrenError && (
                                    <p className="radio-group-error" role="alert">{appliesToAllChildrenError}</p>
                                )}
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />

                        {/* ── Living Arrangements ── */}
                        <section className="living-arrangements-section">
                            <div className="section-header">
                                <div className="house-icon"><House size={25} /></div>
                                <div className="section-title-group">
                                    <h2 className="section-title">Living Arrangements</h2>
                                    <p className="section-intro">Where will your children live?</p>
                                </div>
                            </div>
                        </section>
                        <Card>
                            <CardHeader className="card-header-with-flag">
                                <CardDescription className="card-heading-question-bold">
                                    Do you want your children to live with you?
                                    <span className="required-asterisk"> *</span>
                                </CardDescription>
                                <FlagButton isFlagged={livingArrangementsFlag.isFlagged} onClick={livingArrangementsFlag.toggleFlag} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="livingArrangements" value="parent1FullTime"
                                        checked={formData.livingArrangements === 'parent1FullTime'}
                                        onChange={handleFormChange('livingArrangements')}
                                        label="Yes, all the time" />
                                    <RadioButton name="livingArrangements" value="parent1Occasional"
                                        checked={formData.livingArrangements === 'parent1Occasional'}
                                        onChange={handleFormChange('livingArrangements')}
                                        label="Yes, on occasion" />
                                    <RadioButton name="livingArrangements" value="parent1VisitingOnly"
                                        checked={formData.livingArrangements === 'parent1VisitingOnly'}
                                        onChange={handleFormChange('livingArrangements')}
                                        label="No, I just want visiting time" />
                                    <RadioButton name="livingArrangements" value="needMoreInfo"
                                        checked={formData.livingArrangements === 'needMoreInfo'}
                                        onChange={handleFormChange('livingArrangements')}
                                        label="I need more information" />
                                    <RadioButton name="livingArrangements" value="defaultToCoParent"
                                        checked={formData.livingArrangements === 'defaultToCoParent'}
                                        onChange={handleFormChange('livingArrangements')}
                                        label="Default to my co-parent's choice" />
                                </div>
                                {livingArrangementsError && (
                                    <p className="radio-group-error" role="alert">{livingArrangementsError}</p>
                                )}
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />

                        {/* ── Legal Decision Making ── */}
                        <section className="decision-making-section">
                            <div className="section-header">
                                <div className="scale-icon"><Scale size={25} /></div>
                                <div className="section-title-group">
                                    <h2 className="section-title">Legal Decision Making</h2>
                                    <p className="section-intro">Who makes important decisions?</p>
                                </div>
                            </div>
                        </section>
                        <Card>
                            <CardHeader className="card-header-with-flag">
                                <CardDescription className="card-heading-question-bold">
                                    Do you want to make legal decisions for your children?
                                    <span className="required-asterisk"> *</span>
                                </CardDescription>
                                <FlagButton isFlagged={decisionMakingFlag.isFlagged} onClick={decisionMakingFlag.toggleFlag} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="decisionMaking" value="parent1Sole"
                                        checked={formData.decisionMaking === 'parent1Sole'}
                                        onChange={handleFormChange('decisionMaking')}
                                        label="Yes, by myself" />
                                    <RadioButton name="decisionMaking" value="jointWithCoParent"
                                        checked={formData.decisionMaking === 'jointWithCoParent'}
                                        onChange={handleFormChange('decisionMaking')}
                                        label="Yes, with my co-parent" />
                                    <RadioButton name="decisionMaking" value="noLegalDecisionMaking"
                                        checked={formData.decisionMaking === 'noLegalDecisionMaking'}
                                        onChange={handleFormChange('decisionMaking')}
                                        label="No" />
                                    <RadioButton name="decisionMaking" value="needMoreInfo"
                                        checked={formData.decisionMaking === 'needMoreInfo'}
                                        onChange={handleFormChange('decisionMaking')}
                                        label="I need more information" />
                                    <RadioButton name="decisionMaking" value="defaultToCoParent"
                                        checked={formData.decisionMaking === 'defaultToCoParent'}
                                        onChange={handleFormChange('decisionMaking')}
                                        label="Default to my co-parent's choice" />
                                </div>
                                {decisionMakingError && (
                                    <p className="radio-group-error" role="alert">{decisionMakingError}</p>
                                )}
                            </CardContent>
                        </Card>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}