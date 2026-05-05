import { StyleSheet, Text, View } from "react-native";
import { formatStatus } from "../utils/format";
import { colors, getStatusColors, radii, spacing } from "../utils/theme";
import { ReportStatus } from "../utils/types";

type StatusBadgeProps = {
  status: ReportStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors = getStatusColors(status);

  return (
    <View style={[styles.badge, { backgroundColor: statusColors.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: statusColors.color }]}>
        {formatStatus(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
});

export default StatusBadge;
