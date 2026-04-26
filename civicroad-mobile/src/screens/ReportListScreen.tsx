import { useEffect, useState } from "react";
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
import ReportCard from "../components/ReportCard";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/AppNavigator";
import { AppTabParamList } from "../navigation/MainTabNavigator";
import { Report } from "../utils/types";
import { colors } from "../utils/theme";

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

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let active = true;

    async function syncReports() {
      try {
        setLoading(true);
        const response = await apiClient.get<Report[]>("/reports");

        if (!active) {
          return;
        }

        const ownReports = response.data.filter((report) => report.citizen_id === user?.id);
        setReports(ownReports);
      } catch (error: any) {
        if (active) {
          Alert.alert(
            "Unable to load reports",
            error.response?.data?.message || "Please make sure the local API is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    syncReports();

    return () => {
      active = false;
    };
  }, [isFocused, user?.id]);

  async function loadReports(showRefresh = false) {
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
        "Unable to load reports",
        error.response?.data?.message || "Please make sure the local API is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.stateText}>Loading your reports...</Text>
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
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyText}>
              Create your first report to send a photo and pin the issue on the map.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
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
    padding: 18,
    gap: 14,
    flexGrow: 1,
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
  emptyCard: {
    marginTop: 40,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 22,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});

export default ReportListScreen;
