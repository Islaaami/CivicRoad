const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export function formatStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {formatStatusLabel(status)}
    </span>
  );
}

export default StatusBadge;
