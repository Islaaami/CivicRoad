import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { addNotificationReceivedListener } from "./src/services/notificationService";
import { colors } from "./src/utils/theme";

export default function App() {
  useEffect(() => {
    const removeListener = addNotificationReceivedListener((notification) => {
      Alert.alert(
        notification.request.content.title || "CivicRoad",
        notification.request.content.body || "You received a new report update."
      );
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
