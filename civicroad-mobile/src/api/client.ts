import Constants from "expo-constants";
import axios from "axios";
import { Platform } from "react-native";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const configuredApiPort = process.env.EXPO_PUBLIC_API_PORT?.trim() || "4000";

function getExpoHost() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    return hostUri.split(":")[0];
  }

  const debuggerHost = (Constants as any).expoGoConfig?.debuggerHost;

  if (typeof debuggerHost === "string" && debuggerHost.length) {
    return debuggerHost.split(":")[0];
  }

  return null;
}

function getDefaultApiBaseUrl() {
  const expoHost = getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${configuredApiPort}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${configuredApiPort}`;
  }

  return `http://localhost:${configuredApiPort}`;
}

const apiBaseUrl = configuredApiUrl || getDefaultApiBaseUrl();

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

export function getAssetUrl(relativePath?: string | null) {
  return relativePath ? `${apiBaseUrl}${relativePath}` : null;
}

export { apiBaseUrl };
export default apiClient;
