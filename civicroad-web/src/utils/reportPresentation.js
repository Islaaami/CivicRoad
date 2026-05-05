const STATUS_LABELS = {
  pending: "En attente",
  in_progress: "En cours",
  resolved: "Résolu",
};

const PRIORITY_LABELS = {
  none: "Aucune",
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};

const CATEGORY_LABELS = {
  "Road Damage": "Chaussée endommagée",
  Streetlight: "Éclairage public",
  Waste: "Déchets",
  "Water Leak": "Fuite d'eau",
  Obstruction: "Obstruction",
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
    return "Inconnu";
  }

  return STATUS_LABELS[status] || String(status).replace(/_/g, " ");
}

export function formatPriorityLabel(priority) {
  if (!priority) {
    return "Aucune";
  }

  return PRIORITY_LABELS[priority] || priority;
}

export function formatCategoryLabel(category) {
  if (!category) {
    return "Non catégorisé";
  }

  return CATEGORY_LABELS[category] || category;
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
    return "Inconnu";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Inconnu";
  }

  return new Intl.DateTimeFormat("fr-FR", {
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

  return fullName || user?.municipality || "Agent communal";
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
