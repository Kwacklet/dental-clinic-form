/*
 * Branching (conditional question) helpers.
 * Rules are defined on each question as `showIf` in src/data/questions.js.
 */

// Returns true if a question should currently be shown.
export function isQuestionVisible(question, answers, allQuestions) {
  const rule = question.showIf
  if (!rule) return true

  // A follow-up question is hidden whenever its parent question is hidden.
  const parent = allQuestions.find((q) => q.id === rule.questionId)
  if (parent && !isQuestionVisible(parent, answers, allQuestions)) return false

  return matchesRule(rule, answers[rule.questionId])
}

// Checks one showIf rule against the parent question's answer.
// Works for single answers ('Yes') and checkbox answers (['Toothache', ...]).
function matchesRule(rule, parentAnswer) {
  const selected = Array.isArray(parentAnswer) ? parentAnswer : parentAnswer ? [parentAnswer] : []

  // { anyExcept: 'None' } -> something other than "None" was chosen
  if (rule.anyExcept !== undefined) return selected.some((answer) => answer !== rule.anyExcept)

  // { value: 'Yes' } or { value: ['Yes', 'Not sure'] }
  const wanted = Array.isArray(rule.value) ? rule.value : [rule.value]
  return selected.some((answer) => wanted.includes(answer))
}

// Removes answers belonging to questions that are now hidden, so an old
// answer never reaches the summary (or a future database) after the user
// changes a parent answer.
export function removeHiddenAnswers(answers, allQuestions) {
  const cleaned = { ...answers }
  allQuestions.forEach((question) => {
    if (!isQuestionVisible(question, answers, allQuestions)) {
      delete cleaned[question.id]
    }
  })
  return cleaned
}
