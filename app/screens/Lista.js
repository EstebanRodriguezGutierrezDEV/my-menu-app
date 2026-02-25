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
  Animated,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

export default function Lista({ navigation }) {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);

  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, []),
  );

  const fetchItems = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("lista_compra")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      Alert.alert("Error cargando lista", error.message);
    } else {
      setItems(data);
    }
  };

  const addItem = async () => {
    if (text.trim() === "") return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("lista_compra").insert({
      user_id: user.id,
      name: text.trim(),
      is_checked: false,
    });

    if (error) {
      Alert.alert("Error", "No se pudo añadir el alimento");
    } else {
      setText("");
      fetchItems();
    }
  };

  const deleteItem = async (id) => {
    Alert.alert(
      "Eliminar producto",
      "¿Estás seguro de que quieres eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              Alert.alert("Error", "No estás autenticado");
              return;
            }

            const { error, count } = await supabase
              .from("lista_compra")
              .delete({ count: "exact" })
              .eq("id", id)
              .eq("user_id", user.id);

            if (error) {
              Alert.alert("Error", "No se pudo eliminar: " + error.message);
            } else {
              fetchItems();
            }
          },
        },
      ],
    );
  };

  const generatePDF = async () => {
    if (items.length === 0) {
      Alert.alert("Lista vacía", "No hay elementos para generar el PDF.");
      return;
    }

    const fecha = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              background: #F0F4F8;
              padding: 36px 32px;
              color: #1a1a2e;
            }
            .header {
              background: linear-gradient(135deg, #0057A8 0%, #0078D4 55%, #4DA6FF 100%);
              border-radius: 20px;
              padding: 28px 32px;
              margin-bottom: 28px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .header-left { display: flex; align-items: center; gap: 16px; }
            .header-icon { font-size: 44px; line-height: 1; }
            .header-text h1 { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 4px; letter-spacing: -0.3px; }
            .header-text p { font-size: 13px; color: rgba(255,255,255,0.72); text-transform: capitalize; }
            .header-badge {
              background: rgba(255,255,255,0.18);
              border: 2px solid rgba(255,255,255,0.3);
              border-radius: 14px;
              padding: 10px 18px;
              text-align: center;
            }
            .badge-num { font-size: 26px; font-weight: 900; color: #fff; line-height: 1; }
            .badge-label { font-size: 10px; color: rgba(255,255,255,0.72); font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
            .intro {
              background: #fff;
              border-radius: 12px;
              padding: 14px 18px;
              margin-bottom: 22px;
              display: flex;
              align-items: center;
              gap: 12px;
              border-left: 4px solid #0078D4;
            }
            .intro p { font-size: 13px; color: #555; line-height: 1.5; }
            .intro strong { color: #0078D4; }
            .table {
              background: #fff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 2px 16px rgba(0,0,0,0.07);
              margin-bottom: 28px;
            }
            .table-head {
              background: #0078D4;
              display: grid;
              grid-template-columns: 44px 1fr 72px;
              padding: 12px 18px;
              gap: 12px;
            }
            .table-head span { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.82); text-transform: uppercase; letter-spacing: 1px; }
            .table-head .center { text-align: center; }
            .row {
              display: grid;
              grid-template-columns: 44px 1fr 72px;
              padding: 13px 18px;
              gap: 12px;
              align-items: center;
              border-bottom: 1px solid #f0f0f0;
            }
            .row:last-child { border-bottom: none; }
            .row.alt { background: #F5F9FF; }
            .row-num {
              width: 26px; height: 26px;
              background: #EBF4FF;
              border-radius: 7px;
              display: flex; align-items: center; justify-content: center;
              font-weight: 800; font-size: 12px; color: #0078D4;
            }
            .row-name { font-size: 15px; font-weight: 600; color: #1a1a2e; }
            .cb-wrap { display: flex; align-items: center; justify-content: center; }
            .cb { width: 22px; height: 22px; border: 2px solid #0078D4; border-radius: 6px; background: #fff; }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #dde4ef;
            }
            .footer-brand { font-size: 17px; font-weight: 900; color: #0078D4; letter-spacing: 1px; }
            .footer-sub { font-size: 11px; color: #aaa; margin-top: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <div class="header-icon">🛒</div>
              <div class="header-text">
                <h1>Lista de la Compra</h1>
                <p>${fecha}</p>
              </div>
            </div>
            <div class="header-badge">
              <div class="badge-num">${items.length}</div>
              <div class="badge-label">Productos</div>
            </div>
          </div>

          <div class="intro">
            <span style="font-size:20px">💡</span>
            <p>Marca cada producto conforme lo vayas añadiendo al carrito. Generado con <strong>MyMenú</strong>.</p>
          </div>

          <div class="table">
            <div class="table-head">
              <span>#</span>
              <span>Producto</span>
              <span class="center">Hecho</span>
            </div>
            ${items
              .map(
                (item, i) => `
              <div class="row ${i % 2 !== 0 ? "alt" : ""}">
                <div class="row-num">${i + 1}</div>
                <div class="row-name">${item.name}</div>
                <div class="cb-wrap"><div class="cb"></div></div>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="footer">
            <div class="footer-brand">𝓜𝔂𝓜𝓮𝓷𝓾</div>
            <div class="footer-sub">Tu asistente de cocina inteligente</div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo generar o compartir el PDF");
    }
  };

  const checkedCount = items.filter((i) => i.is_checked).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>COMPRA</Text>
          <Text style={styles.headerTitle}>Mi Lista 🛒</Text>
        </View>
        {items.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{items.length}</Text>
          </View>
        )}
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* ── INPUT ── */}
        <View style={styles.inputSection}>
          <View
            style={[
              styles.inputWrapper,
              inputFocused && styles.inputWrapperFocused,
            ]}
          >
            <Text style={styles.inputEmoji}>📝</Text>
            <TextInput
              style={styles.input}
              placeholder="Añadir alimento..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={text}
              onChangeText={setText}
              onSubmitEditing={addItem}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              returnKeyType="done"
            />
            {text.trim().length > 0 && (
              <Pressable style={styles.addBtn} onPress={addItem}>
                <Text style={styles.addBtnText}>+</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── RESUMEN ── */}
        {items.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {items.length} producto{items.length !== 1 ? "s" : ""} en tu lista
            </Text>
          </View>
        )}

        {/* ── ITEMS ── */}
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <Animated.View key={item.id} style={styles.itemRow}>
              {/* Número de orden */}
              <View style={styles.itemNumber}>
                <Text style={styles.itemNumberText}>{index + 1}</Text>
              </View>

              {/* Contenido */}
              <View style={styles.itemCard}>
                <Text style={styles.itemText}>{item.name}</Text>
              </View>

              {/* Borrar */}
              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  pressed && styles.deleteBtnPressed,
                ]}
                onPress={() => deleteItem(item.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* ── VACÍO ── */}
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Lista vacía</Text>
            <Text style={styles.emptySubtext}>
              Añade productos o importa ingredientes desde el Menú
            </Text>
          </View>
        )}

        {/* ── PDF ── */}
        {items.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.pdfButton,
              pressed && styles.pdfButtonPressed,
            ]}
            onPress={generatePDF}
          >
            <Text style={styles.pdfIcon}>📄</Text>
            <Text style={styles.pdfButtonText}>Generar PDF y Compartir</Text>
          </Pressable>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1628" },

  header: {
    backgroundColor: "#0A1628",
    paddingTop: 54,
    paddingBottom: 20,
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
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "900" },
  headerBadge: {
    backgroundColor: "rgba(77,166,255,0.2)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(77,166,255,0.3)",
    alignItems: "center",
  },
  headerBadgeText: { color: "#4DA6FF", fontWeight: "900", fontSize: 18 },

  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },

  inputSection: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: "#4DA6FF",
    backgroundColor: "rgba(77,166,255,0.08)",
  },
  inputEmoji: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 15 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0078D4",
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 24, fontWeight: "300" },

  summaryRow: { marginBottom: 12 },
  summaryText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "600",
  },

  itemsContainer: { gap: 10 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(77,166,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemNumberText: { color: "#4DA6FF", fontWeight: "800", fontSize: 14 },
  itemCard: {
    flex: 1,
    backgroundColor: "#111D30",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  itemText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(231,76,60,0.1)",
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnPressed: { opacity: 0.7, transform: [{ scale: 0.93 }] },
  deleteIcon: { fontSize: 18 },

  emptyState: { alignItems: "center", paddingVertical: 50, gap: 10 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 21,
  },

  pdfButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(77,166,255,0.12)",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(77,166,255,0.25)",
    gap: 8,
  },
  pdfButtonPressed: { opacity: 0.75 },
  pdfIcon: { fontSize: 18 },
  pdfButtonText: {
    color: "#4DA6FF",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
