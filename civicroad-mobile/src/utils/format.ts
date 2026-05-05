import { ReportStatus } from "./types";

export const defaultCoordinates = {
  latitude: 30.4167,
  longitude: -9.5833,
};

const CATEGORY_LABELS: Record<string, string> = {
  "Road Damage": "Chaussée endommagée",
  Streetlight: "Éclairage public",
  Waste: "Déchets",
  "Water Leak": "Fuite d'eau",
  Obstruction: "Obstruction",
};

export function formatStatus(status: ReportStatus) {
  if (status === "pending") {
    return "En attente";
  }

  if (status === "in_progress") {
    return "En cours";
  }

  return "Résolu";
}

export function formatCategoryName(categoryName?: string | null) {
  if (!categoryName) {
    return "Non catégorisé";
  }

  return CATEGORY_LABELS[categoryName] || categoryName;
}

export function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}
