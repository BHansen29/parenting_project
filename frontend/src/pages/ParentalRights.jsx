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

    //form data and errors for this section
    const formData = state.parentalRights ?? {appliesToAllChildren: '', livingArrangement: '', decisionMaking: '', errors: {} };
    const errors = state.parentalRights?.errors ?? {};

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
        dispatch({
        type: 'UPDATE_SECTION',
        section: section,
        payload: { [field]: value }
        });
        if (errors[field]) {
        dispatch({
            type: 'UPDATE_SECTION',
            section: section,
            payload: { errors: { ...errors, [field]: '' } }
        });
        }
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
            section: 'parentalRights',
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
      section: 'parentalRights',
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
    )
}
