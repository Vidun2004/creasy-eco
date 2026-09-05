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
import { usePlants } from "../hooks/usePlants";
import {
  useCreatePlant,
  useUpdatePlant,
  useDeletePlant,
} from "../hooks/usePlantMutations";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PlantManagementScreen() {
  const { data: plants, isLoading } = usePlants();
  const createPlant = useCreatePlant();
  const updatePlant = useUpdatePlant();
  const deletePlant = useDeletePlant();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function openCreateModal() {
    setEditingId(null);
    setName("");
    setDescription("");
    setModalVisible(true);
  }

  function openEditModal(plant: any) {
    setEditingId(plant.id);
    setName(plant.name);
    setDescription(plant.description ?? "");
    setModalVisible(true);
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a plant name.");
      return;
    }

    const mutation = editingId
      ? updatePlant.mutateAsync({ id: editingId, name, description })
      : createPlant.mutateAsync({ name, description });

    mutation
      .then(() => setModalVisible(false))
      .catch((err: any) =>
        Alert.alert("Save failed", err.message ?? "Unknown error"),
      );
  }

  function handleDelete(plant: any) {
    Alert.alert(
      "Delete plant",
      `Delete "${plant.name}"? This cannot be undone, and will fail if it still has meters attached.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deletePlant.mutate(plant.id, {
              onError: (err: any) =>
                Alert.alert("Delete failed", err.message ?? "Unknown error"),
            }),
        },
      ],
    );
  }

  const isSaving = createPlant.isPending || updatePlant.isPending;

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Plants</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={20} color={colors.paper} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.rowTitle}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.rowSub}>{item.description}</Text>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.amber} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Plant" : "New Plant"}
            </Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sterling Steels"
              placeholderTextColor={colors.gray}
              autoFocus
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Short description"
              placeholderTextColor={colors.gray}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
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
  header: { ...typography.h1 },
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
  },
  rowTitle: { ...typography.h2, fontSize: 16 },
  rowSub: { ...typography.body, color: colors.gray, marginTop: 2 },
  deleteButton: { padding: spacing.sm },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: { backgroundColor: colors.paper, padding: spacing.lg },
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
