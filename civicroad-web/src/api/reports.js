import apiClient from "./client";

export async function getReports() {
  const response = await apiClient.get("/reports");
  return response.data;
}

export async function getFalseReports() {
  const response = await apiClient.get("/false-reports");
  return response.data;
}

export async function getMapReports() {
  const response = await apiClient.get("/reports/map");
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

export async function markReportAsFalse(reportId) {
  const response = await apiClient.post(`/reports/${reportId}/false`);
  return response.data;
}
