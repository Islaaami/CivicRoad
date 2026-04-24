import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "../utils/theme";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
};

function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: ButtonProps) {
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.buttonSecondary : styles.buttonPrimary,
        pressed && !disabled && !loading ? styles.buttonPressed : null,
        disabled || loading ? styles.buttonDisabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.text : "#ffffff"} />
      ) : (
        <Text style={[styles.label, isSecondary ? styles.labelSecondary : styles.labelPrimary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  labelPrimary: {
    color: "#ffffff",
  },
  labelSecondary: {
    color: colors.text,
  },
});

export default Button;
