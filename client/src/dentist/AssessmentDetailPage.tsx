import { useState } from 'react'
import AssessmentAnswers from '../components/AssessmentAnswers'
import Link from '../components/Link'
import DeleteButton from './DeleteButton'
import StatusBadge from './StatusBadge'
import { deleteAssessment, getAssessment, setAssessmentStatus } from '../api/assessments'
import { useLoad } from '../hooks/useLoad'
import { formatDateTime } from '../utils/dates'

const backLink = (
  <Link to="/dentist/assessments" className="back-link">
    ← All assessments
  </Link>
)

function AssessmentDetailPage({ assessmentId }: { assessmentId: string }) {
  const { loading, data: assessment, error, setData } = useLoad(getAssessment, assessmentId)
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
          {assessment.answers.fullName}&apos;s record ({assessment.patientCode}) was deleted.
        </p>
      </>
    )
  }

  const current = assessment
  const isReviewed = current.status === 'Reviewed'

  async function toggleStatus() {
    const status = isReviewed ? 'New' : 'Reviewed'
    setSavingStatus(true)
    setActionError('')
    try {
      await setAssessmentStatus(current.id, status)
      setData({ ...current, status })
    } catch (statusError) {
      setActionError((statusError as Error).message)
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleDelete() {
    setActionError('')
    try {
      await deleteAssessment(current.id)
      setDeleted(true)
    } catch (deleteError) {
      setActionError((deleteError as Error).message)
    }
  }

  return (
    <>
      {backLink}

      <div className="dentist-page-header detail-header">
        <div>
          <h1>{current.answers.fullName}</h1>
          <dl className="detail-ids">
            <div>
              <dt>Patient ID</dt>
              <dd>{current.patientCode}</dd>
            </div>
            <div>
              <dt>Assessment ID</dt>
              <dd>{current.code}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{formatDateTime(current.submittedAt)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={current.status} />
              </dd>
            </div>
          </dl>
        </div>

        <div className="detail-actions">
          <button
            type="button"
            className={`button ${isReviewed ? 'button-secondary' : 'button-primary'}`}
            onClick={toggleStatus}
            disabled={savingStatus}
          >
            {isReviewed ? 'Mark as new' : savingStatus ? 'Saving…' : 'Mark as reviewed'}
          </button>
          <DeleteButton patientName={current.answers.fullName} onDelete={handleDelete} />
        </div>
      </div>

      {actionError && (
        <p className="notice notice-error" role="alert">
          {actionError}
        </p>
      )}

      <div className="summary">
        <AssessmentAnswers answers={current.answers} />
      </div>
    </>
  )
}

export default AssessmentDetailPage
