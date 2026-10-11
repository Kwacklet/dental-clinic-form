import AssessmentAnswers from './AssessmentAnswers'
import type { Answers } from '../types'

interface AnswerSummaryProps {
  answers: Answers
  sending: boolean
  error: string
  onEdit: () => void
  onSend: () => void
}

function AnswerSummary({ answers, sending, error, onEdit, onSend }: AnswerSummaryProps) {
  return (
    <div className="summary">
      <div className="page-heading">
        <h1>Review your answers</h1>
        <p>
          Please check your answers below. Press <strong>Send to clinic</strong> when everything is correct. You
          cannot change your answers after sending.
        </p>
      </div>

      <AssessmentAnswers answers={answers} />

      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions summary-actions">
        <button type="button" className="button button-secondary" onClick={onEdit} disabled={sending}>
          Edit answers
        </button>
        <button type="button" className="button button-primary button-push-right" onClick={onSend} disabled={sending}>
          {sending ? 'Sending…' : 'Send to clinic'}
        </button>
      </div>
    </div>
  )
}

export default AnswerSummary
