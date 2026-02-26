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
import { supabase } from "../lib/supabase";
import { listaCompraService } from "../lib/services/listaCompraService";
import { alimentoService } from "../lib/services/alimentoService";
import { generateShoppingListPDF } from "../lib/utils/pdfGenerator";
import { theme } from "../styles/theme";
import { globalStyles } from "../styles/globalStyles";
import BotonPrincipal from "../components/BotonPrincipal";
import ModalMoverAlmacen from "../components/ModalMoverAlmacen";

const { width } = Dimensions.get("window");

export default function Lista({ navigation }) {
  const [texto, setTexto] = useState("");
  const [articulos, setArticulos] = useState([]);
  const [focoInput, setFocoInput] = useState(false);

  // Estados para Mover a Arcón
  const [modalMoverVisible, setModalMoverVisible] = useState(false);
  const [articuloAMover, setArticuloAMover] = useState(null);

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
      cargarArticulos();
    }, []),
  );

  const cargarArticulos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await listaCompraService.getItems(user.id);

    if (error) {
      Alert.alert("Error cargando lista", error.message);
    } else {
      setArticulos(data || []);
    }
  };

  const agregarArticulo = async () => {
    if (texto.trim() === "") return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await listaCompraService.addItem(user.id, texto.trim());

    if (error) {
      Alert.alert("Error", "No se pudo añadir el alimento");
    } else {
      setTexto("");
      cargarArticulos();
    }
  };

  const eliminarArticulo = async (id) => {
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

            const { error } = await listaCompraService.deleteItem(id, user.id);

            if (error) {
              Alert.alert("Error", "No se pudo eliminar: " + error.message);
            } else {
              cargarArticulos();
            }
          },
        },
      ],
    );
  };

  const eliminarTodosLosArticulos = async () => {
    Alert.alert(
      "Vaciar lista",
      "¿Estás completamente seguro de que quieres eliminar todos los productos de tu lista de la compra? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, vaciar",
          style: "destructive",
          onPress: async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              Alert.alert("Error", "No estás autenticado");
              return;
            }

            const { error } = await listaCompraService.deleteAllItems(user.id);

            if (error) {
              Alert.alert(
                "Error",
                "No se pudo vaciar la lista: " + error.message,
              );
            } else {
              cargarArticulos();
            }
          },
        },
      ],
    );
  };

  const abrirModalMover = (item) => {
    setArticuloAMover(item);
    setModalMoverVisible(true);
  };

  const confirmarMovimiento = async ({ cantidad, caducidad, almacen }) => {
    if (!articuloAMover) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión");
        return;
      }

      // 1. Guardar en el almacén elegido
      const payload = {
        user_id: user.id,
        nombre: articuloAMover.name,
        cantidad: cantidad,
        fecha_caducidad: caducidad,
        almacenamiento: almacen,
        notificado: false,
      };

      const { error: insertError } = await alimentoService.addFood(payload);
      if (insertError) throw insertError;

      // 2. Borrar de la lista
      const { error: deleteError } = await listaCompraService.deleteItem(
        articuloAMover.id,
        user.id,
      );
      if (deleteError) throw deleteError;

      // Cerrar y actualizar
      setModalMoverVisible(false);
      setArticuloAMover(null);
      cargarArticulos();

      const storageName = almacen.charAt(0).toUpperCase() + almacen.slice(1);
      Alert.alert(
        "¡Movido! 📦",
        `"${articuloAMover.name}" se guardó en tu ${storageName}.`,
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo mover el producto.");
    }
  };

  const generarPDF = async () => {
    await generateShoppingListPDF(articulos);
  };

  const cantidadMarcados = articulos.filter((i) => i.is_checked).length;

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>COMPRA</Text>
          <Text style={styles.headerTitle}>Mi Lista 🛒</Text>
        </View>
        {articulos.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{articulos.length}</Text>
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
              focoInput && styles.inputWrapperFocused,
            ]}
          >
            <Text style={styles.inputEmoji}>📝</Text>
            <TextInput
              style={styles.input}
              placeholder="Añadir alimento..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={texto}
              onChangeText={setTexto}
              onSubmitEditing={agregarArticulo}
              onFocus={() => setFocoInput(true)}
              onBlur={() => setFocoInput(false)}
              returnKeyType="done"
            />
            {texto.trim().length > 0 && (
              <Pressable style={styles.addBtn} onPress={agregarArticulo}>
                <Text style={styles.addBtnText}>+</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── RESUMEN ── */}
        {articulos.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {articulos.length} producto{articulos.length !== 1 ? "s" : ""} en
              tu lista
            </Text>
          </View>
        )}

        {/* ── ITEMS ── */}
        <View style={styles.itemsContainer}>
          {articulos.map((item, index) => (
            <Animated.View key={item.id} style={styles.itemRow}>
              {/* Número de orden */}
              <View style={styles.itemNumber}>
                <Text style={styles.itemNumberText}>{index + 1}</Text>
              </View>

              {/* Contenido */}
              <View
                style={[
                  globalStyles.card,
                  { flex: 1, padding: 14, marginBottom: 0 },
                ]}
              >
                <Text style={styles.itemText}>{item.name}</Text>
              </View>

              {/* Botones de acción */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* Mover al arcón */}
                <Pressable
                  style={({ pressed }) => [
                    styles.moveBtn,
                    pressed && styles.deleteBtnPressed,
                  ]}
                  onPress={() => abrirModalMover(item)}
                >
                  <Text style={styles.deleteIcon}>📦</Text>
                </Pressable>

                {/* Borrar */}
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    pressed && styles.deleteBtnPressed,
                  ]}
                  onPress={() => eliminarArticulo(item.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* ── VACÍO ── */}
        {articulos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Lista vacía</Text>
            <Text style={styles.emptySubtext}>
              Añade productos o importa ingredientes desde el Menú
            </Text>
          </View>
        )}

        {/* ── PDF ── */}
        {articulos.length > 0 && (
          <View style={{ gap: 12, marginTop: 24 }}>
            <BotonPrincipal
              style={styles.pdfButton}
              label={
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={styles.pdfIcon}>📄</Text>
                  <Text style={styles.pdfButtonText}>
                    Generar PDF y Compartir
                  </Text>
                </View>
              }
              onPress={generarPDF}
            />

            <BotonPrincipal
              style={styles.deleteAllBtn}
              label={
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={styles.deleteAllIcon}>🗑️</Text>
                  <Text style={styles.deleteAllText}>
                    Vaciar lista completa
                  </Text>
                </View>
              }
              onPress={eliminarTodosLosArticulos}
            />
          </View>
        )}
      </Animated.ScrollView>

      {/* ── MODAL MOVER ARCÓN ── */}
      <ModalMoverAlmacen
        visible={modalMoverVisible}
        datosArticulo={articuloAMover}
        alCerrar={() => setModalMoverVisible(false)}
        alConfirmar={confirmarMovimiento}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerEyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: { color: theme.colors.text, fontSize: 26, fontWeight: "900" },
  headerBadge: {
    backgroundColor: "rgba(77,166,255,0.2)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(77,166,255,0.3)",
    alignItems: "center",
  },
  headerBadgeText: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: 18,
  },

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
    color: theme.colors.textSecondary,
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
  itemNumberText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  itemText: { color: theme.colors.text, fontSize: 16, fontWeight: "600" },
  moveBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(46, 204, 113, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
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
  emptyTitle: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 21,
  },

  pdfButton: {
    backgroundColor: "rgba(77,166,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(77,166,255,0.25)",
    shadowOpacity: 0,
    elevation: 0,
  },
  pdfIcon: { fontSize: 18 },
  pdfButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  deleteAllBtn: {
    backgroundColor: "rgba(231,76,60,0.12)",
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.25)",
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteAllIcon: { fontSize: 18 },
  deleteAllText: {
    color: theme.colors.danger,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
