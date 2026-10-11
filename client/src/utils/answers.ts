import type { Answers, AnswerValue, Question, ShowIfRule } from '../types'

export function isQuestionVisible(question: Question, answers: Answers, allQuestions: Question[]): boolean {
  const rule = question.showIf
  if (!rule) return true

  const parent = allQuestions.find((q) => q.id === rule.questionId)
  if (parent && !isQuestionVisible(parent, answers, allQuestions)) return false

  return matchesRule(rule, answers[rule.questionId])
}

function matchesRule(rule: ShowIfRule, parentAnswer: AnswerValue) {
  const selected = Array.isArray(parentAnswer) ? parentAnswer : typeof parentAnswer === 'string' && parentAnswer ? [parentAnswer] : []

  if (rule.anyExcept !== undefined) return selected.some((answer) => answer !== rule.anyExcept)

  const wanted = Array.isArray(rule.value) ? rule.value : [rule.value]
  return selected.some((answer) => wanted.includes(answer))
}

export function removeHiddenAnswers(answers: Answers, allQuestions: Question[]): Answers {
  const hidden = new Set(allQuestions.filter((q) => !isQuestionVisible(q, answers, allQuestions)).map((q) => q.id))
  return Object.fromEntries(Object.entries(answers).filter(([id]) => !hidden.has(id)))
}

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
