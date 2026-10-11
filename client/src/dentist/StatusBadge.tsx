import type { AssessmentStatus } from '../types'

function StatusBadge({ status }: { status: AssessmentStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
}

export default StatusBadge
