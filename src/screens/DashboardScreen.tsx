import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { supabase } from "../lib/supabase";
import LoadingSpinner from "../components/LoadingSpinner";

const STAT_CONFIG = [
  {
    key: "total_plants",
    label: "Plants",
    icon: "business-outline",
    color: colors.moss,
  },
  {
    key: "total_meters",
    label: "Meters",
    icon: "speedometer-outline",
    color: colors.amber,
  },
  {
    key: "total_users",
    label: "Users",
    icon: "people-outline",
    color: colors.moss,
  },
  {
    key: "readings_this_month",
    label: "Readings this month",
    icon: "pulse-outline",
    color: colors.amber,
  },
] as const;

export default function DashboardScreen({ navigation }: any) {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={styles.header}>Dashboard</Text>
        <Text style={styles.subHeader}>Overview across all plants</Text>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <View style={styles.statsGrid}>
            {STAT_CONFIG.map((stat) => (
              <View key={stat.key} style={styles.statCard}>
                <View
                  style={[styles.statIconBox, { backgroundColor: stat.color }]}
                >
                  <Ionicons
                    name={stat.icon as any}
                    size={20}
                    color={colors.paper}
                  />
                </View>
                <Text style={styles.statValue}>{stats?.[stat.key] ?? 0}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate("PlantSelection")}
        >
          <View style={styles.actionIconBox}>
            <Ionicons name="business-outline" size={22} color={colors.paper} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionRowTitle}>Go to Plants</Text>
            <Text style={styles.actionRowSub}>
              Browse categories and log readings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate("AdminHub")}
        >
          <View
            style={[styles.actionIconBox, { backgroundColor: colors.amber }]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.paper} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionRowTitle}>Admin Settings</Text>
            <Text style={styles.actionRowSub}>
              Manage plants, users, and meters
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.logoutFab}
        onPress={() => supabase.auth.signOut()}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.paper} />
      </TouchableOpacity>
    </SafeAreaView>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.ink,
    padding: spacing.md,
    borderRadius: radius.none,
  },
  statIconBox: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: { color: colors.paper, fontSize: 28, fontWeight: "700" },
  statLabel: {
    color: colors.gray,
    fontSize: 12,
    marginTop: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.none,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.grayLight,
    marginBottom: spacing.sm,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    backgroundColor: colors.moss,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  actionRowTitle: { ...typography.h2, fontSize: 16 },
  actionRowSub: {
    ...typography.body,
    color: colors.gray,
    fontSize: 12,
    marginTop: 2,
  },
  logoutFab: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.ink,
    width: 48,
    height: 48,
    borderRadius: radius.none,
    alignItems: "center",
    justifyContent: "center",
  },
});
