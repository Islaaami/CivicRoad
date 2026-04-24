import apiClient from "./client";

export async function loginUser(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}
