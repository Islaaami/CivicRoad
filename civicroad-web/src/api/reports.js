import apiClient from "./client";

export async function getReports() {
  const response = await apiClient.get("/reports");
  return response.data;
}

export async function getReport(reportId) {
  const response = await apiClient.get(`/reports/${reportId}`);
  return response.data;
}

export async function updateReportStatus(reportId, status) {
  const response = await apiClient.patch(`/reports/${reportId}/status`, {
    status,
  });

  return response.data;
}
