import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";

const MENU_ITEMS = [
  {
    key: "PlantManagement",
    label: "Plants",
    sub: "Create, edit, or remove plant locations",
    icon: "business-outline",
    color: colors.moss,
  },
  {
    key: "UserManagement",
    label: "Users",
    sub: "Manage accounts, roles, and plant access",
    icon: "people-outline",
    color: colors.amber,
  },
  {
    key: "MeterManagementPlant",
    label: "Meters",
    sub: "Add meters and generate QR codes",
    icon: "speedometer-outline",
    color: colors.moss,
  },
] as const;

export default function AdminHubScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Settings</Text>
      <Text style={styles.subHeader}>
        Manage your organization's core settings
      </Text>
      <View style={styles.list}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.row}
            onPress={() => navigation.navigate(item.key)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={colors.paper}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
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
    marginBottom: spacing.lg,
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
  rowLabel: { ...typography.h2, fontSize: 16 },
  rowSub: {
    ...typography.body,
    color: colors.gray,
    fontSize: 12,
    marginTop: 2,
  },
});
