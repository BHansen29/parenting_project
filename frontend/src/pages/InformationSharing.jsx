import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/card';
import { useForm } from '../hooks/useForm';
import { useNavigation } from '../context/NavigationContext';
import './Page.css';
import SectionHeader from '../components/forms/SectionHeader';
import Disclaimer from '../components/forms/Disclaimer';
import SectionQuestionInputs from '../components/forms/SectionQuestionInputs';
import useSectionQuestions from '../hooks/useSectionQuestions';
// ─── Icons ────────────────────────────────────────────────────────────────────

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const MARRIED_CIRCUMSTANCES = new Set([
  'married',
  'married_seeking_custody',
  'married_seeking_parenting_time',
]);
const NEVER_MARRIED_CIRCUMSTANCES = new Set([
  'never_married_seeking_custody',
  'never_married_seeking_parenting_time',
]);

// ─── Component ────────────────────────────────────────────────────────────────

export default function InformationSharing() {
  const navigate = useNavigate();
  const { state } = useForm();
  const { setOnNext, setOnBack } = useNavigation();
  const sectionQuestions = useSectionQuestions('informationsharing');

  const currentCircumstance = state.plan?.currentCircumstance || state.plan?.userRole;
  const childSupportType = MARRIED_CIRCUMSTANCES.has(currentCircumstance)
    ? 'married'
    : NEVER_MARRIED_CIRCUMSTANCES.has(currentCircumstance)
      ? 'neverMarried'
      : null;

  const handleNext = useCallback(async () => {
    if (!sectionQuestions.validate()) return;

    try {
      await sectionQuestions.save();
    } catch (error) {
      console.error(error.message);
      return;
    }
    navigate('/tax-exemptions');
  }, [navigate, sectionQuestions]);

  const handleBack = useCallback(() => {
    navigate('/parenting-time-communication');
  }, []);

  useEffect(() => {
    setOnNext(handleNext);
    setOnBack(handleBack);
  }, [handleNext, handleBack]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Review child support worksheet requirements and resources.
            </CardDescription>
          </CardHeader>
          <Disclaimer variant="warning">
            This tool is for informational purposes only. It does not provide legal advice about your rights or options available to you. Your responses do not create or establish any legal rights for either parent. This tool is intended to help co-parents think about important topics when making a shared parenting plan. Only a court can approve a parenting plan and make it legally binding. If you have any questions, please talk with a lawyer.
          </Disclaimer>
          <CardContent>
            {childSupportType && (
              <div className="info-section child-support-section">
                <hr className="section-divider" />
                <SectionHeader
                  icon={<FileTextIcon />}
                  iconClassName="info-icon"
                  title="Child Support Calculation"
                />
                <div className="child-support-content">
                  <p>
                    Before the Court can finalize your {childSupportType === 'married' ? 'Shared Parenting Plan' : 'Parenting Plan'}, a completed Child Support Worksheet must be attached to your plan, as required by Ohio law.
                  </p>
                  <p>
                    The worksheet is used to calculate how much child support one parent may be required to pay the other. The calculation considers information such as each parent's income, the number of children, health insurance costs, and parenting time.
                  </p>
                  <p>
                    Your completed worksheet will determine the guideline child support amount (the amount calculated under Ohio's child support rules). The Court will use this information to decide the child support order included in your {childSupportType === 'married' ? 'Shared Parenting Plan' : 'Parenting Plan'}.
                  </p>
                  <h3>What does the Court require?</h3>
                  <ul>
                    {childSupportType === 'married' ? (
                      <li>
                        Complete the Child Support Worksheet found at the bottom of page 6 of the{' '}
                        <a href="https://www.supremecourt.ohio.gov/docs/JCS/CFC/DRForms/Form20.pdf" target="_blank" rel="noopener noreferrer">
                          Ohio Supreme Court Form 20
                        </a>.
                      </li>
                    ) : (
                      <li>
                        Complete the appropriate Child Support Worksheet found on page 6 of the{' '}
                        <a href="https://www.supremecourt.ohio.gov/docs/JCS/CFC/DRForms/Form21.pdf" target="_blank" rel="noopener noreferrer">
                          Ohio Supreme Court Form 21
                        </a>.
                      </li>
                    )}
                    <li>Determine which parent will pay child support (the obligor) and which parent will receive it (the obligee).</li>
                    <li>Identify the guideline child support amount and any requested changes to that amount.</li>
                  </ul>
                  <p>
                    Your final {childSupportType === 'married' ? 'Shared Parenting Plan' : 'Parenting Plan'} must include the completed worksheet and the child support information required by the Court.
                  </p>
                  <p>
                    Please note: The calculator provides an estimate of child support, not a final child support order. The Court makes the final decision about the amount of child support to be paid and to which parent.
                  </p>
                </div>
              </div>
            )}
            {childSupportType && (
              <div className="info-section child-support-section">
                <hr className="section-divider" />
                <SectionHeader
                  icon={<FileTextIcon />}
                  iconClassName="info-icon"
                  title="Additional Resources"
                />
                <div className="child-support-content">
                  <p>For more information about child support and how it is calculated in Ohio, visit:</p>
                  <ul>
                    <li>
                      <a href="https://www.supremecourt.ohio.gov/docs/JCS/CFC/resources/DRBenchCards/2_childSupport.pdf" target="_blank" rel="noopener noreferrer">
                        Ohio Child Support Information Guide
                      </a>: Learn more about how child support works, how courts calculate support, and what factors may affect the amount.
                    </li>
                    <li>
                      <a href="https://codes.ohio.gov/ohio-revised-code/chapter-3119" target="_blank" rel="noopener noreferrer">
                        Ohio Child Support Laws (Ohio Revised Code, Chapter 3119)
                      </a>: Review the Ohio laws that explain how child support is calculated and ordered.
                    </li>
                    <li>
                      <a href="https://ohiochildsupportcalculator.ohio.gov/pages/calculator.html" target="_blank" rel="noopener noreferrer">
                        Ohio Child Support Calculator
                      </a>: Use Ohio's official calculator to estimate your child support obligation.
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <SectionQuestionInputs
              questions={sectionQuestions.additionalQuestions}
              answers={sectionQuestions.answers}
              errors={sectionQuestions.errors}
              loadError={sectionQuestions.loadError}
              saveError={sectionQuestions.saveError}
              loading={!sectionQuestions.loaded}
              onChange={sectionQuestions.setAnswer}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}