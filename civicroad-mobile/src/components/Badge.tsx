import { StyleSheet, Text, View } from "react-native";
import { colors } from "../utils/theme";

type BadgeProps = {
  name: string;
  iconLabel: string;
  detail: string;
  unlocked: boolean;
};

function Badge({ name, iconLabel, detail, unlocked }: BadgeProps) {
  return (
    <View style={[styles.card, unlocked ? styles.cardUnlocked : styles.cardLocked]}>
      <View style={[styles.iconWrap, unlocked ? styles.iconUnlocked : styles.iconLocked]}>
        <Text style={[styles.iconText, unlocked ? styles.iconTextUnlocked : styles.iconTextLocked]}>
          {iconLabel}
        </Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>

      <View style={[styles.pill, unlocked ? styles.pillUnlocked : styles.pillLocked]}>
        <Text style={[styles.pillText, unlocked ? styles.pillTextUnlocked : styles.pillTextLocked]}>
          {unlocked ? "Unlocked" : "Locked"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  cardUnlocked: {
    borderColor: "#ebc7a8",
    backgroundColor: "#fff7ed",
  },
  cardLocked: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconUnlocked: {
    backgroundColor: "#f5e8da",
  },
  iconLocked: {
    backgroundColor: "#eef2f7",
  },
  iconText: {
    fontSize: 14,
    fontWeight: "900",
  },
  iconTextUnlocked: {
    color: colors.primaryDark,
  },
  iconTextLocked: {
    color: colors.textMuted,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  detail: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillUnlocked: {
    backgroundColor: "#fde7cf",
  },
  pillLocked: {
    backgroundColor: "#f1f5f9",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  pillTextUnlocked: {
    color: colors.primaryDark,
  },
  pillTextLocked: {
    color: colors.textMuted,
  },
});

export default Badge;
