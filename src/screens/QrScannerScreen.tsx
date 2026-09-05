import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "../theme/tokens";
import { useLookupMeterByQr } from "../hooks/useLookupMeterByQr";
import LoadingSpinner from "../components/LoadingSpinner";

export default function QrScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lookupMeter = useLookupMeterByQr();

  if (!permission) {
    return <LoadingSpinner />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan meter QR codes.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.permissionCancel}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleScan({ data }: { data: string }) {
    if (scanned || lookupMeter.isPending) return;
    setScanned(true);

    lookupMeter.mutate(data, {
      onSuccess: (meter: any) => {
        navigation.replace("MeterDetail", {
          meter: {
            meter_id: meter.id,
            meter_name: meter.name,
            unit: meter.unit,
          },
          plantId: meter.plantId,
          category: meter.category,
          monthDate: new Date().toISOString(),
        });
      },
      onError: (err: any) => {
        Alert.alert("Scan failed", err.message, [
          { text: "Try again", onPress: () => setScanned(false) },
        ]);
      },
    });
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={24} color={colors.paper} />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Align the QR code within the frame</Text>
      </View>

      {lookupMeter.isPending && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink },
  closeButton: {
    position: "absolute",
    top: spacing.xxl,
    left: spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.none,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: colors.moss,
    backgroundColor: "transparent",
  },
  hint: {
    color: colors.paper,
    marginTop: spacing.lg,
    fontSize: 13,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.paper,
  },
  permissionText: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.moss,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.none,
  },
  permissionButtonText: { color: colors.paper, fontWeight: "700" },
  permissionCancel: { marginTop: spacing.lg },
  permissionCancelText: { color: colors.gray, fontWeight: "600" },
});
