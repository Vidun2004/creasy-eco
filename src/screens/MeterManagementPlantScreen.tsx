import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";
import { usePlants } from "../hooks/usePlants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MeterManagementPlantScreen({ navigation }: any) {
  const { data: plants, isLoading } = usePlants();

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Plant</Text>
      <Text style={styles.subHeader}>Choose a plant to manage its meters</Text>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate("MeterManagementCategory", { plant: item })
            }
          >
            <View style={styles.iconBox}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbImage}
                />
              ) : (
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={colors.paper}
                />
              )}
            </View>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No plants yet — add one in Plant Management first.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: { ...typography.h1 },
  subHeader: {
    ...typography.label,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.none,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.grayLight,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    overflow: "hidden",
  },
  thumbImage: { width: 40, height: 40 },
  rowTitle: { ...typography.h2, fontSize: 16, flex: 1 },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
