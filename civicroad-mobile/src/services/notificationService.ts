import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import apiClient from "../api/client";
import { formatStatus } from "../utils/format";
import { Report } from "../utils/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const POLL_INTERVAL_MS = 30000;

let notificationsGranted = false;
let pollingTimer: ReturnType<typeof setInterval> | null = null;
let knownStatuses = new Map<number, Report["status"]>();

async function fetchUserReports(userId: number) {
  const response = await apiClient.get<Report[]>("/reports");
  return response.data.filter((report) => report.citizen_id === userId);
}

async function syncReportStatuses(userId: number) {
  const reports = await fetchUserReports(userId);
  const nextStatuses = new Map<number, Report["status"]>();

  for (const report of reports) {
    nextStatuses.set(report.id, report.status);

    const previousStatus = knownStatuses.get(report.id);

    if (previousStatus && previousStatus !== report.status && notificationsGranted) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Report status updated",
          body: `Your report "${report.title}" status changed to "${formatStatus(
            report.status
          )}".`,
          data: {
            reportId: report.id,
          },
        },
        trigger: null,
      });
    }
  }

  knownStatuses = nextStatuses;
}

export async function registerForNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("report-status", {
      name: "Report status",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  notificationsGranted = finalStatus === "granted";

  let expoPushToken: string | null = null;

  if (notificationsGranted) {
    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        (Constants.easConfig as { projectId?: string } | null)?.projectId;

      const tokenResponse = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();

      expoPushToken = tokenResponse.data;
    } catch {
      expoPushToken = null;
    }
  }

  return {
    granted: notificationsGranted,
    expoPushToken,
  };
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
) {
  const subscription = Notifications.addNotificationReceivedListener(listener);

  return () => {
    subscription.remove();
  };
}

export function startReportStatusPolling(userId: number) {
  stopReportStatusPolling();

  void syncReportStatuses(userId);

  pollingTimer = setInterval(() => {
    void syncReportStatuses(userId);
  }, POLL_INTERVAL_MS);

  return () => {
    stopReportStatusPolling();
  };
}

export function stopReportStatusPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }

  knownStatuses = new Map<number, Report["status"]>();
}
