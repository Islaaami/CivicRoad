import { Ionicons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import CreateReportScreen from "../screens/CreateReportScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportListScreen from "../screens/ReportListScreen";
import { colors } from "../utils/theme";

export type AppDrawerParamList = {
  Reports: undefined;
  CreateReport: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

function getDrawerIcon(routeName: keyof AppDrawerParamList, color: string, size: number) {
  if (routeName === "CreateReport") {
    return <Ionicons color={color} name="add-circle-outline" size={size} />;
  }

  if (routeName === "Profile") {
    return <Ionicons color={color} name="person-circle-outline" size={size} />;
  }

  return <Ionicons color={color} name="list-outline" size={size} />;
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brandCard}>
        <Text style={styles.brandEyebrow}>Citizen App</Text>
        <Text style={styles.brandTitle}>CivicRoad</Text>
        <Text style={styles.brandText}>
          Track your reports, submit new issues, and follow status updates in one place.
        </Text>
        <View style={styles.userPill}>
          <Ionicons color={colors.primaryDark} name="mail-outline" size={16} />
          <Text numberOfLines={1} style={styles.userPillText}>
            {user?.email || "citizen@city.local"}
          </Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <DrawerItemList {...props} />
      </View>

      <DrawerItem
        icon={({ color, size }) => <Ionicons color={color} name="log-out-outline" size={size} />}
        inactiveTintColor={colors.danger}
        label="Logout"
        labelStyle={styles.logoutLabel}
        onPress={logout}
        style={styles.logoutItem}
      />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        drawerStyle: {
          backgroundColor: "#fbf7f0",
          width: 296,
        },
        drawerActiveBackgroundColor: "#f5e8da",
        drawerActiveTintColor: colors.primaryDark,
        drawerInactiveTintColor: colors.textMuted,
        drawerItemStyle: {
          borderRadius: 18,
          marginHorizontal: 12,
          marginVertical: 4,
        },
        drawerLabelStyle: {
          marginLeft: -16,
          fontSize: 15,
          fontWeight: "700",
        },
        drawerIcon: ({ color, size }) => getDrawerIcon(route.name, color, size),
      })}
    >
      <Drawer.Screen
        component={ReportListScreen}
        name="Reports"
        options={{
          title: "My Reports",
        }}
      />
      <Drawer.Screen
        component={CreateReportScreen}
        name="CreateReport"
        options={{
          title: "Create Report",
        }}
      />
      <Drawer.Screen
        component={ProfileScreen}
        name="Profile"
        options={{
          title: "Profile",
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerScrollContent: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  brandCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 10,
  },
  brandEyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  brandTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  brandText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  userPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#f5e8da",
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  userPillText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  menuSection: {
    gap: 4,
    paddingBottom: 8,
  },
  logoutItem: {
    marginTop: "auto",
    marginHorizontal: 12,
    borderRadius: 18,
  },
  logoutLabel: {
    marginLeft: -16,
    fontSize: 15,
    fontWeight: "800",
  },
});

export default DrawerNavigator;
