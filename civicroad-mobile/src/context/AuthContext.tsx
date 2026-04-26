import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import apiClient, { apiBaseUrl } from "../api/client";
import {
  registerForNotificationsAsync,
  startReportStatusPolling,
  stopReportStatusPolling,
} from "../services/notificationService";
import { UploadableImage, User } from "../utils/types";

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
  updateUser: (payload: UpdateUserPayload, profileImage?: UploadableImage | null) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function getImageName(profileImage: UploadableImage) {
    if (profileImage.fileName?.trim()) {
      return profileImage.fileName;
    }

    const uriFileName = profileImage.uri.split("/").pop();

    if (uriFileName) {
      return uriFileName;
    }

    return `profile-${Date.now()}.jpg`;
  }

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await apiClient.post<User>("/auth/login", payload);
    setUser(response.data);
    return response.data;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await apiClient.post<User>("/auth/register", payload);
    return response.data;
  }, []);

  const refreshUser = useCallback(
    async (userId = user?.id) => {
      if (!userId) {
        throw new Error("A user must be logged in to refresh profile data.");
      }

      const response = await apiClient.get<User>(`/users/${userId}`);
      setUser(response.data);
      return response.data;
    },
    [user?.id]
  );

  const updateUser = useCallback(
    async (payload: UpdateUserPayload, profileImage?: UploadableImage | null) => {
      if (!user?.id) {
        throw new Error("A user must be logged in to update profile data.");
      }

      if (profileImage) {
        const formData = new FormData();

        for (const [field, value] of Object.entries(payload)) {
          if (value !== undefined && value !== null) {
            formData.append(field, String(value));
          }
        }

        formData.append("profile_image", {
          uri: profileImage.uri,
          name: getImageName(profileImage),
          type: profileImage.mimeType || "image/jpeg",
        } as any);

        const response = await fetch(`${apiBaseUrl}/users/${user.id}`, {
          method: "PATCH",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });

        const rawBody = await response.text();
        let parsedBody: User | { message?: string } | null = null;

        if (rawBody) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch {
            parsedBody = null;
          }
        }

        if (!response.ok || !parsedBody || !("id" in parsedBody)) {
          throw new Error(
            (parsedBody && "message" in parsedBody ? parsedBody.message : null) ||
              "Please try again."
          );
        }

        setUser(parsedBody);
        return parsedBody;
      }

      const response = await apiClient.patch<User>(`/users/${user.id}`, payload);
      setUser(response.data);
      return response.data;
    },
    [user?.id]
  );

  const logout = useCallback(() => {
    stopReportStatusPolling();
    setUser(null);
  }, []);

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

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      refreshUser,
      updateUser,
      logout,
    }),
    [login, logout, refreshUser, register, updateUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

export { AuthProvider, useAuth };
