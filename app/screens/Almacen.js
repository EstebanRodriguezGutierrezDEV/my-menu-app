import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

const { width } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAYS_BEFORE_EXPIRE = 3;

// Config de cada almacén
const STORAGE_CONFIG = {
  nevera: { label: "Nevera", icon: "❄️", color: "#4DA6FF" },
  arcon: { label: "Arcón", icon: "🧊", color: "#2ECC71" },
  despensa: { label: "Despensa", icon: "🏠", color: "#F39C12" },
};

export default function Almacen() {
  const [selectedStorage, setSelectedStorage] = useState("nevera");
  const [showAddModal, setShowAddModal] = useState(false);
  const [alimentos, setAlimentos] = useState([]);
  const [nameFocused, setNameFocused] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);
  const [qtyFocused, setQtyFocused] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    expiryDate: "",
    quantity: "",
    storage: "nevera",
  });

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // ── Utilidades ─────────────────────────────────────────────
  const getDaysLeft = (date) => {
    if (!date) return null;
    const parts = date.split("-");
    if (parts.length !== 3) return null;
    const expiry = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const getExpiryStyle = (days) => {
    if (days === null) return null;
    if (days <= 0)
      return {
        border: "rgba(231,76,60,0.8)",
        bg: "rgba(231,76,60,0.12)",
        label: "Caducado",
        color: "#E74C3C",
      };
    if (days <= 3)
      return {
        border: "rgba(231,76,60,0.5)",
        bg: "rgba(231,76,60,0.08)",
        label: `${days}d`,
        color: "#E74C3C",
      };
    if (days <= 7)
      return {
        border: "rgba(243,156,18,0.5)",
        bg: "rgba(243,156,18,0.08)",
        label: `${days}d`,
        color: "#F39C12",
      };
    return {
      border: "rgba(255,255,255,0.07)",
      bg: "transparent",
      label: `${days}d`,
      color: "rgba(255,255,255,0.4)",
    };
  };

  const checkExpirations = async (items) => {
    for (const item of items) {
      const days = getDaysLeft(item.fecha_caducidad);
      if (days !== null && days <= DAYS_BEFORE_EXPIRE && !item.notificado) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "¡Atención! 🍎",
            body: `"${item.nombre}" caduca en ${days} día(s).`,
          },
          trigger: null,
        });
        await supabase
          .from("alimentos")
          .update({ notificado: true })
          .eq("id", item.id);
      }
    }
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    let f = cleaned;
    if (cleaned.length > 2) f = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 4) f = f.slice(0, 5) + "/" + cleaned.slice(4);
    return f;
  };

  // ── Datos ──────────────────────────────────────────────────
  const loadAlimentos = async () => {
    const { data, error } = await supabase
      .from("alimentos")
      .select("*")
      .eq("almacenamiento", selectedStorage)
      .order("fecha_caducidad", { ascending: true });
    if (error) return;
    setAlimentos(data);
    checkExpirations(data);
  };

  useEffect(() => {
    loadAlimentos();
  }, [selectedStorage]);

  const addDetailedItem = async () => {
    if (!newItem.name.trim()) return;
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    const formattedDate = newItem.expiryDate
      ? newItem.expiryDate.split("/").reverse().join("-")
      : null;

    await supabase.from("alimentos").insert({
      user_id: data.user.id,
      nombre: newItem.name,
      cantidad: newItem.quantity,
      fecha_caducidad: formattedDate,
      almacenamiento: newItem.storage || selectedStorage,
      notificado: false,
    });

    setShowAddModal(false);
    setNewItem({
      name: "",
      expiryDate: "",
      quantity: "",
      storage: selectedStorage,
    });
    loadAlimentos();
  };

  const deleteFood = async (id) => {
    Alert.alert(
      "Eliminar alimento",
      "¿Estás seguro de que quieres eliminar este alimento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase
              .from("alimentos")
              .delete()
              .eq("id", id)
              .eq("user_id", user.id);
            if (error) Alert.alert("Error", error.message);
            else loadAlimentos();
          },
        },
      ],
    );
  };

  const cfg = STORAGE_CONFIG[selectedStorage];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>ALMACÉN</Text>
          <Text style={styles.headerTitle}>
            {cfg.icon} {cfg.label}
          </Text>
        </View>
        <View style={[styles.headerBadge, { borderColor: cfg.color + "55" }]}>
          <Text style={[styles.headerBadgeText, { color: cfg.color }]}>
            {alimentos.length}
          </Text>
          <Text style={styles.headerBadgeSub}>items</Text>
        </View>
      </View>

      {/* ── TABS DE ALMACÉN ── */}
      <View style={styles.tabs}>
        {Object.entries(STORAGE_CONFIG).map(([key, conf]) => {
          const active = selectedStorage === key;
          return (
            <Pressable
              key={key}
              style={[
                styles.tab,
                active && {
                  borderBottomColor: conf.color,
                  borderBottomWidth: 3,
                },
              ]}
              onPress={() => setSelectedStorage(key)}
            >
              <Text style={styles.tabIcon}>{conf.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  active && { color: conf.color, fontWeight: "800" },
                ]}
              >
                {conf.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── LISTA ── */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Botón añadir */}
        <Pressable
          style={[styles.addButton, { shadowColor: cfg.color }]}
          onPress={() => {
            setNewItem({
              name: "",
              expiryDate: "",
              quantity: "",
              storage: selectedStorage,
            });
            setShowAddModal(true);
          }}
        >
          <Text style={styles.addButtonPlus}>+</Text>
          <Text style={styles.addButtonText}>Añadir alimento</Text>
        </Pressable>

        {/* Cards de alimentos */}
        {alimentos.map((item) => {
          const daysLeft = getDaysLeft(item.fecha_caducidad);
          const exp = getExpiryStyle(daysLeft);

          return (
            <View
              key={item.id}
              style={[
                styles.foodCard,
                exp && { borderColor: exp.border, backgroundColor: "#111D30" },
              ]}
            >
              {/* Icono de almacén */}
              <View
                style={[
                  styles.foodIconBadge,
                  { backgroundColor: cfg.color + "22" },
                ]}
              >
                <Text style={styles.foodIcon}>{cfg.icon}</Text>
              </View>

              {/* Info */}
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.nombre}</Text>
                <Text style={styles.foodMeta}>
                  {item.cantidad ? `📦 ${item.cantidad}` : "Sin cantidad"}
                </Text>
              </View>

              {/* Badge de caducidad */}
              {exp && (
                <View
                  style={[
                    styles.expiryBadge,
                    { backgroundColor: exp.color + "22" },
                  ]}
                >
                  <Text style={[styles.expiryLabel, { color: exp.color }]}>
                    {exp.label}
                  </Text>
                </View>
              )}

              {/* Borrar */}
              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  pressed && styles.deleteBtnPressed,
                ]}
                onPress={() => deleteFood(item.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </Pressable>
            </View>
          );
        })}

        {/* Estado vacío */}
        {alimentos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{cfg.icon}</Text>
            <Text style={styles.emptyTitle}>{cfg.label} vacía</Text>
            <Text style={styles.emptySubtext}>
              Añade tu primer alimento con el botón de arriba
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── MODAL AÑADIR ── */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowAddModal(false)}
          />

          <View style={styles.modalCard}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Nuevo alimento</Text>

            {/* Campo nombre */}
            <Text style={styles.modalLabel}>Nombre *</Text>
            <View
              style={[
                styles.modalInputWrapper,
                nameFocused && styles.modalInputFocused,
              ]}
            >
              <Text style={styles.modalInputIcon}>🥗</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej. Leche"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newItem.name}
                onChangeText={(t) => setNewItem({ ...newItem, name: t })}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>

            {/* Campo fecha */}
            <Text style={styles.modalLabel}>Fecha de caducidad</Text>
            <View
              style={[
                styles.modalInputWrapper,
                dateFocused && styles.modalInputFocused,
              ]}
            >
              <Text style={styles.modalInputIcon}>📅</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newItem.expiryDate}
                onChangeText={(t) =>
                  setNewItem({ ...newItem, expiryDate: formatExpiryDate(t) })
                }
                keyboardType="numeric"
                onFocus={() => setDateFocused(true)}
                onBlur={() => setDateFocused(false)}
              />
            </View>

            {/* Campo cantidad */}
            <Text style={styles.modalLabel}>Cantidad</Text>
            <View
              style={[
                styles.modalInputWrapper,
                qtyFocused && styles.modalInputFocused,
              ]}
            >
              <Text style={styles.modalInputIcon}>📦</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej. 1 litro"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newItem.quantity}
                onChangeText={(t) => setNewItem({ ...newItem, quantity: t })}
                onFocus={() => setQtyFocused(true)}
                onBlur={() => setQtyFocused(false)}
              />
            </View>

            {/* Selector de almacén */}
            <Text style={styles.modalLabel}>¿Dónde guardarlo?</Text>
            <View style={styles.modalStorageRow}>
              {Object.entries(STORAGE_CONFIG).map(([key, conf]) => {
                const sel = newItem.storage === key;
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
                    onPress={() => setNewItem({ ...newItem, storage: key })}
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
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={addDetailedItem}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1628" },

  header: {
    backgroundColor: "#0A1628",
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  headerEyebrow: {
    color: "#4DA6FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  headerBadge: {
    backgroundColor: "rgba(77,166,255,0.2)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  headerBadgeText: { fontWeight: "900", fontSize: 18 },
  headerBadgeSub: {
    color: "#4DA6FF",
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.7,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#0D1E35",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    gap: 2,
  },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.4)" },

  content: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 16 },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0078D4",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  addButtonPlus: { color: "#fff", fontSize: 22, fontWeight: "700" },
  addButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111D30",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  foodIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  foodIcon: { fontSize: 20 },
  foodInfo: { flex: 1 },
  foodName: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  foodMeta: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  expiryBadge: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  expiryLabel: { fontSize: 12, fontWeight: "800" },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(231,76,60,0.12)",
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnPressed: { opacity: 0.7, transform: [{ scale: 0.93 }] },
  deleteIcon: { fontSize: 18 },

  emptyState: { alignItems: "center", paddingTop: 50, gap: 10 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalCard: {
    backgroundColor: "#0D1E35",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 20,
  },
  modalLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 13,
    height: 50,
    marginBottom: 14,
  },
  modalInputFocused: {
    borderColor: "#4DA6FF",
    backgroundColor: "rgba(77,166,255,0.08)",
  },
  modalInputIcon: { fontSize: 17, marginRight: 10 },
  modalInput: { flex: 1, color: "#fff", fontSize: 15, height: "100%" },
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
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.5,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cancelBtnText: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "700",
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#0078D4",
    shadowColor: "#0078D4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
