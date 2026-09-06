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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";
import { useUsers } from "../hooks/useUsers";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUserRole,
  useUpdateUserPlants,
} from "../hooks/useUserMutations";
import { usePlants } from "../hooks/usePlants";
import LoadingSpinner from "../components/LoadingSpinner";

export default function UserManagementScreen() {
  const { data: users, isLoading } = useUsers();
  const { data: plants } = usePlants();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const updateRole = useUpdateUserRole();
  const updatePlants = useUpdateUserPlants();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewingDeletedUser, setViewingDeletedUser] = useState<any | null>(
    null,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [editRole, setEditRole] = useState<"ADMIN" | "USER">("USER");
  const [editPlantIds, setEditPlantIds] = useState<string[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  function openCreateModal() {
    setEmail("");
    setPassword("");
    setFullName("");
    setCreateModalVisible(true);
  }

  function handleCreate() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Email and password are required.");
      return;
    }
    createUser.mutate(
      { email, password, fullName },
      {
        onSuccess: () => setCreateModalVisible(false),
        onError: (err: any) => Alert.alert("Create failed", err.message),
      },
    );
  }

  function openEditModal(user: any) {
    if (user.isDeleted) {
      setViewingDeletedUser(user);
      return;
    }
    setEditingUser(user);
    setEditRole(user.role);
    setEditPlantIds(user.plants?.map((p: any) => p.plantId) ?? []);
  }

  function togglePlant(plantId: string) {
    setEditPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  }

  function handleSaveEdit() {
    if (!editingUser) return;

    if (editRole !== editingUser.role) {
      updateRole.mutate({ userId: editingUser.id, role: editRole });
    }
    updatePlants.mutate(
      { userId: editingUser.id, plantIds: editPlantIds },
      {
        onSuccess: () => setEditingUser(null),
        onError: (err: any) => Alert.alert("Save failed", err.message),
      },
    );
  }

  function openDeleteModal(user: any) {
    setDeleteTarget(user);
    setDeleteReason("");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (!deleteReason.trim()) {
      Alert.alert("Reason required", "Please provide a reason for the record.");
      return;
    }

    deleteUser.mutate(
      { userId: deleteTarget.id, reason: deleteReason.trim() },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          setEditingUser(null);
        },
        onError: (err: any) => Alert.alert("Delete failed", err.message),
      },
    );
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Users</Text>
          <Text style={styles.subHeader}>{users?.length ?? 0} total</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={20} color={colors.paper} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, item.isDeleted && styles.rowDeleted]}
            onPress={() => openEditModal(item)}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: item.isDeleted
                    ? colors.gray
                    : item.role === "ADMIN"
                      ? colors.amber
                      : colors.ink,
                },
              ]}
            >
              <Ionicons
                name={
                  item.isDeleted
                    ? "person-remove-outline"
                    : item.role === "ADMIN"
                      ? "shield-checkmark-outline"
                      : "person-outline"
                }
                size={20}
                color={colors.paper}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {item.fullName || item.email}
                {item.isDeleted ? "  ·  Deleted" : ""}
              </Text>
              <Text style={styles.rowSub}>
                {item.isDeleted
                  ? `Removed ${new Date(item.deletedAt).toLocaleDateString()}`
                  : `${item.email} · ${item.role} · ${item.plants?.length ?? 0} plant(s)`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.gray} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No users yet — tap + to create one.
          </Text>
        }
      />

      {/* Create modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>New User</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCreateModalVisible(false)}
                disabled={createUser.isPending}
              >
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full name (optional)</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={colors.gray}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={colors.gray}
            />

            <Text style={styles.label}>Temporary password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.gray}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
                disabled={createUser.isPending}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreate}
                disabled={createUser.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {createUser.isPending ? "Creating…" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit modal (active users only) */}
      <Modal visible={!!editingUser} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{editingUser?.email}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditingUser(null)}
              >
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleRow}>
              {(["USER", "ADMIN"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleButton,
                    editRole === r && styles.roleButtonActive,
                  ]}
                  onPress={() => setEditRole(r)}
                >
                  <Text
                    style={
                      editRole === r ? styles.roleTextActive : styles.roleText
                    }
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Assigned plants</Text>
            <ScrollView style={styles.plantScroll}>
              {plants?.map((plant: any) => {
                const selected = editPlantIds.includes(plant.id);
                return (
                  <TouchableOpacity
                    key={plant.id}
                    style={styles.plantCheckRow}
                    onPress={() => togglePlant(plant.id)}
                  >
                    <Ionicons
                      name={selected ? "checkbox" : "square-outline"}
                      size={20}
                      color={selected ? colors.moss : colors.gray}
                    />
                    <Text style={styles.plantCheckLabel}>{plant.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={() => openDeleteModal(editingUser)}
              >
                <Text style={styles.saveButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={updateRole.isPending || updatePlants.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {updateRole.isPending || updatePlants.isPending
                    ? "Saving…"
                    : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Deleted-user read-only view */}
      <Modal visible={!!viewingDeletedUser} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{viewingDeletedUser?.email}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setViewingDeletedUser(null)}
              >
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.deletedNotice}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={colors.gray}
              />
              <Text style={styles.deletedNoticeText}>
                This account has been removed and cannot be restored. Their
                reading history and plant records remain intact for audit
                purposes.
              </Text>
            </View>

            <Text style={styles.label}>Removed on</Text>
            <Text style={styles.readOnlyValue}>
              {viewingDeletedUser?.deletedAt
                ? new Date(viewingDeletedUser.deletedAt).toLocaleString()
                : "—"}
            </Text>

            <Text style={styles.label}>Reason</Text>
            <Text style={styles.readOnlyValue}>
              {viewingDeletedUser?.deletionReason || "No reason provided"}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation with required reason */}
      <Modal visible={!!deleteTarget} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Delete User</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDeleteTarget(null)}
                disabled={deleteUser.isPending}
              >
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.warningText}>
              {deleteTarget?.email} will lose access permanently and cannot be
              restored. Their history stays on record.
            </Text>

            <Text style={styles.label}>Reason (required)</Text>
            <TextInput
              style={styles.input}
              value={deleteReason}
              onChangeText={setDeleteReason}
              placeholder="e.g. No longer with the company"
              placeholderTextColor={colors.gray}
              autoFocus
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteTarget(null)}
                disabled={deleteUser.isPending}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={confirmDelete}
                disabled={deleteUser.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {deleteUser.isPending ? "Deleting…" : "Confirm Delete"}
                </Text>
              </TouchableOpacity>
            </View>
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
  header: { ...typography.h1 },
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
  },
  rowDeleted: { opacity: 0.6 },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowTitle: { ...typography.h2, fontSize: 16 },
  rowSub: {
    ...typography.body,
    color: colors.gray,
    marginTop: 2,
    fontSize: 12,
  },
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
  modalCard: {
    backgroundColor: colors.paper,
    padding: spacing.lg,
    maxHeight: "85%",
  },
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
  roleRow: { flexDirection: "row", gap: spacing.sm },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.grayLight,
  },
  roleButtonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleText: { color: colors.ink, fontWeight: "600" },
  roleTextActive: { color: colors.paper, fontWeight: "700" },
  plantScroll: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  plantCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  plantCheckLabel: { ...typography.body },
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
  deleteModalButton: { backgroundColor: colors.amber },
  saveButtonText: { color: colors.paper, fontWeight: "700" },
  deletedNotice: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.grayLight,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  deletedNoticeText: {
    flex: 1,
    color: colors.gray,
    fontSize: 12,
    lineHeight: 18,
  },
  readOnlyValue: { ...typography.body, marginBottom: spacing.sm },
  warningText: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.md,
  },
});
