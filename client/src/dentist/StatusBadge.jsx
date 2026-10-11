// Small colored label for an assessment's status ('New' or 'Reviewed').
function StatusBadge({ status }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
}

export default StatusBadge
