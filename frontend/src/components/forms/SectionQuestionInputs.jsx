import RadioQuestion from './RadioQuestion';
import TextQuestion from './TextQuestion';

export default function SectionQuestionInputs({
  questions,
  answers,
  errors,
  loadError,
  saveError,
  loading,
  onChange,
}) {
  return (
    <>
      {loading && <p role="status">Loading additional questions...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {saveError && <p role="alert">{saveError}</p>}
      {questions.map((question) => (
        question.type === 'text input' ? (
          <TextQuestion
            key={question.qKey}
            question={question.qText}
            help={question.qIntro}
            id={question.qKey}
            value={answers[question.qKey] ?? ''}
            onChange={(value) => onChange(question.qKey, value)}
            error={errors[question.qKey]}
            required
          />
        ) : (
          <RadioQuestion
            key={question.qKey}
            question={question.qText}
            help={question.qIntro}
            name={question.qKey}
            value={answers[question.qKey] ?? ''}
            onChange={(value) => onChange(question.qKey, value)}
            options={question.options || []}
            error={errors[question.qKey]}
            disclaimers={question.qDisclaimer
              ? [{ disclaimer: question.qDisclaimer, disclaimerVariant: 'info' }]
              : undefined}
          />
        )
      ))}
    </>
  );
}
