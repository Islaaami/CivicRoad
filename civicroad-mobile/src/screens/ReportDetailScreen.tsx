import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient, { getAssetUrl } from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/AppNavigator";
import { formatDate, formatStatus } from "../utils/format";
import { Report } from "../utils/types";
import { colors, shadows } from "../utils/theme";

type Props = NativeStackScreenProps<AppStackParamList, "ReportDetail">;

function getStatusStyle(status: Report["status"]) {
  if (status === "in_progress") {
    return {
      backgroundColor: "#dbeafe",
      color: colors.inProgress,
    };
  }

  if (status === "resolved") {
    return {
      backgroundColor: "#dcfce7",
      color: colors.resolved,
    };
  }

  return {
    backgroundColor: "#fef3c7",
    color: colors.pending,
  };
}

function ReportDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { reportId } = route.params;

  const [report, setReport] = useState<Report | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function syncReport() {
      try {
        setLoading(true);
        const response = await apiClient.get<Report>(`/reports/${reportId}`);

        if (!active) {
          return;
        }

        setReport(response.data);
        setDraftTitle(response.data.title);
        setDraftDescription(response.data.description);
      } catch (error: any) {
        if (active) {
          Alert.alert(
            "Unable to load report",
            error.response?.data?.message || "Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void syncReport();

    return () => {
      active = false;
    };
  }, [reportId]);

  async function handleSaveReport() {
    if (!report) {
      return;
    }

    if (report.status !== "pending") {
      Alert.alert("Report locked", "Only pending reports can be edited.");
      return;
    }

    if (!draftTitle.trim() || !draftDescription.trim()) {
      Alert.alert("Missing details", "Title and description cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      await apiClient.patch<Report>(`/reports/${report.id}`, {
        title: draftTitle.trim(),
        description: draftDescription.trim(),
      });

      Alert.alert("Report updated", "Your report was updated successfully.", [
        {
          text: "Continue",
          onPress: () => navigation.navigate("MainTabs", { screen: "Reports" }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Unable to update report",
        error.response?.data?.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!report) {
      return;
    }

    if (report.status !== "pending") {
      Alert.alert("Report locked", "Only pending reports can be deleted.");
      return;
    }

    setDeleting(true);

    try {
      await apiClient.delete(`/reports/${report.id}`);

      Alert.alert("Report deleted", "The report was removed successfully.", [
        {
          text: "Continue",
          onPress: () => navigation.navigate("MainTabs", { screen: "Reports" }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Unable to delete report",
        error.response?.data?.message || "Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleDeletePress() {
    Alert.alert(
      "Delete report",
      "Are you sure you want to permanently delete this report?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void confirmDelete();
          },
        },
      ]
    );
  }

  if (loading || !report) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>Loading report details...</Text>
      </View>
    );
  }

  const imageUrl = getAssetUrl(report.image_url);
  const statusStyle = getStatusStyle(report.status);
  const canManageReport = report.citizen_id === user?.id;
  const isReportLocked = report.status === "in_progress" || report.status === "resolved";
  const canEditPendingReport = canManageReport && !isReportLocked;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>
              {formatStatus(report.status)}
            </Text>
          </View>

          {editing ? (
            <>
              <Input label="Title" onChangeText={setDraftTitle} value={draftTitle} />
              <Input
                label="Description"
                multiline
                onChangeText={setDraftDescription}
                value={draftDescription}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>{report.title}</Text>
              <Text style={styles.meta}>
                {report.category_name || "Uncategorized"} - {formatDate(report.created_at)}
              </Text>
              <Text style={styles.description}>{report.description}</Text>
            </>
          )}

          {canManageReport ? (
            <View style={styles.actionGroup}>
              {editing ? (
                <>
                  <Button
                    disabled={isReportLocked}
                    loading={saving}
                    onPress={handleSaveReport}
                    title="Save Changes"
                  />
                  <Button
                    onPress={() => {
                      setEditing(false);
                      setDraftTitle(report.title);
                      setDraftDescription(report.description);
                    }}
                    title="Cancel"
                    variant="secondary"
                  />
                </>
              ) : (
                <>
                  <Button
                    disabled={!canEditPendingReport}
                    onPress={() => setEditing(true)}
                    title="Edit Report"
                  />
                  <Button
                    disabled={!canEditPendingReport || deleting}
                    onPress={handleDeletePress}
                    title={deleting ? "Deleting..." : "Delete Report"}
                    variant="secondary"
                  />
                </>
              )}
              {isReportLocked ? (
                <Text style={styles.actionHint}>
                  Reports can only be edited or deleted while their status is pending.
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>No image attached</Text>
            <Text style={styles.placeholderText}>
              This report was submitted without a photo.
            </Text>
          </View>
        )}

        <View style={styles.mapCard}>
          <Text style={styles.mapTitle}>Reported location</Text>
          <MapView
            initialRegion={{
              latitude: Number(report.latitude),
              longitude: Number(report.longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            style={styles.map}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: Number(report.latitude),
                longitude: Number(report.longitude),
              }}
              title={report.title}
            />
          </MapView>
        </View>
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
    gap: 12,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...shadows.card,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  description: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 28,
    backgroundColor: "#e5e7eb",
  },
  placeholderCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 8,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fffaf3",
    padding: 16,
    gap: 6,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  mapCard: {
    gap: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    ...shadows.card,
  },
  mapTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  map: {
    height: 260,
    borderRadius: 22,
  },
  actionGroup: {
    gap: 10,
    marginTop: 6,
  },
  actionHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default ReportDetailScreen;
