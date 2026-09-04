import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";

const CATEGORIES = [
  { key: "WATER", label: "Water", icon: "water-outline" },
  { key: "ENERGY", label: "Energy", icon: "flash-outline" },
  { key: "WASTE", label: "Waste", icon: "trash-outline" },
  { key: "SOLAR_GENERATION", label: "Solar Generation", icon: "sunny-outline" },
] as const;

export default function CategorySelectionScreen({ route, navigation }: any) {
  const plant = route.params?.plant;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{plant?.name ?? "Plant"}</Text>

      <View style={styles.list}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.key} style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name={cat.icon as any} size={22} color={colors.paper} />
            </View>
            <Text style={styles.rowLabel}>{cat.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.settingsFab}>
        <Ionicons name="settings-outline" size={24} color={colors.paper} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: { ...typography.h1, marginBottom: spacing.xl },
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
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowLabel: { ...typography.h2, flex: 1 },
  settingsFab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.amber,
    width: 48,
    height: 48,
    borderRadius: radius.none,
    alignItems: "center",
    justifyContent: "center",
  },
});
