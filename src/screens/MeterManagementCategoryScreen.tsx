import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";

const CATEGORIES = [
  { key: "WATER", label: "Water", icon: "water-outline", color: colors.moss },
  {
    key: "ENERGY",
    label: "Energy",
    icon: "flash-outline",
    color: colors.amber,
  },
  { key: "WASTE", label: "Waste", icon: "trash-outline", color: colors.moss },
  {
    key: "SOLAR_GENERATION",
    label: "Solar Generation",
    icon: "sunny-outline",
    color: colors.amber,
  },
] as const;

export default function MeterManagementCategoryScreen({
  route,
  navigation,
}: any) {
  const plant = route.params?.plant;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{plant?.name}</Text>
      <Text style={styles.subHeader}>
        Select a category to manage its meters
      </Text>
      <View style={styles.list}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={styles.row}
            onPress={() =>
              navigation.navigate("MeterManagementList", {
                plant,
                category: cat.key,
              })
            }
          >
            <View style={[styles.iconBox, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon as any} size={22} color={colors.paper} />
            </View>
            <Text style={styles.rowLabel}>{cat.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: { ...typography.h1 },
  subHeader: {
    ...typography.label,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  list: { gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.none,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.grayLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowLabel: { ...typography.h2, flex: 1 },
});
