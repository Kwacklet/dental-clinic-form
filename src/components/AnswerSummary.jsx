import AssessmentAnswers from './AssessmentAnswers'

// "Review your answers" screen shown before the form is sent to the clinic.
function AnswerSummary({ sections, allQuestions, answers, sending, error, onEdit, onSend }) {
  const actions = (
    <div className="form-actions summary-actions">
      <button type="button" className="button button-secondary" onClick={onEdit} disabled={sending}>
        Edit answers
      </button>
      <button type="button" className="button button-primary button-push-right" onClick={onSend} disabled={sending}>
        {sending ? 'Sending…' : 'Send to clinic'}
      </button>
    </div>
  )

  return (
    <div className="summary">
      <div className="page-heading">
        <h1>Review your answers</h1>
        <p>
          Please check your answers below. Press <strong>Send to clinic</strong> when everything is correct. You
          cannot change your answers after sending.
        </p>
      </div>

      <AssessmentAnswers sections={sections} allQuestions={allQuestions} answers={answers} />

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      {actions}
    </div>
  )
}

export default AnswerSummary
