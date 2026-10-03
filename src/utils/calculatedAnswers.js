// Fills in answers that are calculated automatically, using each question's
// `calculate(answers, previousAnswers)` function (e.g. age from date of birth).
// `previousAnswers` are the answers before this change.
// A question with `calculateFrom` is only recalculated when that answer
// changes, so the patient can still correct the value by hand.
export function applyCalculatedAnswers(answers, allQuestions, changedQuestionId, previousAnswers = {}) {
  const updated = { ...answers }
  allQuestions.forEach((question) => {
    if (!question.calculate) return
    if (question.calculateFrom && question.calculateFrom !== changedQuestionId) return
    updated[question.id] = question.calculate(updated, previousAnswers)
  })
  return updated
}
