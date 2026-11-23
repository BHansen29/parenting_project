import { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from '../lib/firebase';
import { buildApiUrl } from '../lib/apiClient';
import { useForm } from './useForm';

const EMPTY_PLAN_ANSWERS = [];

export default function useSectionQuestions(section) {
  const { state, dispatch } = useForm();
  const [definitions, setDefinitions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const planId = state.plan?._id;
  const planAnswers = state.plan?.answers || EMPTY_PLAN_ANSWERS;

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setLoadError('');
    fetch(buildApiUrl(`/api/logic-engine/questions/${section}`))
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${section} questions`);
        return response.json();
      })
      .then((items) => {
        if (!active) return;
        const questions = Array.isArray(items) ? items : [];
        setDefinitions(questions);
        setLoaded(true);
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [planId, section]);

  useEffect(() => {
    if (!loaded || loadError) return;
    const savedAnswers = Object.fromEntries(
      planAnswers
        .filter((answer) => definitions.some((question) => question.qKey === answer.qKey))
        .map((answer) => [answer.qKey, answer.answer]),
    );
    setAnswers((current) => ({ ...savedAnswers, ...current }));
  }, [definitions, loaded, loadError, planAnswers]);

  const questionsByKey = useMemo(
    () => Object.fromEntries(definitions.map((question) => [question.qKey, question])),
    [definitions],
  );
  const additionalQuestions = useMemo(
    () => definitions.filter((question) => question.pageManaged !== true),
    [definitions],
  );

  const setAnswer = useCallback((qKey, value) => {
    setAnswers((current) => ({ ...current, [qKey]: value }));
    setErrors((current) => ({ ...current, [qKey]: '' }));
    setSaveError('');
  }, []);

  const validate = useCallback(() => {
    if (!loaded || loadError) return false;
    const nextErrors = {};
    additionalQuestions.forEach((question) => {
      const answer = answers[question.qKey];
      const valid = question.type === 'text input'
        ? String(answer ?? '').trim().length > 0
        : question.options?.some((option) => option.value === answer);
      if (!valid) nextErrors[question.qKey] = 'Answer this question to continue.';
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [additionalQuestions, answers, loaded, loadError]);

  const save = useCallback(async () => {
    if (additionalQuestions.length === 0) return;
    setSaveError('');
    try {
      const user = auth.currentUser;
      if (!user || !planId) throw new Error('You must be signed in to save your answers.');
      const token = await user.getIdToken();
      let savedPlan;
      for (const question of additionalQuestions) {
        const response = await fetch(buildApiUrl(`api/plan/${planId}/answer`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ qKey: question.qKey, answer: answers[question.qKey] }),
        });
        if (!response.ok) throw new Error(`Failed to save “${question.qTitle}”`);
        savedPlan = await response.json();
      }
      if (savedPlan) dispatch({ type: 'UPDATE_SECTION', section: 'plan', payload: savedPlan });
    } catch (error) {
      setSaveError(error.message);
      throw error;
    }
  }, [additionalQuestions, answers, dispatch, planId]);

  return useMemo(() => ({
    questionsByKey,
    additionalQuestions,
    answers,
    errors,
    loadError,
    saveError,
    loaded,
    setAnswer,
    validate,
    save,
  }), [
    additionalQuestions,
    answers,
    errors,
    loadError,
    saveError,
    loaded,
    questionsByKey,
    save,
    setAnswer,
    validate,
  ]);
}
