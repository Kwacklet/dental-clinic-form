import { Fragment, useState, type FormEvent } from 'react'
import ProgressSteps from './ProgressSteps'
import QuestionField from './QuestionField'
import { allQuestions, questionnaireSections as sections } from '../data/questions'
import { applyCalculatedAnswers, isQuestionVisible, removeHiddenAnswers } from '../utils/answers'
import { isEmpty, validateAnswer } from '../utils/validation'
import type { Answers, AnswerValue, Question } from '../types'

type Errors = Record<string, string>

function validateQuestions(questions: Question[], answers: Answers): Errors {
  const errors: Errors = {}
  questions.forEach((question) => {
    if (!isQuestionVisible(question, answers, allQuestions)) return
    const message = validateAnswer(question, answers[question.id])
    if (message) errors[question.id] = message
  })
  return errors
}

function focusField(questionId: string) {
  const field = document.querySelector<HTMLElement>(
    `[data-field="${questionId}"] input, [data-field="${questionId}"] select, [data-field="${questionId}"] textarea`,
  )
  field?.focus()
}

interface QuestionnaireProps {
  title: string
  answers: Answers
  onAnswersChange: (answers: Answers) => void
  onSubmit: (answers: Answers) => void
}

function Questionnaire({ title, answers, onAnswersChange, onSubmit }: QuestionnaireProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<Errors>({})

  const section = sections[stepIndex]
  const isLastStep = stepIndex === sections.length - 1
  const visibleQuestions = section.questions.filter((q) => isQuestionVisible(q, answers, allQuestions))
  const mainQuestions = section.questions.filter((q) => !q.showIf)

  function goToStep(index: number) {
    setStepIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleChange(questionId: string, value: AnswerValue) {
    const nextAnswers = applyCalculatedAnswers(
      removeHiddenAnswers({ ...answers, [questionId]: value }, allQuestions),
      allQuestions,
      questionId,
      answers,
    )
    onAnswersChange(nextAnswers)

    setErrors((previous) => {
      const next = { ...previous }
      if (next[questionId]) {
        const question = allQuestions.find((q) => q.id === questionId)
        if (question) next[questionId] = validateAnswer(question, value)
      }
      return Object.fromEntries(
        Object.entries(next).filter(([id]) => {
          const question = allQuestions.find((q) => q.id === id)
          return !question || isQuestionVisible(question, nextAnswers, allQuestions)
        }),
      )
    })
  }

  function handleBlur(question: Question) {
    const value = answers[question.id]
    if (isEmpty(value)) return
    setErrors((previous) => ({ ...previous, [question.id]: validateAnswer(question, value) }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const stepErrors = validateQuestions(section.questions, answers)
    setErrors(stepErrors)

    const firstInvalid = Object.keys(stepErrors)[0]
    if (firstInvalid) return focusField(firstInvalid)
    if (!isLastStep) return goToStep(stepIndex + 1)

    const invalidIndex = sections.findIndex((s) => Object.keys(validateQuestions(s.questions, answers)).length > 0)
    if (invalidIndex >= 0) {
      setErrors(validateQuestions(sections[invalidIndex].questions, answers))
      return goToStep(invalidIndex)
    }
    onSubmit(removeHiddenAnswers(answers, allQuestions))
  }

  return (
    <div className="questionnaire">
      <div className="page-heading">
        <h1>{title}</h1>
        <p>
          Please complete each section. Fields marked <span className="required-mark">*</span> are required.
        </p>
      </div>

      <p className="notice notice-info" role="note">
        Your answers are only sent to the clinic after you review them and press Send.
      </p>

      <ProgressSteps sections={sections} currentIndex={stepIndex} onStepClick={goToStep} />

      <form className="form-panel" onSubmit={handleSubmit} noValidate>
        <div className="form-panel-header">
          <h2>
            {stepIndex + 1}. {section.title}
          </h2>
        </div>

        <div className={`form-panel-body ${section.isPatientInfo ? 'question-grid' : 'question-list'}`}>
          {visibleQuestions.map((question, index) => {
            const startsGroup = question.group && question.group !== visibleQuestions[index - 1]?.group
            return (
              <Fragment key={question.id}>
                {startsGroup && <h3 className="question-group-title">{question.group}</h3>}
                <QuestionField
                  question={question}
                  value={answers[question.id]}
                  error={errors[question.id]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  locked={Boolean(question.lockedIf?.(answers))}
                  isFollowUp={Boolean(question.showIf) && !question.isGroupItem}
                  number={section.isPatientInfo || question.showIf ? null : mainQuestions.indexOf(question) + 1}
                />
              </Fragment>
            )
          })}
        </div>

        <div className="form-actions">
          {stepIndex > 0 && (
            <button type="button" className="button button-secondary" onClick={() => goToStep(stepIndex - 1)}>
              Previous
            </button>
          )}
          <button type="submit" className="button button-primary button-push-right">
            {isLastStep ? 'Review answers' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Questionnaire
