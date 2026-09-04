import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";
import { supabase } from "../lib/supabase";

const MOCK_PLANTS = [
  { id: "1", name: "Sterling Steels" },
  { id: "2", name: "Lanka Special Steels" },
  { id: "3", name: "Home Care Gonawala" },
  { id: "4", name: "Laxapana" },
  { id: "5", name: "Home Care Homagama" },
  { id: "6", name: "CDL" },
];

export default function PlantSelectionScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Plant</Text>
      <FlatList
        data={MOCK_PLANTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("CategorySelection", { plant: item })
            }
          >
            <View style={styles.thumb} />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.logoutFab}
        onPress={() => supabase.auth.signOut()}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.paper} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: { ...typography.h1, marginBottom: spacing.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.none,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  thumb: {
    width: 40,
    height: 40,
    backgroundColor: colors.moss,
    marginRight: spacing.md,
  },
  cardTitle: { ...typography.h2 },
  logoutFab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.ink,
    width: 48,
    height: 48,
    borderRadius: radius.none,
    alignItems: "center",
    justifyContent: "center",
  },
});
