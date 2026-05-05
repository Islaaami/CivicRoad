import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import CreateReportScreen from "../screens/CreateReportScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportListScreen from "../screens/ReportListScreen";
import { colors, radii, shadows } from "../utils/theme";

export type AppTabParamList = {
  Reports: undefined;
  Create: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

function getTabIcon(
  routeName: keyof AppTabParamList,
  color: string,
  size: number,
  focused: boolean
) {
  if (routeName === "Create") {
    return <Ionicons color={color} name={focused ? "add-circle" : "add-circle-outline"} size={size} />;
  }

  if (routeName === "Profile") {
    return <Ionicons color={color} name={focused ? "person" : "person-outline"} size={size} />;
  }

  return <Ionicons color={color} name={focused ? "home" : "home-outline"} size={size} />;
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Reports"
      screenOptions={({ route }) => ({
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "800",
        },
        headerTintColor: colors.primaryDark,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 12 : 10,
          paddingHorizontal: 10,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          ...shadows.tabBar,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        tabBarItemStyle: {
          borderRadius: radii.md,
        },
        tabBarIcon: ({ color, size, focused }) =>
          getTabIcon(route.name, color, size, focused),
      })}
    >
      <Tab.Screen
        component={ReportListScreen}
        name="Reports"
        options={{
          title: "Mes signalements",
          tabBarLabel: "Signalements",
        }}
      />
      <Tab.Screen
        component={CreateReportScreen}
        name="Create"
        options={{
          title: "Créer signalement",
          tabBarLabel: "Créer",
        }}
      />
      <Tab.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          title: "Profil",
          tabBarLabel: "Profil",
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
