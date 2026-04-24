import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDate, formatStatus } from "../utils/format";
import { Report } from "../utils/types";
import { colors, shadows } from "../utils/theme";

type ReportCardProps = {
  report: Report;
  onPress: () => void;
};

function getStatusStyle(status: Report["status"]) {
  if (status === "in_progress") {
    return {
      backgroundColor: "#dbeafe",
      color: colors.inProgress,
    };
  }

  if (status === "resolved") {
    return {
      backgroundColor: "#dcfce7",
      color: colors.resolved,
    };
  }

  return {
    backgroundColor: "#fef3c7",
    color: colors.pending,
  };
}

function ReportCard({ report, onPress }: ReportCardProps) {
  const statusStyle = getStatusStyle(report.status);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.cardTop}>
        <Text numberOfLines={2} style={styles.title}>
          {report.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: statusStyle.color }]}>
            {formatStatus(report.status)}
          </Text>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.meta}>
        {report.category_name || "Uncategorized"}
      </Text>
      <Text style={styles.date}>{formatDate(report.created_at)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardTop: {
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ReportCard;
