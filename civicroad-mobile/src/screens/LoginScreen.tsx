import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiBaseUrl } from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { AuthStackParamList } from "../navigation/AppNavigator";
import { colors, shadows } from "../utils/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleEmailChange(value: string) {
    setEmail(value);
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (error: any) {
      const isNetworkError = !error.response;
      setErrorMessage(
        error.response?.data?.message ||
          (isNetworkError
            ? `Unable to connect to the CivicRoad API at ${apiBaseUrl}. If you are using Expo Go on a phone, make sure the API is running on your computer and that both devices can reach that address.`
            : "Unable to connect to the CivicRoad API.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Citizen App</Text>
            </View>
            <Text style={styles.title}>Report street issues in a few taps.</Text>
            <Text style={styles.subtitle}>
              Sign in with the email and password you registered with.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Login</Text>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              label="Email"
              onChangeText={handleEmailChange}
              placeholder="citizen@city.local"
              value={email}
            />

            <Input
              autoCapitalize="none"
              autoCorrect={false}
              label="Password"
              onChangeText={handlePasswordChange}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Button loading={loading} onPress={handleLogin} title="Continue" />

            <Pressable onPress={() => navigation.navigate("Register")} style={styles.linkWrap}>
              <Text style={styles.linkText}>Don&apos;t have an account? Register</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 20,
    justifyContent: "center",
  },
  hero: {
    gap: 16,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#f5e8da",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  heroBadgeText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#fffaf3",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    gap: 16,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...shadows.card,
  },
  formTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  formText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  apiHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  linkWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  linkText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
  },
});

export default LoginScreen;
