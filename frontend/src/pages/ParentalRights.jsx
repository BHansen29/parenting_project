import { useState, useEffect } from 'react';
import { Scale, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useSectionFlag } from '../hooks/useSectionFlag';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import RadioQuestion from '../components/forms/RadioQuestion';

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
                            <SectionHeader
                                iconClassName="scale-icon"
                                icon={<Scale size={25} />}
                                title="Applies to All Children?"
                                intro="Simplify by applying answers to all children."
                            />
                        </section>
                        <RadioQuestion
                            question="Will your answers apply to all of your children that you share with your co-parent?"
                            name="appliesToAllChildren"
                            value={formData.appliesToAllChildren}
                            onChange={handleFormChange('parentalRights', 'appliesToAllChildren')}
                            flag={childrenApplicationFlag}
                            error={errors.appliesToAllChildren}
                            options={[
                                { value: 'yes',               label: 'Yes',                          description: 'My answers will be the same for all children' },
                                { value: 'no',                label: 'No',                           description: 'I need to answer separately for each child' },
                                { value: 'needMoreInfo',      label: 'I need more information' },
                                { value: 'defaultToCoParent', label: "Default to my co-parent's choice" },
                            ]}
                        />

                        <hr className="section-divider" />

                        {/* ── Living Arrangements ── */}
                        <section className="living-arrangements-section">
                            <SectionHeader
                                iconClassName="house-icon"
                                icon={<House size={25} />}
                                title="Living Arrangements"
                                intro="Where will your children live?"
                            />
                        </section>
                        <RadioQuestion
                            question="Do you want your children to live with you?"
                            name="livingArrangements"
                            value={formData.livingArrangements}
                            onChange={handleFormChange('parentalRights', 'livingArrangements')}
                            flag={livingArrangementsFlag}
                            error={errors.livingArrangements}
                            options={[
                                { value: 'parent1FullTime',   label: 'Yes, all the time' },
                                { value: 'parent1Occasional', label: 'Yes, on occasion' },
                                { value: 'parent1VisitingOnly', label: 'No, I just want visiting time' },
                                { value: 'needMoreInfo',      label: 'I need more information' },
                                { value: 'defaultToCoParent', label: "Default to my co-parent's choice" },
                            ]}
                        />

                        <hr className="section-divider" />

                        {/* ── Legal Decision Making ── */}
                        <section className="decision-making-section">
                            <SectionHeader
                                iconClassName="scale-icon"
                                icon={<Scale size={25} />}
                                title="Legal Decision Making"
                                intro="Who makes important decisions?"
                            />
                        </section>
                        <RadioQuestion
                            question="Do you want to make legal decisions for your children?"
                            name="decisionMaking"
                            value={formData.decisionMaking}
                            onChange={handleFormChange('parentalRights', 'decisionMaking')}
                            flag={decisionMakingFlag}
                            error={errors.decisionMaking}
                            options={[
                                { value: 'parent1Sole',          label: 'Yes, by myself' },
                                { value: 'jointWithCoParent',    label: 'Yes, with my co-parent' },
                                { value: 'noLegalDecisionMaking', label: 'No' },
                                { value: 'needMoreInfo',         label: 'I need more information' },
                                { value: 'defaultToCoParent',    label: "Default to my co-parent's choice" },
                            ]}
                        />
                    </CardContent>    
                </Card>
            </div>
        </div>
    );
}