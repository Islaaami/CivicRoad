import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radii, spacing, typography } from "../utils/theme";

type InputProps = TextInputProps & {
  label: string;
  helperText?: string;
};

function Input({ label, helperText, multiline, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, multiline ? styles.inputMultiline : null, style]}
        {...props}
      />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodyStrong,
  },
  input: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  inputMultiline: {
    minHeight: 128,
    textAlignVertical: "top",
  },
  helper: {
    ...typography.caption,
  },
});

export default Input;
