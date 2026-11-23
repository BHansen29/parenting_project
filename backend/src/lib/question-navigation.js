const Question = require('../models/Question');
const NextQuestionRule = require('../models/NextQuestionRule');
const questionLogicHandler = require('./question-logic-handler');
const { getCircumstanceGroup } = require('./circumstance-group');

function navigationError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function findNextApplicableQuestion(startQKey, circumstanceGroup) {
  let qKey = startQKey;
  const visited = new Set();

  while (qKey) {
    if (visited.has(qKey)) {
      throw navigationError(`Question skip loop detected at "${qKey}"`, 409);
    }
    visited.add(qKey);
    if (visited.size > 100) {
      throw navigationError('Question skip chain exceeds the maximum length', 409);
    }

    const question = await Question.findOne({
      qKey,
      isArchived: { $ne: true },
    });
    if (!question) {
      throw navigationError(`Question "${qKey}" was not found or is archived`, 404);
    }

    if (!question.appliesToGroup || question.appliesToGroup === circumstanceGroup) {
      return question;
    }

    const questionRule = await NextQuestionRule.findOne({ qKey });
    if (!questionRule?.notApplicableGoTo) {
      throw navigationError(
        `Question "${qKey}" does not apply to this circumstance and has no skip destination`,
        409,
      );
    }
    qKey = questionRule.notApplicableGoTo;
  }

  return null;
}

async function getNextQuestionKey(qKey, answer) {
  const rule = await NextQuestionRule.findOne({ qKey });
  if (!rule) {
    throw navigationError('No next-question rule was found', 404);
  }

  if (rule.isDefault) return rule.goToDefault;

  const matchingRule = rule.nextQuestions.find((nextRule) =>
    questionLogicHandler.evaluate(answer, nextRule.operator, nextRule.value)
  );
  if (!matchingRule) {
    throw navigationError(`No branching rule matched the answer for "${qKey}"`, 409);
  }

  return matchingRule.goTo;
}

async function findPreviousQuestion(plan, targetQKey) {
  const currentCircumstance = plan.currentCircumstance || (
    [
      'married',
      'married_seeking_custody',
      'married_seeking_parenting_time',
      'never_married_seeking_custody',
      'never_married_seeking_parenting_time',
    ].includes(plan.userRole)
      ? plan.userRole
      : ''
  );
  const circumstanceGroup = getCircumstanceGroup(currentCircumstance);
  if (!circumstanceGroup) {
    throw navigationError('Complete your current circumstance before navigating backward', 409);
  }

  const answersByQuestion = new Map(
    (plan.answers ?? []).map(({ qKey, answer }) => [qKey, answer])
  );
  const visited = new Set();
  let question = await findNextApplicableQuestion(
    'allocation_parental_rights',
    circumstanceGroup,
  );
  let previousQuestion = null;

  while (question) {
    if (question.qKey === targetQKey) return previousQuestion;
    if (visited.has(question.qKey)) {
      throw navigationError(`Question flow loop detected at "${question.qKey}"`, 409);
    }
    visited.add(question.qKey);
    if (visited.size > 100) {
      throw navigationError('Question flow exceeds the maximum length', 409);
    }

    if (!answersByQuestion.has(question.qKey)) {
      throw navigationError(
        `Cannot reconstruct the path: no saved answer for "${question.qKey}"`,
        409,
      );
    }

    previousQuestion = question;
    const destinationQKey = await getNextQuestionKey(
      question.qKey,
      answersByQuestion.get(question.qKey),
    );
    question = await findNextApplicableQuestion(destinationQKey, circumstanceGroup);
  }

  throw navigationError(`Question "${targetQKey}" is not on the saved answer path`, 409);
}

module.exports = {
  findNextApplicableQuestion,
  findPreviousQuestion,
  getCircumstanceGroup,
  getNextQuestionKey,
};
