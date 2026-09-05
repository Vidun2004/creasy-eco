import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";
import { useCategorySummary } from "../hooks/useCategorySummary";
import LoadingSpinner from "../components/LoadingSpinner";

const CATEGORY_LABELS: Record<string, string> = {
  WATER: "Water",
  ENERGY: "Energy",
  WASTE: "Waste",
  SOLAR_GENERATION: "Solar Generation",
};

export default function CategoryMonthViewScreen({ route, navigation }: any) {
  const { plant, category } = route.params;
  const [monthDate, setMonthDate] = useState(new Date());

  const {
    data: meters,
    isLoading,
    isError,
  } = useCategorySummary(plant.id, category, monthDate);

  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const isCurrentMonth =
    monthDate.getFullYear() === new Date().getFullYear() &&
    monthDate.getMonth() === new Date().getMonth();

  function shiftMonth(delta: number) {
    setMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  }

  const totalConsumption =
    meters?.reduce((sum, m) => sum + (m.consumption ?? 0), 0) ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{CATEGORY_LABELS[category] ?? category}</Text>

      <View style={styles.monthNav}>
        <TouchableOpacity
          onPress={() => shiftMonth(-1)}
          style={styles.monthArrow}
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={() => shiftMonth(1)}
          style={styles.monthArrow}
          disabled={isCurrentMonth}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isCurrentMonth ? colors.border : colors.ink}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total consumption</Text>
        <Text style={styles.summaryValue}>
          {totalConsumption.toLocaleString()} {meters?.[0]?.unit ?? ""}
        </Text>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <Text style={styles.errorText}>
          Couldn't load meters for this month.
        </Text>
      ) : (
        <FlatList
          data={meters}
          keyExtractor={(item) => item.meter_id}
          contentContainerStyle={{ paddingTop: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.meterRow}
              onPress={() =>
                navigation.navigate("MeterDetail", {
                  meter: item,
                  plantId: plant.id,
                  category,
                  monthDate: monthDate.toISOString(),
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.meterName}>{item.meter_name}</Text>
                <Text style={styles.meterSub}>
                  {item.current_reading != null
                    ? `Latest: ${item.current_reading.toLocaleString()} ${item.unit}`
                    : "No reading this month"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.errorText}>
              No meters set up for this category yet.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: { ...typography.h1, marginBottom: spacing.md },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  monthArrow: { padding: spacing.xs },
  monthLabel: { ...typography.h2 },
  summaryCard: {
    backgroundColor: colors.ink,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  summaryLabel: { ...typography.label, color: colors.gray },
  summaryValue: {
    color: colors.paper,
    fontSize: 24,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  meterRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.none,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.grayLight,
  },
  meterName: { ...typography.h2, fontSize: 16 },
  meterSub: { ...typography.body, color: colors.gray, marginTop: 2 },
  errorText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
