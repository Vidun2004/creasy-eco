import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";
import { useReadingHistory } from "../hooks/useReadingHistory";
import { useAddReading } from "../hooks/useAddReading";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MeterDetailScreen({ route }: any) {
  const { meter, plantId, category, monthDate: monthDateParam } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  const monthDate = monthDateParam ? new Date(monthDateParam) : new Date();
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    1,
  );
  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const now = new Date();
  const isCurrentMonth =
    monthDate.getFullYear() === now.getFullYear() &&
    monthDate.getMonth() === now.getMonth();

  const {
    data: history,
    isLoading,
    isError,
  } = useReadingHistory(meter.meter_id, monthStart, monthEnd);
  const addReading = useAddReading();

  const latest = history?.[0];

  function computeRecordedAt(): Date {
    if (isCurrentMonth) return new Date(); // real "right now" timestamp

    // Backdated month: keep the current day-of-month/time-of-day, but shift
    // into the viewed month, clamped so it can't overflow into the next one
    // (e.g. viewing Feb while it's the 30th today).
    const daysInTargetMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
    ).getDate();
    const day = Math.min(now.getDate(), daysInTargetMonth);
    return new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    );
  }

  function handleSubmit() {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      Alert.alert("Invalid value", "Please enter a valid number.");
      return;
    }

    const recordedAt = computeRecordedAt();

    addReading.mutate(
      {
        meterId: meter.meter_id,
        plantId,
        category,
        value: numericValue,
        note,
        recordedAt: recordedAt.toISOString(),
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setValue("");
          setNote("");
        },
        onError: (err: any) => {
          Alert.alert("Failed to save reading", err.message ?? "Unknown error");
        },
      },
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{meter.meter_name}</Text>
      <Text style={styles.subHeader}>
        {category} · {meter.unit} · Viewing {monthLabel}
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Latest reading ({monthLabel})</Text>
        <Text style={styles.summaryValue}>
          {latest
            ? `${latest.value.toLocaleString()} ${meter.unit}`
            : "No readings this month"}
        </Text>
        {latest && (
          <Text style={styles.summarySub}>
            {new Date(latest.recordedAt).toLocaleString()}
          </Text>
        )}
      </View>

      <View style={styles.historyHeaderRow}>
        <Text style={styles.historyHeader}>Reading history — {monthLabel}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={colors.paper} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <Text style={styles.errorText}>Couldn't load reading history.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <View>
                <Text style={styles.historyValue}>
                  {item.value.toLocaleString()} {meter.unit}
                </Text>
                {item.note ? (
                  <Text style={styles.historyNote}>{item.note}</Text>
                ) : null}
              </View>
              <Text style={styles.historyDate}>
                {new Date(item.recordedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.errorText}>
              No readings logged for {monthLabel}.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Reading</Text>
            {!isCurrentMonth && (
              <Text style={styles.backdatedNotice}>
                This will be recorded for {monthLabel}, not today.
              </Text>
            )}

            <Text style={styles.label}>Cumulative reading ({meter.unit})</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.gray}
              autoFocus
            />

            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="e.g. meter replaced"
              placeholderTextColor={colors.gray}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={addReading.isPending}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
                disabled={addReading.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {addReading.isPending ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  summaryCard: {
    backgroundColor: colors.ink,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryLabel: { ...typography.label, color: colors.gray },
  summaryValue: {
    color: colors.paper,
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  summarySub: { color: colors.gray, fontSize: 12, marginTop: spacing.xs },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  historyHeader: { ...typography.h2, fontSize: 16 },
  addButton: {
    backgroundColor: colors.moss,
    width: 36,
    height: 36,
    borderRadius: radius.none,
    alignItems: "center",
    justifyContent: "center",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.grayLight,
  },
  historyValue: { ...typography.body, fontWeight: "700" },
  historyNote: { color: colors.gray, fontSize: 12, marginTop: 2 },
  historyDate: { color: colors.gray, fontSize: 12 },
  errorText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  backdatedNotice: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.paper,
    padding: spacing.lg,
  },
  modalTitle: { ...typography.h2, marginBottom: spacing.md },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.none,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.grayLight,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radius.none,
  },
  cancelButton: {
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.ink, fontWeight: "600" },
  saveButton: { backgroundColor: colors.moss },
  saveButtonText: { color: colors.paper, fontWeight: "700" },
});
