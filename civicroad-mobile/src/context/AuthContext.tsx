import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import apiClient from "../api/client";
import {
  registerForNotificationsAsync,
  startReportStatusPolling,
  stopReportStatusPolling,
} from "../services/notificationService";
import { User } from "../utils/types";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

type UpdateUserPayload = Partial<
  Pick<User, "email" | "first_name" | "last_name" | "bio" | "push_token" | "profile_image_url">
>;

type AuthContextValue = {
  user: User | null;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  refreshUser: (userId?: number) => Promise<User>;
  updateUser: (payload: UpdateUserPayload) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(payload: LoginPayload) {
    const response = await apiClient.post<User>("/auth/login", payload);
    setUser(response.data);
    return response.data;
  }

  async function register(payload: RegisterPayload) {
    const response = await apiClient.post<User>("/auth/register", payload);
    return response.data;
  }

  async function refreshUser(userId = user?.id) {
    if (!userId) {
      throw new Error("A user must be logged in to refresh profile data.");
    }

    const response = await apiClient.get<User>(`/users/${userId}`);
    setUser(response.data);
    return response.data;
  }

  async function updateUser(payload: UpdateUserPayload) {
    if (!user?.id) {
      throw new Error("A user must be logged in to update profile data.");
    }

    const response = await apiClient.patch<User>(`/users/${user.id}`, payload);
    setUser(response.data);
    return response.data;
  }

  function logout() {
    stopReportStatusPolling();
    setUser(null);
  }

  useEffect(() => {
    let active = true;
    let cleanup = () => {};
    const currentUserId = user?.id ?? null;
    const currentPushToken = user?.push_token;

    if (currentUserId === null) {
      stopReportStatusPolling();
      return undefined;
    }

    const stableUserId = currentUserId;

    async function initializeNotifications() {
      const { expoPushToken } = await registerForNotificationsAsync();

      if (!active) {
        return;
      }

      if (expoPushToken && expoPushToken !== currentPushToken) {
        try {
          const response = await apiClient.patch<User>(`/users/${stableUserId}`, {
            push_token: expoPushToken,
          });

          if (active) {
            setUser(response.data);
          }
        } catch {
          // Notification token storage is optional for this MVP.
        }
      }

      cleanup = startReportStatusPolling(stableUserId);
    }

    void initializeNotifications();

    return () => {
      active = false;
      cleanup();
      stopReportStatusPolling();
    };
  }, [user?.id, user?.push_token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        refreshUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

export { AuthProvider, useAuth };
