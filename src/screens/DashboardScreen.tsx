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

export default function DashboardScreen({ navigation }: any) {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Text style={styles.header}>Dashboard</Text>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.total_plants ?? 0}</Text>
              <Text style={styles.statLabel}>Plants</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.total_meters ?? 0}</Text>
              <Text style={styles.statLabel}>Meters</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.total_users ?? 0}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats?.readings_this_month ?? 0}
              </Text>
              <Text style={styles.statLabel}>Readings this month</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.plantsRow}
          onPress={() => navigation.navigate("PlantSelection")}
        >
          <View style={styles.iconBox}>
            <Ionicons name="business-outline" size={22} color={colors.paper} />
          </View>
          <Text style={styles.plantsRowLabel}>Go to Plants</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.logoutFab}
        onPress={() => supabase.auth.signOut()}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.paper} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsFab}
        onPress={() => navigation.navigate("AdminHub")}
      >
        <Ionicons name="settings-outline" size={24} color={colors.paper} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: { ...typography.h1, marginBottom: spacing.lg },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.ink,
    padding: spacing.md,
    borderRadius: radius.none,
  },
  statValue: { color: colors.paper, fontSize: 28, fontWeight: "700" },
  statLabel: {
    color: colors.gray,
    fontSize: 12,
    marginTop: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  plantsRow: {
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
    backgroundColor: colors.moss,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  plantsRowLabel: { ...typography.h2, flex: 1 },
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
