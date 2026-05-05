import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CompositeScreenProps, useIsFocused } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import apiClient from "../api/client";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ReportCard from "../components/ReportCard";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/AppNavigator";
import { AppTabParamList } from "../navigation/MainTabNavigator";
import { colors, layout, radii, spacing, typography } from "../utils/theme";
import { Report } from "../utils/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "Reports">,
  NativeStackScreenProps<AppStackParamList>
>;

function ReportListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await apiClient.get<Report[]>("/reports");
        const ownReports = response.data.filter((report) => report.citizen_id === user?.id);
        setReports(ownReports);
      } catch (error: any) {
        Alert.alert(
          "Impossible de charger les signalements",
          error.response?.data?.message ||
            "Vérifiez que l'API locale est bien en cours d'exécution."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void loadReports();
  }, [isFocused, loadReports]);

  const pendingCount = reports.filter((report) => report.status === "pending").length;
  const inProgressCount = reports.filter((report) => report.status === "in_progress").length;
  const resolvedCount = reports.filter((report) => report.status === "resolved").length;

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateTitle}>Chargement des signalements</Text>
        <Text style={styles.stateText}>
          Nous récupérons vos derniers signalements et leurs mises à jour.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={reports}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <EmptyState
            action={
              <Button
                onPress={() => navigation.navigate("Create")}
                title="Créer un signalement"
              />
            }
            description="Ajoutez une photo, la localisation et envoyez l'incident directement à votre commune."
            title="Aucun signalement pour le moment"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Aperçu</Text>
              <Text style={styles.sectionText}>
                Statut des incidents signalés.
              </Text>
            </View>

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total des signalements</Text>
              <Text style={styles.totalValue}>{reports.length}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Text style={[styles.statusLabel, { color: colors.pending }]}>En attente</Text>
                </View>
                <Text style={styles.statusValue}>{pendingCount}</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Text style={[styles.statusLabel, { color: colors.inProgress }]}>En cours</Text>
                </View>
                <Text style={styles.statusValue}>{inProgressCount}</Text>
              </View>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <Text style={[styles.statusLabel, { color: colors.resolved }]}>Résolu</Text>
                </View>
                <Text style={styles.statusValue}>{resolvedCount}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text style={styles.recentTitle}>Liste des signalements</Text>
                <Text style={styles.recentText}>
                  Ouvrez une carte pour voir le détail complet du signalement.
                </Text>
              </View>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={() => loadReports(true)}
            refreshing={refreshing}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <ReportCard
            onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
            report={item}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: layout.screenPadding,
    gap: spacing.md,
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  headerStack: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  totalCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.xxs,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  totalValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  statusRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statusCard: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statusValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  sectionHeader: {
    marginTop: spacing.xs,
  },
  sectionCopy: {
    gap: spacing.xxs,
  },
  sectionTitle: {
    ...typography.title2,
  },
  sectionText: {
    ...typography.body,
  },
  recentTitle: {
    ...typography.title1,
  },
  recentText: {
    ...typography.body,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  stateTitle: {
    ...typography.title2,
  },
  stateText: {
    ...typography.body,
    textAlign: "center",
    maxWidth: 280,
  },
});

export default ReportListScreen;
