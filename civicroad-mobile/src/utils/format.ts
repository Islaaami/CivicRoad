import { ReportStatus } from "./types";

export const defaultCoordinates = {
  latitude: 30.4167,
  longitude: -9.5833,
};

export function formatStatus(status: ReportStatus) {
  if (status === "in_progress") {
    return "In Progress";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}
