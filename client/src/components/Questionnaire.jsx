import { Fragment, useState } from 'react'
import ProgressSteps from './ProgressSteps'
import QuestionField from './QuestionField'
import { isQuestionVisible, removeHiddenAnswers } from '../utils/branching'
import { applyCalculatedAnswers } from '../utils/calculatedAnswers'
import { isEmpty, validateAnswer } from '../utils/validation'

// Validates the visible questions in a list. Returns { questionId: message }.
function validateQuestions(questions, answers, allQuestions) {
  const errors = {}
  questions.forEach((question) => {
    if (!isQuestionVisible(question, answers, allQuestions)) return
    const message = validateAnswer(question, answers[question.id])
    if (message) errors[question.id] = message
  })
  return errors
}

function focusField(questionId) {
  const field = document.querySelector(
    `[data-field="${questionId}"] input, [data-field="${questionId}"] select, [data-field="${questionId}"] textarea`,
  )
  field?.focus()
}

function Questionnaire({ title, sections, allQuestions, answers, onAnswersChange, onSubmit }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState({})

  const section = sections[stepIndex]
  const isLastStep = stepIndex === sections.length - 1
  const visibleQuestions = section.questions.filter((q) => isQuestionVisible(q, answers, allQuestions))
  // Main questions are numbered 1, 2, 3... Follow-up questions are not numbered.
  const mainQuestions = section.questions.filter((q) => !q.showIf)

  function goToStep(index) {
    setStepIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleChange(questionId, value) {
    // Update the answer, drop any answers whose questions just became hidden,
    // then refresh automatic answers (e.g. age from date of birth, pregnancy for males).
    const nextAnswers = applyCalculatedAnswers(
      removeHiddenAnswers({ ...answers, [questionId]: value }, allQuestions),
      allQuestions,
      questionId,
      answers,
    )
    onAnswersChange(nextAnswers)

    setErrors((previous) => {
      const next = { ...previous }
      // Re-check a field live once it has shown an error.
      if (next[questionId]) {
        const question = allQuestions.find((q) => q.id === questionId)
        next[questionId] = validateAnswer(question, value)
      }
      // Clear errors for follow-up questions that are no longer shown.
      allQuestions.forEach((q) => {
        if (!isQuestionVisible(q, nextAnswers, allQuestions)) delete next[q.id]
      })
      return next
    })
  }

  // Check a text field when the user leaves it, but don't nag about empty fields yet.
  function handleBlur(question) {
    const value = answers[question.id]
    if (isEmpty(value)) return
    setErrors((previous) => ({ ...previous, [question.id]: validateAnswer(question, value) }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const stepErrors = validateQuestions(section.questions, answers, allQuestions)
    setErrors(stepErrors)

    const firstInvalid = Object.keys(stepErrors)[0]
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    if (!isLastStep) {
      goToStep(stepIndex + 1)
      return
    }

    // Final check across every section before submitting.
    for (let index = 0; index < sections.length; index++) {
      const sectionErrors = validateQuestions(sections[index].questions, answers, allQuestions)
      if (Object.keys(sectionErrors).length > 0) {
        setErrors(sectionErrors)
        goToStep(index)
        return
      }
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
            // Show a heading (e.g. "Toothache") before the first question of each follow-up group.
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
