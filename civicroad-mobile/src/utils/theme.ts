import { TextStyle, ViewStyle } from "react-native";
import { ReportStatus } from "./types";

export const colors = {
  primary: "#007bff",
  primaryDark: "#0056b3",
  primarySoft: "#e9f3ff",
  primarySurface: "#f5f9ff",
  background: "#f5f9ff",
  backgroundAlt: "#eef5ff",
  surface: "#ffffff",
  surfaceMuted: "#f8fbff",
  text: "#111827",
  textMuted: "#6b7280",
  textSubtle: "#94a3b8",
  border: "#e5e7eb",
  pending: "#ef4444",
  pendingSoft: "#fef2f2",
  inProgress: "#f97316",
  inProgressSoft: "#fff7ed",
  resolved: "#10b981",
  resolvedSoft: "#ecfdf5",
  danger: "#ef4444",
  dangerSoft: "#fef2f2",
  success: "#10b981",
  white: "#ffffff",
  overlay: "rgba(17, 24, 39, 0.08)",
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
};

export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  title1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontWeight: "600",
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSubtle,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
};

export const shadows: Record<string, ViewStyle> = {
  card: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  tabBar: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
};

export const layout = {
  screenPadding: spacing.lg,
  sectionGap: spacing.lg,
};

export function getStatusColors(status: ReportStatus) {
  if (status === "in_progress") {
    return {
      backgroundColor: colors.inProgressSoft,
      color: colors.inProgress,
    };
  }

  if (status === "resolved") {
    return {
      backgroundColor: colors.resolvedSoft,
      color: colors.resolved,
    };
  }

  return {
    backgroundColor: colors.pendingSoft,
    color: colors.pending,
  };
}
