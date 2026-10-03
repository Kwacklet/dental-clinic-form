import Link from '../components/Link'
import StatusBadge from './StatusBadge'
import { getAssessments, getDashboardStats } from '../services/assessmentService'
import { formatDateTime } from '../utils/dates'
import { useLoad } from '../utils/useLoad'

function DashboardPage({ dentistName }) {
  const { loading, data: assessments, error } = useLoad(getAssessments)

  const header = (
    <div className="dentist-page-header">
      <h1>Dashboard</h1>
      <p>Welcome, {dentistName}. Here is an overview of submitted assessments.</p>
    </div>
  )
  if (loading) return <>{header}<p className="dentist-loading">Loading…</p></>
  if (error) return <>{header}<p className="notice notice-error" role="alert">{error.message}</p></>

  const stats = getDashboardStats(assessments)
  const recentAssessments = assessments.slice(0, 5)

  const statCards = [
    { label: 'Total assessments', value: stats.total },
    { label: 'Submitted today', value: stats.today },
    { label: 'Last 7 days', value: stats.thisWeek },
    { label: 'Pending review', value: stats.pendingReview, highlight: stats.pendingReview > 0 },
  ]

  return (
    <>
      {header}

      <div className="stat-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.highlight ? 'stat-card-highlight' : ''}`}>
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{card.value}</span>
          </div>
        ))}
      </div>

      <section className="dentist-card">
        <div className="dentist-card-header">
          <h2>Recent assessments</h2>
          <Link to="/dentist/assessments">View all</Link>
        </div>
        {recentAssessments.length === 0 && <p className="summary-none">No assessments yet.</p>}
        <ul className="recent-list">
          {recentAssessments.map((assessment) => (
            <li key={assessment.id}>
              <Link to={`/dentist/assessments/${assessment.id}`} className="recent-item">
                <span className="recent-name">{assessment.answers.fullName}</span>
                <span className="recent-meta">
                  {assessment.patientId} · {formatDateTime(assessment.submittedAt)}
                </span>
                <StatusBadge status={assessment.status} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default DashboardPage
