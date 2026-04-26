import axios from "axios";

const STORAGE_KEY = "civicroad-user";
const apiBaseUrl = (
  process.env.REACT_APP_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);

    if (!storedUser) {
      return config;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser?.id) {
      config.headers = config.headers || {};
      config.headers["x-user-id"] = String(parsedUser.id);
    }
  } catch (_error) {
    // Ignore storage parsing issues and proceed without a scoped user header.
  }

  return config;
});

export function getAssetUrl(relativePath) {
  return relativePath ? `${apiBaseUrl}${relativePath}` : null;
}

export default apiClient;
