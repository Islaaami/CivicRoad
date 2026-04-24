import axios from "axios";

const apiBaseUrl = (
  process.env.REACT_APP_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

export function getAssetUrl(relativePath) {
  return relativePath ? `${apiBaseUrl}${relativePath}` : null;
}

export default apiClient;
