import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../utils/theme";

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
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline ? styles.inputMultiline : null, style]}
        {...props}
      />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputMultiline: {
    minHeight: 128,
    textAlignVertical: "top",
  },
  helper: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default Input;
