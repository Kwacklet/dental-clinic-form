import { useState } from 'react'
import AssessmentAnswers from '../components/AssessmentAnswers'
import Link from '../components/Link'
import DeleteButton from './DeleteButton'
import StatusBadge from './StatusBadge'
import { allQuestions, questionnaireSections } from '../data/questions'
import { deleteAssessment, getAssessmentById, setAssessmentStatus } from '../services/assessmentService'
import { formatDateTime } from '../utils/dates'
import { useLoad } from '../utils/useLoad'

const backLink = (
  <Link to="/dentist/assessments" className="back-link">
    ← All assessments
  </Link>
)

// Read-only view of one submitted assessment, with buttons to mark it
// reviewed and to delete it.
function AssessmentDetailPage({ assessmentId }) {
  const { loading, data: assessment, error, setData } = useLoad(getAssessmentById, assessmentId)
  const [deleted, setDeleted] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [actionError, setActionError] = useState('')

  if (loading) return <>{backLink}<p className="dentist-loading">Loading…</p></>
  if (error) return <>{backLink}<p className="notice notice-error" role="alert">{error.message}</p></>

  if (!assessment) {
    return (
      <>
        {backLink}
        <div className="dentist-page-header">
          <h1>Assessment not found</h1>
          <p>This assessment does not exist or has been deleted.</p>
        </div>
      </>
    )
  }

  if (deleted) {
    return (
      <>
        {backLink}
        <p className="notice notice-success" role="status">
          {assessment.answers.fullName}&apos;s record ({assessment.patientId}) was deleted.
        </p>
      </>
    )
  }

  async function changeStatus(status) {
    setSavingStatus(true)
    setActionError('')
    try {
      await setAssessmentStatus(assessment.id, status)
      setData({ ...assessment, status })
    } catch (statusError) {
      setActionError(statusError.message)
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleDelete() {
    setActionError('')
    try {
      await deleteAssessment(assessment.id)
      setDeleted(true)
    } catch (deleteError) {
      setActionError(deleteError.message)
    }
  }

  const isReviewed = assessment.status === 'Reviewed'

  return (
    <>
      {backLink}

      <div className="dentist-page-header detail-header">
        <div>
          <h1>{assessment.answers.fullName}</h1>
          <dl className="detail-ids">
            <div>
              <dt>Patient ID</dt>
              <dd>{assessment.patientId}</dd>
            </div>
            <div>
              <dt>Assessment ID</dt>
              <dd>{assessment.code}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{formatDateTime(assessment.submittedAt)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={assessment.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="detail-actions">
          {isReviewed ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => changeStatus('New')}
              disabled={savingStatus}
            >
              Mark as new
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary"
              onClick={() => changeStatus('Reviewed')}
              disabled={savingStatus}
            >
              {savingStatus ? 'Saving…' : 'Mark as reviewed'}
            </button>
          )}
          <DeleteButton patientName={assessment.answers.fullName} onDelete={handleDelete} />
        </div>
      </div>

      {actionError && (
        <p className="notice notice-error" role="alert">
          {actionError}
        </p>
      )}

      {/* Same table the patient reviews before sending. Skipped follow-up questions are not shown. */}
      <div className="summary">
        <AssessmentAnswers sections={questionnaireSections} allQuestions={allQuestions} answers={assessment.answers} />
      </div>
    </>
  )
}

export default AssessmentDetailPage
