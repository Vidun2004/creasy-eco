import { useRef, useState } from "react";
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
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { colors, typography, spacing, radius } from "../theme/tokens";
import {
  useMeters,
  useCreateMeter,
  useUpdateMeter,
  useDeleteMeter,
} from "../hooks/useMeterMutations";
import LoadingSpinner from "../components/LoadingSpinner";

export default function MeterManagementListScreen({ route }: any) {
  const { plant, category } = route.params;
  const { data: meters, isLoading } = useMeters(plant.id, category);
  const createMeter = useCreateMeter();
  const updateMeter = useUpdateMeter();
  const deleteMeter = useDeleteMeter();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");

  const [qrMeter, setQrMeter] = useState<any | null>(null);
  const viewShotRef = useRef<any>(null);

  function openCreateModal() {
    setEditingId(null);
    setName("");
    setUnit("");
    setEditModalVisible(true);
  }

  function openEditModal(meter: any) {
    setEditingId(meter.id);
    setName(meter.name);
    setUnit(meter.unit);
    setEditModalVisible(true);
  }

  function handleSave() {
    if (!name.trim() || !unit.trim()) {
      Alert.alert("Missing fields", "Name and unit are required.");
      return;
    }

    const mutation = editingId
      ? updateMeter.mutateAsync({ id: editingId, name, unit })
      : createMeter.mutateAsync({ plantId: plant.id, category, name, unit });

    mutation
      .then(() => setEditModalVisible(false))
      .catch((err: any) => Alert.alert("Save failed", err.message));
  }

  function handleDelete(meter: any) {
    Alert.alert(
      "Delete meter",
      `Delete "${meter.name}"? This cannot be undone, and will fail if it still has readings logged.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteMeter.mutate(
              { id: meter.id, plantId: plant.id, category },
              {
                onError: (err: any) =>
                  Alert.alert("Delete failed", err.message),
              },
            ),
        },
      ],
    );
  }

  async function handleShareQr() {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (err: any) {
      Alert.alert("Share failed", err.message);
    }
  }

  const isSaving = createMeter.isPending || updateMeter.isPending;

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.header}>{plant.name}</Text>
          <Text style={styles.subHeader}>
            {category} · {meters?.length ?? 0} meter(s)
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={20} color={colors.paper} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={meters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.rowContent}
              onPress={() => openEditModal(item)}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name="speedometer-outline"
                  size={20}
                  color={colors.paper}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSub}>{item.unit}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setQrMeter(item)}
              style={styles.iconButton}
            >
              <Ionicons name="qr-code-outline" size={20} color={colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.iconButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.amber} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No meters yet in this category.</Text>
        }
      />

      {/* Create/Edit modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Meter" : "New Meter"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
              >
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Main Water Meter"
              placeholderTextColor={colors.gray}
              autoFocus
            />

            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g. m3, kWh, L, Kg"
              placeholderTextColor={colors.gray}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* QR view/export modal */}
      <Modal visible={!!qrMeter} animationType="fade" transparent>
        <View style={styles.qrBackdrop}>
          <View style={styles.qrCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{qrMeter?.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setQrMeter(null)}
              >
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
              <View style={styles.qrWrapper}>
                {qrMeter && <QRCode value={qrMeter.qrCode} size={200} />}
              </View>
            </ViewShot>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareQr}
            >
              <Ionicons name="share-outline" size={18} color={colors.paper} />
              <Text style={styles.saveButtonText}>Share / Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  header: { ...typography.h1, fontSize: 20 },
  subHeader: { ...typography.label, marginTop: spacing.xs },
  addButton: {
    backgroundColor: colors.moss,
    width: 40,
    height: 40,
    borderRadius: radius.none,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.grayLight,
    gap: spacing.sm,
  },
  rowContent: { flex: 1, flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowTitle: { ...typography.h2, fontSize: 16 },
  rowSub: { ...typography.body, color: colors.gray, marginTop: 2 },
  iconButton: { padding: spacing.xs },
  emptyText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: { backgroundColor: colors.paper, padding: spacing.lg },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h2, flex: 1, marginRight: spacing.sm },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
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
  qrBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCard: { backgroundColor: colors.paper, padding: spacing.lg, width: "85%" },
  qrWrapper: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.paper,
  },
  shareButton: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.moss,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
});
