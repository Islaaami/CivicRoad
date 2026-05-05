import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getAssetUrl } from "../api/client";
import { formatDate } from "../utils/format";
import { colors, radii, shadows, spacing, typography } from "../utils/theme";
import { Report } from "../utils/types";
import StatusBadge from "./StatusBadge";

type ReportCardProps = {
  report: Report;
  onPress: () => void;
};

function ReportCard({ report, onPress }: ReportCardProps) {
  const imageUrl = getAssetUrl(report.image_url);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.content}>
        <View style={styles.copy}>
          <View style={styles.headerRow}>
            <Text numberOfLines={2} style={styles.title}>
              {report.title}
            </Text>
            <StatusBadge status={report.status} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.categoryChip}>
              <Text numberOfLines={1} style={styles.categoryText}>
                {report.category_name || "Uncategorized"}
              </Text>
            </View>
            <Text style={styles.date}>{formatDate(report.created_at)}</Text>
          </View>
        </View>

        {imageUrl ? (
          <Image contentFit="cover" source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons color={colors.primary} name="image-outline" size={22} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  cardPressed: {
    transform: [{ scale: 0.987 }],
    opacity: 0.98,
  },
  content: {
    flexDirection: "row",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  headerRow: {
    gap: spacing.xs,
  },
  title: {
    ...typography.title2,
    paddingRight: spacing.sm,
  },
  metaRow: {
    gap: spacing.sm,
  },
  categoryChip: {
    alignSelf: "flex-start",
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  categoryText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  date: {
    ...typography.caption,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
    backgroundColor: colors.backgroundAlt,
  },
  imagePlaceholder: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },
});

export default ReportCard;
