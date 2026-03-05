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

    const formData = state.parentalRights ?? { appliesToAllChildren: '', livingArrangement: '', decisionMaking: '', errors: {} };
    const errors = state.parentalRights?.errors ?? {};

    const childrenApplicationFlag = useSectionFlag('childrenApplication');
    const livingArrangementsFlag = useSectionFlag('livingArrangements');
    const decisionMakingFlag = useSectionFlag('decisionMaking');

    const [submitAttempted, setSubmitAttempted] = useState(false);
    useEffect(() => {
        if (submitAttempted) {
            const firstError = document.querySelector('.text-input__error-message, .date-picker__error-message');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setSubmitAttempted(false);
        }
    }, [formData, submitAttempted]);

    const handleFormChange = (section, field) => (value) => {
        dispatch({ type: 'UPDATE_SECTION', section, payload: { [field]: value } });
        if (errors[field]) {
            dispatch({ type: 'UPDATE_SECTION', section, payload: { errors: { ...errors, [field]: '' } } });
        }
    };

    const validateForm = () => {
        const formErrors = {};
        if (!formData.appliesToAllChildren) formErrors.appliesToAllChildren = 'Please select an option';
        if (!formData.livingArrangements) formErrors.livingArrangements = 'Please select an option';
        if (!formData.decisionMaking) formErrors.decisionMaking = 'Please select an option';
        dispatch({ type: 'UPDATE_SECTION', section: 'parentalRights', payload: { errors: formErrors } });
        return Object.keys(formErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            navigate('/parenting-time-communication');
        } else {
            setSubmitAttempted(true);
        }
    };

    const handleBack = () => {
        dispatch({ type: 'UPDATE_SECTION', section: 'parentalRights', payload: { errors: {} } });
        navigate('/getting-started');
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
                        <CardTitle>Parental Rights</CardTitle>
                        <CardDescription>Define where your children live and who will make legal decisions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <hr className="section-divider" />
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
                                <CardDescription className={"card-heading-question-bold"}>
                                    Will your answers apply to all of your children that you share with your co-parent?
                                </CardDescription>
                                <FlagButton isFlagged={childrenApplicationFlag.isFlagged} onClick={childrenApplicationFlag.toggleFlag} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="appliesToAllChildren" value="yes"
                                        checked={formData.appliesToAllChildren === 'yes'}
                                        onChange={(e) => handleFormChange('parentalRights', 'appliesToAllChildren')(e.target.value)}
                                        label="Yes" description="My answers will be the same for all children" />
                                    <RadioButton name="appliesToAllChildren" value="no"
                                        checked={formData.appliesToAllChildren === 'no'}
                                        onChange={(e) => handleFormChange('parentalRights', 'appliesToAllChildren')(e.target.value)}
                                        label="No" description="I need to answer separately for each child" />
                                    <RadioButton name="appliesToAllChildren" value="needMoreInfo"
                                        checked={formData.appliesToAllChildren === 'needMoreInfo'}
                                        onChange={(e) => handleFormChange('parentalRights', 'appliesToAllChildren')(e.target.value)}
                                        label="I need more information" />
                                    <RadioButton name="appliesToAllChildren" value="defaultToCoParent"
                                        checked={formData.appliesToAllChildren === 'defaultToCoParent'}
                                        onChange={(e) => handleFormChange('parentalRights', 'appliesToAllChildren')(e.target.value)}
                                        label="Default to my co-parent's choice" />
                                </div>
                                {errors.appliesToAllChildren && (
                                    <div className="text-input__error-message" role="alert">{errors.appliesToAllChildren}</div>
                                )}
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />
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
                                <CardDescription className={"card-heading-question-bold"}>
                                    Do you want your children to live with you?
                                </CardDescription>
                                <FlagButton isFlagged={livingArrangementsFlag.isFlagged} onClick={livingArrangementsFlag.toggleFlag} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="livingArrangements" value="parent1FullTime"
                                        checked={formData.livingArrangements === 'parent1FullTime'}
                                        onChange={(e) => handleFormChange('parentalRights', 'livingArrangements')(e.target.value)}
                                        label="Yes, all the time" />
                                    <RadioButton name="livingArrangements" value="parent1Occasional"
                                        checked={formData.livingArrangements === 'parent1Occasional'}
                                        onChange={(e) => handleFormChange('parentalRights', 'livingArrangements')(e.target.value)}
                                        label="Yes, on occasion" />
                                    <RadioButton name="livingArrangements" value="parent1VisitingOnly"
                                        checked={formData.livingArrangements === 'parent1VisitingOnly'}
                                        onChange={(e) => handleFormChange('parentalRights', 'livingArrangements')(e.target.value)}
                                        label="No, I just want visiting time" />
                                    <RadioButton name="livingArrangements" value="needMoreInfo"
                                        checked={formData.livingArrangements === 'needMoreInfo'}
                                        onChange={(e) => handleFormChange('parentalRights', 'livingArrangements')(e.target.value)}
                                        label="I need more information" />
                                    <RadioButton name="livingArrangements" value="defaultToCoParent"
                                        checked={formData.livingArrangements === 'defaultToCoParent'}
                                        onChange={(e) => handleFormChange('parentalRights', 'livingArrangements')(e.target.value)}
                                        label="Default to my co-parent's choice" />
                                </div>
                                {errors.livingArrangements && (
                                    <div className="text-input__error-message" role="alert">{errors.livingArrangements}</div>
                                )}
                            </CardContent>
                        </Card>

                        <hr className="section-divider" />
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
                                <CardDescription className={"card-heading-question-bold"}>
                                    Do you want to make legal decisions for your children?
                                </CardDescription>
                                <FlagButton isFlagged={decisionMakingFlag.isFlagged} onClick={decisionMakingFlag.toggleFlag} />
                            </CardHeader>
                            <CardContent>
                                <div className="radio-group">
                                    <RadioButton name="decisionMaking" value="parent1Sole"
                                        checked={formData.decisionMaking === 'parent1Sole'}
                                        onChange={(e) => handleFormChange('parentalRights', 'decisionMaking')(e.target.value)}
                                        label="Yes, by myself" />
                                    <RadioButton name="decisionMaking" value="jointWithCoParent"
                                        checked={formData.decisionMaking === 'jointWithCoParent'}
                                        onChange={(e) => handleFormChange('parentalRights', 'decisionMaking')(e.target.value)}
                                        label="Yes, with my co-parent" />
                                    <RadioButton name="decisionMaking" value="noLegalDecisionMaking"
                                        checked={formData.decisionMaking === 'noLegalDecisionMaking'}
                                        onChange={(e) => handleFormChange('parentalRights', 'decisionMaking')(e.target.value)}
                                        label="No" />
                                    <RadioButton name="decisionMaking" value="needMoreInfo"
                                        checked={formData.decisionMaking === 'needMoreInfo'}
                                        onChange={(e) => handleFormChange('parentalRights', 'decisionMaking')(e.target.value)}
                                        label="I need more information" />
                                    <RadioButton name="decisionMaking" value="defaultToCoParent"
                                        checked={formData.decisionMaking === 'defaultToCoParent'}
                                        onChange={(e) => handleFormChange('parentalRights', 'decisionMaking')(e.target.value)}
                                        label="Default to my co-parent's choice" />
                                </div>
                                {errors.decisionMaking && (
                                    <div className="text-input__error-message" role="alert">{errors.decisionMaking}</div>
                                )}
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}