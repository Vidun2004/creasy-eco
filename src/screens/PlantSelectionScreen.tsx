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
import { usePlants } from "../hooks/usePlants";
import { useProfile } from "../hooks/useProfile";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PlantSelectionScreen({ navigation }: any) {
  const { data: plants, isLoading, isError } = usePlants();
  const { data: profile } = useProfile();

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load plants. Pull to retry soon.
        </Text>
      </View>
    );
  }

  if (!plants || plants.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          No plants assigned to your account yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Plant</Text>
      <FlatList
        data={plants}
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

      {profile?.role === "USER" && (
        <TouchableOpacity
          style={styles.logoutFab}
          onPress={() => supabase.auth.signOut()}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.paper} />
        </TouchableOpacity>
      )}
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.paper,
  },
  errorText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
  },
});
