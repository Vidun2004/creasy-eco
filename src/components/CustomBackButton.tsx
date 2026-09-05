import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radius } from "../theme/tokens";

export default function CustomBackButton() {
  const navigation = useNavigation();

  // No screen to go back to (e.g. Users landing on PlantSelection as their
  // home screen) — render nothing rather than a dead-end button.
  if (!navigation.canGoBack()) return null;

  return (
    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
      <Ionicons name="chevron-back" size={20} color={colors.paper} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    backgroundColor: colors.ink,
    borderRadius: radius.none,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
});
