import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../lib/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { DEV_FORCE_SPLASH } from "../config/dev";
import CustomBackButton from "../components/CustomBackButton";

import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import PlantSelectionScreen from "../screens/PlantSelectionScreen";
import CategorySelectionScreen from "../screens/CategorySelectionScreen";
import CategoryMonthViewScreen from "../screens/CategoryMonthViewScreen";
import MeterDetailScreen from "../screens/MeterDetailScreen";
import AdminHubScreen from "../screens/AdminHubScreen";
import PlantManagementScreen from "../screens/PlantManagementScreen";
import UserManagementScreen from "../screens/UserManagementScreen";
import MeterManagementPlantScreen from "../screens/MeterManagementPlantScreen";
import MeterManagementCategoryScreen from "../screens/MeterManagementCategoryScreen";
import MeterManagementListScreen from "../screens/MeterManagementListScreen";
import QrScannerScreen from "../screens/QrScannerScreen";
import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, loading } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileIsError,
    error: profileErr,
  } = useProfile();
  console.log(
    "DEBUG nav — session:",
    !!session,
    "authLoading:",
    loading,
    "profileLoading:",
    profileLoading,
    "profile:",
    profile,
    "profileError:",
    profileIsError,
    profileErr,
  );

  if (DEV_FORCE_SPLASH || loading || (session && profileLoading)) {
    return <SplashScreen />;
  }

  const initialRouteName =
    profile?.role === "ADMIN" ? "Dashboard" : "PlantSelection";

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => <CustomBackButton />,
        }}
        initialRouteName={session ? initialRouteName : "Login"}
      >
        {!session ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PlantSelection"
              component={PlantSelectionScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="CategorySelection"
              component={CategorySelectionScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="CategoryMonthView"
              component={CategoryMonthViewScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="MeterDetail"
              component={MeterDetailScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="AdminHub"
              component={AdminHubScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="PlantManagement"
              component={PlantManagementScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="UserManagement"
              component={UserManagementScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="MeterManagementPlant"
              component={MeterManagementPlantScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="MeterManagementCategory"
              component={MeterManagementCategoryScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="MeterManagementList"
              component={MeterManagementListScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="QrScanner"
              component={QrScannerScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
