import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "../utils/theme";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
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
  const isDanger = variant === "danger";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary
          ? styles.buttonSecondary
          : isDanger
            ? styles.buttonDanger
            : styles.buttonPrimary,
        pressed && !disabled && !loading ? styles.buttonPressed : null,
        disabled || loading ? styles.buttonDisabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isSecondary ? colors.text : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.label,
            isSecondary ? styles.labelSecondary : styles.labelPrimary,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  labelPrimary: {
    color: colors.white,
  },
  labelSecondary: {
    color: colors.text,
  },
});

export default Button;
