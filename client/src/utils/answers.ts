/*
 * Helpers for the patient's answers: branching (`showIf`) and automatic
 * answers (`calculate`). Both are defined on each question in src/data/questions.ts.
 */
import type { Answers, AnswerValue, Question, ShowIfRule } from '../types'

// Returns true if a question should currently be shown.
export function isQuestionVisible(question: Question, answers: Answers, allQuestions: Question[]): boolean {
  const rule = question.showIf
  if (!rule) return true

  // A follow-up question is hidden whenever its parent question is hidden.
  const parent = allQuestions.find((q) => q.id === rule.questionId)
  if (parent && !isQuestionVisible(parent, answers, allQuestions)) return false

  return matchesRule(rule, answers[rule.questionId])
}

// Checks one showIf rule against the parent question's answer.
// Works for single answers ('Yes') and checkbox answers (['Toothache', ...]).
function matchesRule(rule: ShowIfRule, parentAnswer: AnswerValue) {
  const selected = Array.isArray(parentAnswer) ? parentAnswer : typeof parentAnswer === 'string' && parentAnswer ? [parentAnswer] : []

  // { anyExcept: 'None' } -> something other than "None" was chosen
  if (rule.anyExcept !== undefined) return selected.some((answer) => answer !== rule.anyExcept)

  // { value: 'Yes' } or { value: ['Yes', 'Not sure'] }
  const wanted = Array.isArray(rule.value) ? rule.value : [rule.value]
  return selected.some((answer) => wanted.includes(answer))
}

// Drops answers to questions that are now hidden, so an old answer never
// reaches the summary or the database after the patient changes a parent answer.
export function removeHiddenAnswers(answers: Answers, allQuestions: Question[]): Answers {
  const hidden = new Set(allQuestions.filter((q) => !isQuestionVisible(q, answers, allQuestions)).map((q) => q.id))
  return Object.fromEntries(Object.entries(answers).filter(([id]) => !hidden.has(id)))
}

// Fills in automatic answers (e.g. age from date of birth). A question with
// `calculateFrom` is only recalculated when that answer changes, so the
// patient can still correct the value by hand.
export function applyCalculatedAnswers(
  answers: Answers,
  allQuestions: Question[],
  changedQuestionId?: string,
  previousAnswers: Answers = {},
): Answers {
  const updated = { ...answers }
  allQuestions.forEach((question) => {
    if (!question.calculate) return
    if (question.calculateFrom && question.calculateFrom !== changedQuestionId) return
    updated[question.id] = question.calculate(updated, previousAnswers)
  })
  return updated
}
