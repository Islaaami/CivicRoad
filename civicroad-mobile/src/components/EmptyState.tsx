import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../utils/theme";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.primary} name="document-text-outline" size={24} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
  },
  title: {
    ...typography.title2,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    textAlign: "center",
  },
  action: {
    width: "100%",
    marginTop: spacing.xs,
  },
});

export default EmptyState;
