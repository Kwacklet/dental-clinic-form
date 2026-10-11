import Link from '../components/Link'
import StatusBadge from './StatusBadge'
import { getAssessments } from '../api/assessments'
import { useLoad } from '../hooks/useLoad'
import { formatDateTime, getTodayISO, toLocalISODate } from '../utils/dates'
import type { Assessment } from '../types'

function getStatCards(assessments: Assessment[]) {
  const today = getTodayISO()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const pendingReview = assessments.filter((a) => a.status === 'New').length

  return [
    { label: 'Total assessments', value: assessments.length },
    { label: 'Submitted today', value: assessments.filter((a) => toLocalISODate(a.submittedAt) === today).length },
    { label: 'Last 7 days', value: assessments.filter((a) => new Date(a.submittedAt) >= weekAgo).length },
    { label: 'Pending review', value: pendingReview, highlight: pendingReview > 0 },
  ]
}

function DashboardPage({ dentistName }: { dentistName: string }) {
  const { loading, data: assessments, error } = useLoad(getAssessments)

  const header = (
    <div className="dentist-page-header">
      <h1>Dashboard</h1>
      <p>Welcome, {dentistName}. Here is an overview of submitted assessments.</p>
    </div>
  )
  if (loading) return <>{header}<p className="dentist-loading">Loading…</p></>
  if (error || !assessments) return <>{header}<p className="notice notice-error" role="alert">{error?.message}</p></>

  const recentAssessments = assessments.slice(0, 5)

  return (
    <>
      {header}

      <div className="stat-grid">
        {getStatCards(assessments).map((card) => (
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
                  {assessment.patientCode} · {formatDateTime(assessment.submittedAt)}
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
