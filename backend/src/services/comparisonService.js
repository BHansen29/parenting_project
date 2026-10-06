/**
 * Computes a diff between two parents' answer maps.
 *
 * @param {Map|Object} answers1 - Parent 1's answers keyed by questionKey
 * @param {Map|Object} answers2 - Parent 2's answers keyed by questionKey
 * @returns {Array<{questionKey, parent1Answer, parent2Answer, agreement}>}
 */
function normalizeAnswer(answer, parentRole) {
  if (typeof answer === 'string') {
    if (answer === 'me') return parentRole;
    if (answer === 'coParent') return parentRole === 'parent1' ? 'parent2' : 'parent1';
    return answer;
  }

  if (Array.isArray(answer)) return answer.map((value) => normalizeAnswer(value, parentRole));

  if (answer && typeof answer === 'object') {
    return Object.fromEntries(
      Object.entries(answer).map(([key, value]) => [key, normalizeAnswer(value, parentRole)])
    );
  }

  return answer;
}

function computeDiff(answers1, answers2) {
  const a1 = answers1 instanceof Map ? Object.fromEntries(answers1) : (answers1 || {});
  const a2 = answers2 instanceof Map ? Object.fromEntries(answers2) : (answers2 || {});

  const allKeys = new Set([...Object.keys(a1), ...Object.keys(a2)]);

  return Array.from(allKeys).map((key) => {
    const v1 = a1[key] ?? null;
    const v2 = a2[key] ?? null;
    return {
      questionKey: key,
      parent1Answer: v1,
      parent2Answer: v2,
      agreement: JSON.stringify(normalizeAnswer(v1, 'parent1')) === JSON.stringify(normalizeAnswer(v2, 'parent2')),
    };
  });
}

module.exports = { computeDiff };
