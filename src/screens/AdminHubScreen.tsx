import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";

const MENU_ITEMS = [
  { key: "PlantManagement", label: "Plants", icon: "business-outline" },
  { key: "UserManagement", label: "Users", icon: "people-outline" },
  { key: "MeterManagement", label: "Meters", icon: "speedometer-outline" },
] as const;

export default function AdminHubScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Settings</Text>
      <View style={styles.list}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.row}
            onPress={() => navigation.navigate(item.key)}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={colors.paper}
              />
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        ))}
      </View>
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
});
