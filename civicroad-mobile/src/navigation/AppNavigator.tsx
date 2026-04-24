import {
  DefaultTheme,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ReportDetailScreen from "../screens/ReportDetailScreen";
import { colors } from "../utils/theme";
import DrawerNavigator, { AppDrawerParamList } from "./DrawerNavigator";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  MainDrawer: NavigatorScreenParams<AppDrawerParamList> | undefined;
  ReportDetail: { reportId: number };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const sharedScreenOptions = {
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTitleStyle: {
    color: colors.text,
    fontWeight: "800" as const,
  },
  headerTintColor: colors.text,
  contentStyle: {
    backgroundColor: colors.background,
  },
};

function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer theme={navigationTheme}>
      {!user ? (
        <AuthStack.Navigator screenOptions={sharedScreenOptions}>
          <AuthStack.Screen
            component={LoginScreen}
            name="Login"
            options={{
              headerShown: false,
            }}
          />
          <AuthStack.Screen
            component={RegisterScreen}
            name="Register"
            options={{
              headerShown: false,
            }}
          />
        </AuthStack.Navigator>
      ) : (
        <AppStack.Navigator screenOptions={sharedScreenOptions}>
          <AppStack.Screen
            component={DrawerNavigator}
            name="MainDrawer"
            options={{
              headerShown: false,
            }}
          />
          <AppStack.Screen
            component={ReportDetailScreen}
            name="ReportDetail"
            options={{
              title: "Report Detail",
            }}
          />
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default AppNavigator;
