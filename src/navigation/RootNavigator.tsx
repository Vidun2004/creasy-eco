import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../lib/AuthContext";
import { DEV_FORCE_SPLASH } from "../config/dev";

import LoginScreen from "../screens/LoginScreen";
import PlantSelectionScreen from "../screens/PlantSelectionScreen";
import CategorySelectionScreen from "../screens/CategorySelectionScreen";
import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (DEV_FORCE_SPLASH || loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        {!session ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
