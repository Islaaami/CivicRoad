import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CreateReportScreen from "../screens/CreateReportScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportListScreen from "../screens/ReportListScreen";
import { colors } from "../utils/theme";

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
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "800",
        },
        headerTintColor: colors.text,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 74,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopColor: colors.border,
          backgroundColor: "#fffaf3",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, size, focused }) =>
          getTabIcon(route.name, color, size, focused),
      })}
    >
      <Tab.Screen
        component={ReportListScreen}
        name="Reports"
        options={{
          title: "My Reports",
          tabBarLabel: "Reports",
        }}
      />
      <Tab.Screen
        component={CreateReportScreen}
        name="Create"
        options={{
          title: "Create Report",
          tabBarLabel: "Create",
        }}
      />
      <Tab.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
