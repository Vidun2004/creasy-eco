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

  // Distinguish "genuinely zero consumption" from "no prior-month reading to
  // compare against" — summing nulls as 0 would silently hide the latter.
  const metersWithData = meters?.filter((m) => m.consumption != null) ?? [];
  const hasAnyData = metersWithData.length > 0;
  const totalConsumption = metersWithData.reduce(
    (sum, m) => sum + (m.consumption ?? 0),
    0,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{CATEGORY_LABELS[category] ?? category}</Text>
      <Text style={styles.subHeader}>{plant.name}</Text>

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
          {hasAnyData
            ? `${totalConsumption.toLocaleString()} ${meters?.find((m) => m.consumption != null)?.unit ?? ""}`
            : "No data yet"}
        </Text>
        {!hasAnyData && meters && meters.length > 0 && (
          <Text style={styles.summarySub}>
            Needs a prior month's reading to calculate
          </Text>
        )}
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
              <View style={styles.meterIconBox}>
                <Ionicons
                  name="speedometer-outline"
                  size={18}
                  color={colors.paper}
                />
              </View>
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

      <TouchableOpacity
        style={styles.qrFab}
        onPress={() => navigation.navigate("QrScanner")}
      >
        <Ionicons name="qr-code-outline" size={24} color={colors.paper} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: { ...typography.h1 },
  subHeader: {
    ...typography.label,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
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
  summarySub: { color: colors.gray, fontSize: 12, marginTop: spacing.xs },
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
  meterIconBox: {
    width: 36,
    height: 36,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  meterName: { ...typography.h2, fontSize: 16 },
  meterSub: { ...typography.body, color: colors.gray, marginTop: 2 },
  errorText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  qrFab: {
    position: "absolute",
    bottom: spacing.xxxl,
    left: spacing.lg,
    backgroundColor: colors.moss,
    width: 48,
    height: 48,
    borderRadius: radius.none,
    alignItems: "center",
    justifyContent: "center",
  },
});
