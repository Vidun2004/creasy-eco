import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import PlantSelectionScreen from '../screens/PlantSelectionScreen';
import CategorySelectionScreen from '../screens/CategorySelectionScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PlantSelection" component={PlantSelectionScreen} options={{ title: '' }} />
        <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
