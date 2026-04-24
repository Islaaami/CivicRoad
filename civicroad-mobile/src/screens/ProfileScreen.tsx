import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../api/client";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { Report, User } from "../utils/types";
import { colors, shadows } from "../utils/theme";

function getInitials(user: User | null) {
  if (!user) {
    return "CR";
  }

  const first = user.first_name?.charAt(0) || "";
  const last = user.last_name?.charAt(0) || "";
  const fallback = user.email?.charAt(0) || "C";

  return `${first}${last}`.trim().toUpperCase() || fallback.toUpperCase();
}

function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const isFocused = useIsFocused();

  const [profileUser, setProfileUser] = useState<User | null>(user);
  const [reports, setReports] = useState<Report[]>([]);
  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentUserId = user?.id;

    if (!isFocused || !currentUserId) {
      return;
    }

    let active = true;

    async function loadProfileData() {
      try {
        setLoading(true);

        const [refreshedUserResponse, reportsResponse] = await Promise.all([
          apiClient.get<User>(`/users/${currentUserId}`),
          apiClient.get<Report[]>("/reports"),
        ]);

        if (!active) {
          return;
        }

        const refreshedUser = refreshedUserResponse.data;
        const ownReports = reportsResponse.data.filter(
          (report) => report.citizen_id === currentUserId
        );

        setProfileUser(refreshedUser);
        setReports(ownReports);
        setFormValues({
          first_name: refreshedUser.first_name || "",
          last_name: refreshedUser.last_name || "",
          email: refreshedUser.email || "",
          bio: refreshedUser.bio || "",
        });
      } catch (error: any) {
        if (active) {
          Alert.alert(
            "Unable to load profile",
            error.response?.data?.message || "Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfileData();

    return () => {
      active = false;
    };
  }, [isFocused, user?.id]);

  const totalReports = reports.length;
  const resolvedReports = reports.filter((report) => report.status === "resolved").length;
  const pendingReports = reports.filter((report) => report.status !== "resolved").length;

  const badges = useMemo(
    () => [
      {
        name: "First Report",
        iconLabel: "1X",
        detail:
          totalReports >= 1
            ? "You submitted your first community report."
            : "Submit 1 report to unlock this badge.",
        unlocked: totalReports >= 1,
      },
      {
        name: "Contributor",
        iconLabel: "5X",
        detail:
          totalReports >= 5
            ? "You have submitted 5 or more reports."
            : `${totalReports}/5 reports submitted so far.`,
        unlocked: totalReports >= 5,
      },
      {
        name: "Community Hero",
        iconLabel: "10R",
        detail:
          resolvedReports >= 10
            ? "Ten of your reports have already been resolved."
            : `${resolvedReports}/10 resolved reports so far.`,
        unlocked: resolvedReports >= 10,
      },
    ],
    [resolvedReports, totalReports]
  );

  async function handleSaveProfile() {
    if (!user?.id) {
      return;
    }

    if (!formValues.first_name.trim() || !formValues.last_name.trim() || !formValues.email.trim()) {
      Alert.alert("Missing details", "First name, last name, and email are required.");
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateUser({
        first_name: formValues.first_name.trim(),
        last_name: formValues.last_name.trim(),
        email: formValues.email.trim(),
        bio: formValues.bio.trim(),
      });

      setProfileUser(updatedUser);
      Alert.alert("Profile updated", "Your profile details have been saved.");
    } catch (error: any) {
      Alert.alert(
        "Unable to save profile",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const displayedUser = profileUser || user;

  if (!displayedUser || loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayedUser)}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              {displayedUser.first_name || "Citizen"} {displayedUser.last_name || ""}
            </Text>
            <Text style={styles.heroEmail}>{displayedUser.email}</Text>
            <Text style={styles.heroBio}>
              {formValues.bio?.trim() || "Add a short bio to personalize your CivicRoad profile."}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalReports}</Text>
            <Text style={styles.summaryLabel}>Total reports</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{resolvedReports}</Text>
            <Text style={styles.summaryLabel}>Resolved</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{pendingReports}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgeList}>
            {badges.map((badge) => (
              <Badge
                key={badge.name}
                detail={badge.detail}
                iconLabel={badge.iconLabel}
                name={badge.name}
                unlocked={badge.unlocked}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit profile</Text>
          <Input
            label="First name"
            onChangeText={(value) =>
              setFormValues((currentValues) => ({ ...currentValues, first_name: value }))
            }
            value={formValues.first_name}
          />
          <Input
            label="Last name"
            onChangeText={(value) =>
              setFormValues((currentValues) => ({ ...currentValues, last_name: value }))
            }
            value={formValues.last_name}
          />
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) =>
              setFormValues((currentValues) => ({ ...currentValues, email: value }))
            }
            value={formValues.email}
          />
          <Input
            label="Bio"
            multiline
            onChangeText={(value) =>
              setFormValues((currentValues) => ({ ...currentValues, bio: value }))
            }
            placeholder="Tell your city something about you."
            value={formValues.bio}
          />
          <Button loading={saving} onPress={handleSaveProfile} title="Save Profile" />
        </View>

        <Button onPress={logout} title="Log Out" variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    gap: 16,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background,
    padding: 24,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  heroCard: {
    flexDirection: "row",
    gap: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    ...shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5e8da",
  },
  avatarText: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: "900",
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  heroEmail: {
    color: colors.textMuted,
    fontSize: 14,
  },
  heroBio: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fffaf3",
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  section: {
    gap: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  badgeList: {
    gap: 12,
  },
});

export default ProfileScreen;
