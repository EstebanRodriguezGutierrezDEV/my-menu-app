import React from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { theme } from "../styles/theme";
import InputPersonalizado from "./InputPersonalizado";

export default function ModalAgregarAlimento({
  visible,
  alCerrar,
  nuevoAlimento,
  setNuevoAlimento,
  alGuardar,
  configAlmacen,
}) {
  const formatDate = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    let f = cleaned;
    if (cleaned.length > 2) f = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 4) f = f.slice(0, 5) + "/" + cleaned.slice(4);
    return f;
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
          <Text style={styles.modalTitle}>Nuevo alimento</Text>

          {/* Campo nombre */}
          <Text style={styles.modalLabel}>Nombre *</Text>
          <InputPersonalizado
            icon="🥗"
            placeholder="Ej. Leche"
            value={nuevoAlimento.nombre}
            onChangeText={(t) =>
              setNuevoAlimento({ ...nuevoAlimento, nombre: t })
            }
          />

          {/* Campo fecha */}
          <Text style={styles.modalLabel}>Fecha de caducidad</Text>
          <InputPersonalizado
            icon="📅"
            placeholder="DD/MM/YYYY"
            value={nuevoAlimento.fechaCaducidad}
            onChangeText={(t) =>
              setNuevoAlimento({
                ...nuevoAlimento,
                fechaCaducidad: formatDate(t),
              })
            }
            keyboardType="numeric"
          />

          {/* Campo cantidad */}
          <Text style={styles.modalLabel}>Cantidad</Text>
          <InputPersonalizado
            icon="📦"
            placeholder="Ej. 1 litro"
            value={nuevoAlimento.cantidad}
            onChangeText={(t) =>
              setNuevoAlimento({ ...nuevoAlimento, cantidad: t })
            }
          />

          {/* Selector de almacén */}
          <Text style={styles.modalLabel}>¿Dónde guardarlo?</Text>
          <View style={styles.modalStorageRow}>
            {Object.entries(configAlmacen).map(([key, conf]) => {
              const sel = nuevoAlimento.almacen === key;
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
                  onPress={() =>
                    setNuevoAlimento({ ...nuevoAlimento, almacen: key })
                  }
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

          {/* Acciones */}
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={alCerrar}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={alGuardar}>
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
  modalActions: { flexDirection: "row", gap: 12 },
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
