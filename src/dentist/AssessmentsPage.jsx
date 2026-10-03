import { useState } from 'react'
import Link from '../components/Link'
import DeleteButton from './DeleteButton'
import StatusBadge from './StatusBadge'
import { deleteAssessment, getAssessments } from '../services/assessmentService'
import { formatDate, toLocalISODate } from '../utils/dates'
import { useLoad } from '../utils/useLoad'

function AssessmentsPage() {
  const { loading, data: assessments, error, setData } = useLoad(getAssessments)
  const [message, setMessage] = useState(null) // { type: 'success' | 'error', text }

  async function handleDelete(assessment) {
    try {
      await deleteAssessment(assessment.id)
      setData(assessments.filter((a) => a.id !== assessment.id))
      setMessage({ type: 'success', text: `${assessment.answers.fullName}'s record (${assessment.patientId}) was deleted.` })
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
    }
  }

  return (
    <>
      <div className="dentist-page-header">
        <h1>Assessments</h1>
        <p>Submitted dental assessment forms, newest first.</p>
      </div>

      {message && (
        <p className={`notice notice-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      {loading && <p className="dentist-loading">Loading assessments…</p>}
      {error && (
        <p className="notice notice-error" role="alert">
          {error.message}
        </p>
      )}

      {assessments && (
        <section className="dentist-card">
          {assessments.length === 0 ? (
            <p className="summary-none">No assessments yet.</p>
          ) : (
            // On small screens each row becomes a card; data-label supplies the column name.
            <table className="dentist-table">
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">Patient ID</th>
                  <th scope="col">Assessment date</th>
                  <th scope="col">Assessment ID</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="visually-hidden">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td data-label="Patient" className="table-primary-cell">
                      {assessment.answers.fullName}
                    </td>
                    <td data-label="Patient ID">{assessment.patientId}</td>
                    <td data-label="Date">{formatDate(toLocalISODate(assessment.submittedAt))}</td>
                    <td data-label="Assessment ID">{assessment.code}</td>
                    <td data-label="Status">
                      <StatusBadge status={assessment.status} />
                    </td>
                    <td className="table-action-cell">
                      <Link
                        to={`/dentist/assessments/${assessment.id}`}
                        className="button button-secondary button-small"
                      >
                        View
                      </Link>
                      <DeleteButton
                        small
                        patientName={assessment.answers.fullName}
                        onDelete={() => handleDelete(assessment)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </>
  )
}

export default AssessmentsPage
