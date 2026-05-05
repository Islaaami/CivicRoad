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
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { AuthStackParamList } from "../navigation/AppNavigator";
import { colors, shadows } from "../utils/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field: keyof typeof formValues, value: string) {
    if (errorMessage) {
      setErrorMessage("");
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleRegister() {
    const { first_name, last_name, email, password } = formValues;

    if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Veuillez compléter tous les champs avant l'inscription.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await register({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      navigation.navigate("Login");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Impossible de créer votre compte."
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
              <Text style={styles.heroBadgeText}>Inscription</Text>
            </View>
            <Text style={styles.title}>Rejoignez le réseau de signalement de votre ville.</Text>
            <Text style={styles.subtitle}>
              Créez un compte citoyen pour envoyer des signalements, suivre les mises à jour et voir vos badges de contribution.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Input
              label="Prénom"
              onChangeText={(value) => updateField("first_name", value)}
              placeholder="Ahmed"
              value={formValues.first_name}
            />
            <Input
              label="Nom"
              onChangeText={(value) => updateField("last_name", value)}
              placeholder="Alami"
              value={formValues.last_name}
            />
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              label="Email"
              onChangeText={(value) => updateField("email", value)}
              placeholder="citoyen@civicroad.ma"
              value={formValues.email}
            />
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              label="Mot de passe"
              onChangeText={(value) => updateField("password", value)}
              placeholder="Créez un mot de passe"
              secureTextEntry
              value={formValues.password}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Button loading={loading} onPress={handleRegister} title="Inscription" />

            <Pressable onPress={() => navigation.navigate("Login")} style={styles.linkWrap}>
              <Text style={styles.linkText}>{"J'ai déjà un compte"}</Text>
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
    backgroundColor: colors.primarySoft,
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
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
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

export default RegisterScreen;
