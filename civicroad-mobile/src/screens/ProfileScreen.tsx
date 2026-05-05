import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CompositeScreenProps, useIsFocused } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient, { getAssetUrl } from "../api/client";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/AppNavigator";
import { AppTabParamList } from "../navigation/MainTabNavigator";
import { Report, User } from "../utils/types";
import { colors, shadows } from "../utils/theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "Profile">,
  NativeStackScreenProps<AppStackParamList>
>;

function getInitials(user: User | null) {
  if (!user) {
    return "CR";
  }

  const first = user.first_name?.charAt(0) || "";
  const last = user.last_name?.charAt(0) || "";
  const fallback = user.email?.charAt(0) || "C";

  return `${first}${last}`.trim().toUpperCase() || fallback.toUpperCase();
}

function ProfileScreen({ navigation }: Props) {
  const { user, refreshUser, logout } = useAuth();
  const isFocused = useIsFocused();

  const [profileUser, setProfileUser] = useState<User | null>(user);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserId = user?.id;

    if (!isFocused || !currentUserId) {
      return;
    }

    let active = true;

    async function loadProfileData() {
      try {
        setLoading(true);

        const [refreshedUser, reportsResponse] = await Promise.all([
          refreshUser(currentUserId),
          apiClient.get<Report[]>("/reports"),
        ]);

        if (!active) {
          return;
        }

        const ownReports = reportsResponse.data.filter((report) => report.citizen_id === currentUserId);

        setProfileUser(refreshedUser);
        setReports(ownReports);
      } catch (error: any) {
        if (active) {
          Alert.alert(
            "Impossible de charger le profil",
            error.response?.data?.message || "Veuillez réessayer."
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
  }, [isFocused, refreshUser, user?.id]);

  const totalReports = reports.length;
  const resolvedReports = reports.filter((report) => report.status === "resolved").length;

  const badges = useMemo(
    () => [
      {
        name: "Premier signalement",
        iconLabel: "1X",
        detail:
          totalReports >= 1
            ? "Vous avez envoyé votre premier signalement."
            : "Envoyez 1 signalement pour débloquer ce badge.",
        unlocked: totalReports >= 1,
      },
      {
        name: "Contributeur",
        iconLabel: "5X",
        detail:
          totalReports >= 5
            ? "Vous avez envoyé 5 signalements ou plus."
            : `${totalReports}/5 signalements envoyés pour le moment.`,
        unlocked: totalReports >= 5,
      },
      {
        name: "Héros citoyen",
        iconLabel: "10R",
        detail:
          resolvedReports >= 10
            ? "Dix de vos signalements ont déjà été résolus."
            : `${resolvedReports}/10 signalements résolus pour le moment.`,
        unlocked: resolvedReports >= 10,
      },
    ],
    [resolvedReports, totalReports]
  );

  function handleLogoutPress() {
    Alert.alert("Déconnexion", "Voulez-vous vraiment fermer votre session actuelle ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  const displayedUser = profileUser || user;
  const profileImageUrl = getAssetUrl(displayedUser?.profile_image_url);

  if (!displayedUser || loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>Chargement de votre profil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(displayedUser)}</Text>
            )}
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              {displayedUser.first_name || "Citoyen"} {displayedUser.last_name || ""}
            </Text>
            <Text style={styles.heroEmail}>{displayedUser.email}</Text>
            <Text style={styles.heroBio}>
              {displayedUser.bio?.trim() ||
                "Ajoutez une courte biographie pour personnaliser votre profil CivicRoad."}
            </Text>
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

        <Button onPress={() => navigation.navigate("EditProfile")} title="Modifier le profil" />

        <Button onPress={handleLogoutPress} title="Déconnexion" variant="secondary" />
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
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
  detailList: {
    gap: 14,
  },
  detailItem: {
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySurface,
    padding: 14,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
});

export default ProfileScreen;
