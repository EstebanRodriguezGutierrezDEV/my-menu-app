import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

const { width } = Dimensions.get("window");

/* =======================
   NOTIFICACIONES
======================== */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAYS_BEFORE_EXPIRE = 3;

export default function Almacen() {
  const [selectedStorage, setSelectedStorage] = useState("nevera");
  const [showAddModal, setShowAddModal] = useState(false);
  const [alimentos, setAlimentos] = useState([]);

  const [newItem, setNewItem] = useState({
    name: "",
    expiryDate: "",
    quantity: "",
    storage: "nevera",
  });

  /* =======================
     PERMISOS
  ======================== */
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  /* =======================
     UTILIDADES
  ======================== */
  const getDaysLeft = (date) => {
    if (!date) return null;
    
    // Parse YYYY-MM-DD manually to create a local date at midnight
    // avoiding UTC interpretation of hyphenated string
    const parts = date.split("-");
    if (parts.length !== 3) return null;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
    const day = parseInt(parts[2], 10);
    
    const expiry = new Date(year, month, day);
    
    // Create today at midnight local time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /* =======================
     NOTIFICACIONES AUTO
  ======================== */
  const checkExpirations = async (items) => {
    for (const item of items) {
      const days = getDaysLeft(item.fecha_caducidad);
      if (days !== null && days <= DAYS_BEFORE_EXPIRE && !item.notificado) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "¡Atención! 🍎",
            body: `El alimento "${item.nombre}" se va a poner malo pronto (queda(n) ${days} día(s)).`,
          },
          trigger: null, // inmediatamenta
        });

        // Marcar como notificado para no repetir
        await supabase.from("alimentos").update({ notificado: true }).eq("id", item.id);
      }
    }
  };

  const getCardStyleByDays = (days) => {
    if (days === null) return styles.foodCard;
    if (days <= 3) return [styles.foodCard, styles.expiredRed];
    if (days <= 7) return [styles.foodCard, styles.expiredOrange];
    return styles.foodCard;
  };

  /* =======================
     FORMATO FECHA
  ======================== */
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const limited = cleaned.slice(0, 8);

    let formatted = limited;
    if (limited.length > 2) formatted = limited.slice(0, 2) + "/" + limited.slice(2);
    if (limited.length > 4) formatted = formatted.slice(0, 5) + "/" + limited.slice(4);

    return formatted;
  };

  /* =======================
     CARGAR ALIMENTOS
  ======================== */
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

  /* =======================
     GUARDAR
  ======================== */
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
      almacenamiento: selectedStorage,
      notificado: false,
    });

    setShowAddModal(false);
    setNewItem({ name: "", expiryDate: "", quantity: "", storage: selectedStorage });
    loadAlimentos();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>мумєηυ</Text>
      </View>

      <View style={styles.storageContainer}>
        {["nevera", "arcon", "despensa"].map((s) => (
          <Pressable key={s} style={styles.storageBox} onPress={() => setSelectedStorage(s)}>
            <Text style={[styles.storageTitle, selectedStorage === s && styles.selectedStorageText]}>
              {s === "nevera" ? "Nevera" : s === "arcon" ? "Arcón" : "Despensa"}
            </Text>
            {selectedStorage === s && <View style={styles.selectedIndicator} />}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>Añadir alimento</Text>
        </Pressable>

        {alimentos.map((item) => {
          const daysLeft = getDaysLeft(item.fecha_caducidad);

          return (
            <View key={item.id} style={getCardStyleByDays(daysLeft)}>
              <Text style={styles.foodName}>{item.nombre}</Text>
              <Text style={styles.foodMeta}>
                {item.cantidad || "Sin cantidad"} ·{" "}
                {daysLeft !== null ? `${daysLeft} día(s)` : "Sin fecha"}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre"
              value={newItem.name}
              onChangeText={(t) => setNewItem({ ...newItem, name: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="DD/MM/YYYY"
              value={newItem.expiryDate}
              onChangeText={(t) => setNewItem({ ...newItem, expiryDate: formatExpiryDate(t) })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Cantidad"
              value={newItem.quantity}
              onChangeText={(t) => setNewItem({ ...newItem, quantity: t })}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={addDetailedItem}>
                <Text style={{ color: "#fff" }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/* =======================
   ESTILOS
======================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  header: { backgroundColor: "#0078d4", paddingTop: 50, paddingBottom: 20, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },

  storageContainer: { flexDirection: "row", backgroundColor: "#fff" },
  storageBox: { flex: 1, alignItems: "center", paddingVertical: 16 },
  selectedIndicator: { height: 3, width: "100%", backgroundColor: "#2EC4B6", marginTop: 4 },
  storageTitle: { fontWeight: "600", color: "#333" },
  selectedStorageText: { color: "#2EC4B6" },

  content: { padding: 20 },

  addButton: {
    backgroundColor: "#2EC4B6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  addButtonText: { color: "#fff", fontWeight: "bold" },

  foodCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  expiredRed: {
    backgroundColor: "#ffe5e5",
    borderColor: "#ff4d4f",
  },

  expiredOrange: {
    backgroundColor: "#fff2e0",
    borderColor: "#ffa940",
  },

  foodName: { fontSize: 16, fontWeight: "bold" },
  foodMeta: { fontSize: 13, color: "#555", marginTop: 4 },

  modalOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: { backgroundColor: "#fff", width: "90%", borderRadius: 15, padding: 15 },

  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
  },

  modalActions: { flexDirection: "row", justifyContent: "space-between" },

  cancelButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    borderRadius: 8,
  },

  saveButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#0078d4",
    borderRadius: 8,
  },
});
