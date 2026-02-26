import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
} from "react-native";
import { theme } from "../styles/theme";
import InputPersonalizado from "./InputPersonalizado";

export default function ModalMoverAlmacen({
  visible,
  datosArticulo,
  alCerrar,
  alConfirmar,
}) {
  const [cantidad, setCantidad] = useState("");
  const [caducidad, setCaducidad] = useState("");
  const [almacen, setAlmacen] = useState("nevera");

  const configAlmacen = {
    nevera: { icon: "❄️", label: "Nevera", color: "#4DA6FF" },
    arcon: { icon: "🧊", label: "Arcón", color: "#A8D8FF" },
    despensa: { icon: "🥫", label: "Despensa", color: "#F0A500" },
  };

  const formatearFecha = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    let f = cleaned;
    if (cleaned.length > 2) f = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 4) f = f.slice(0, 5) + "/" + cleaned.slice(4);
    return f;
  };

  // Al abrir el modal debemos resetear el formulario cada vez
  React.useEffect(() => {
    if (visible) {
      setCantidad("");
      setCaducidad("");
      setAlmacen("nevera");
    }
  }, [visible]);

  const manejarConfirmacion = () => {
    if (!cantidad.trim() || !caducidad.trim()) {
      Alert.alert("Campos incompletos", "Introduce la cantidad y caducidad.");
      return;
    }
    // Pasamos de vuelta los datos introducidos
    alConfirmar({ cantidad, caducidad, almacen });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={alCerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={alCerrar} />

        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>Mover a Almacén 📦</Text>
          {datosArticulo?.name && (
            <Text style={styles.itemNameText}>
              Producto:{" "}
              <Text style={{ fontWeight: "800" }}>{datosArticulo.name}</Text>
            </Text>
          )}

          <Text style={styles.modalLabel}>CANTIDAD O PESO *</Text>
          <InputPersonalizado
            icon="⚖️"
            placeholder="Ej: 2 unidades, 500g..."
            value={cantidad}
            onChangeText={setCantidad}
          />

          <Text style={styles.modalLabel}>FECHA DE CADUCIDAD *</Text>
          <InputPersonalizado
            icon="📅"
            placeholder="DD/MM/AAAA"
            value={caducidad}
            onChangeText={(t) => setCaducidad(formatearFecha(t))}
            keyboardType="numeric"
          />

          <Text style={styles.modalLabel}>¿DÓNDE GUARDARLO?</Text>
          <View style={styles.modalStorageRow}>
            {Object.entries(configAlmacen).map(([key, conf]) => {
              const sel = almacen === key;
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.modalStorageBtn,
                    sel && {
                      backgroundColor: conf.color + "33",
                      borderColor: conf.color,
                    },
                  ]}
                  onPress={() => setAlmacen(key)}
                >
                  <Text style={styles.modalStorageBtnIcon}>{conf.icon}</Text>
                  <Text
                    style={[
                      styles.modalStorageBtnLabel,
                      sel && { color: conf.color, fontWeight: "800" },
                    ]}
                  >
                    {conf.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={alCerrar}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={manejarConfirmacion}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: theme.colors.overlay,
  },
  modalCard: {
    backgroundColor: "rgba(13,30,53,1)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  itemNameText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  modalLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  modalStorageRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  modalStorageBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  modalStorageBtnIcon: { fontSize: 22 },
  modalStorageBtnLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  cancelBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  saveBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
