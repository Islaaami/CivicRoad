const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const PRIORITY_LABELS = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
};

const STATUS_TONES = {
  pending: "attention",
  in_progress: "accent",
  resolved: "success",
};

const PRIORITY_TONES = {
  none: "neutral",
  low: "info",
  medium: "warning",
  high: "danger",
};

export function formatStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return STATUS_LABELS[status] || String(status).replace(/_/g, " ");
}

export function formatPriorityLabel(priority) {
  if (!priority) {
    return "None";
  }

  return PRIORITY_LABELS[priority] || priority;
}

export function getStatusTone(status) {
  return STATUS_TONES[status] || "neutral";
}

export function getPriorityTone(priority) {
  return PRIORITY_TONES[priority] || "neutral";
}

export function getReportPriority(report) {
  return report?.priority || null;
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export function truncateText(value, maxLength = 110) {
  const content = String(value || "").trim();

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength - 1).trim()}...`;
}

export function getUserDisplayName(user) {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.municipality || "Municipality Staff";
}

export function getUserInitials(user) {
  const displayName = getUserDisplayName(user);
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "CR";
}
