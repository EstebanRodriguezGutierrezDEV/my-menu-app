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
import { theme } from "../styles/theme";
import { globalStyles } from "../styles/globalStyles";
import BotonPrincipal from "../components/BotonPrincipal";
import ModalAgregarAlimento from "../components/ModalAgregarAlimento";
import ModalSugerencias from "../components/ModalSugerencias";
import { alimentoService } from "../lib/services/alimentoService";
import { recetasService } from "../lib/services/recetasService";

const { width, height } = Dimensions.get("window");

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
  nevera: { label: "Nevera", icon: "❄️", color: theme.colors.primary },
  arcon: { label: "Arcón", icon: "🧊", color: theme.colors.success },
  despensa: { label: "Despensa", icon: "🏠", color: theme.colors.warning },
};

export default function Almacen() {
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState("nevera");
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [alimentos, setAlimentos] = useState([]);

  // Estados Sugerencias
  const [mostrarModalSugerencias, setMostrarModalSugerencias] = useState(false);
  const [recetasSugeridas, setRecetasSugeridas] = useState([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [todosLosIngredientesUsuario, setTodosLosIngredientesUsuario] =
    useState([]);

  const [nuevoAlimento, setNuevoAlimento] = useState({
    nombre: "",
    fechaCaducidad: "",
    cantidad: "",
    almacen: "nevera",
  });

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // ── Utilidades ─────────────────────────────────────────────
  const obtenerDiasRestantes = (date) => {
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

  const obtenerEstiloCaducidad = (days) => {
    if (days === null) return null;
    if (days <= 0)
      return {
        border: "rgba(231,76,60,0.8)",
        bg: "rgba(231,76,60,0.12)",
        label: "Caducado",
        color: theme.colors.danger,
      };
    if (days <= 3)
      return {
        border: "rgba(231,76,60,0.5)",
        bg: "rgba(231,76,60,0.08)",
        label: `${days}d`,
        color: theme.colors.danger,
      };
    if (days <= 7)
      return {
        border: "rgba(243,156,18,0.5)",
        bg: "rgba(243,156,18,0.08)",
        label: `${days}d`,
        color: theme.colors.warning,
      };
    return {
      border: theme.colors.borderLight,
      bg: "transparent",
      label: `${days}d`,
      color: theme.colors.textSecondary,
    };
  };

  const comprobarCaducidades = async (items) => {
    for (const item of items) {
      const days = obtenerDiasRestantes(item.fecha_caducidad);
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

  const formatearFechaCaducidad = (text) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    let f = cleaned;
    if (cleaned.length > 2) f = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 4) f = f.slice(0, 5) + "/" + cleaned.slice(4);
    return f;
  };

  // ── Datos ──────────────────────────────────────────────────
  const cargarAlimentos = async () => {
    const { data, error } =
      await alimentoService.getAlimentosPorAlmacen(almacenSeleccionado);
    if (error) return;
    setAlimentos(data || []);
    comprobarCaducidades(data || []);
  };

  useEffect(() => {
    cargarAlimentos();
  }, [almacenSeleccionado]);

  const obtenerSugerencias = async () => {
    setCargandoSugerencias(true);
    setMostrarModalSugerencias(true);

    // 1. Cargamos TODAS las recetas disponibles mediante la API de servicios
    const { recetas: recetasMapeadas, error } =
      await recetasService.getAllRecipes();

    if (error) {
      setCargandoSugerencias(false);
      return;
    }

    // 2. Extraer los nombres de TODOS los alimentos que tenemos en la casa (Nevera + Arcón + Despensa)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: todosLosAlimentos } = await alimentoService.getAllUserFoods(
      user?.id,
    );

    const nombresActuales = (todosLosAlimentos || []).map((a) =>
      a.nombre.toLowerCase().trim(),
    );
    setTodosLosIngredientesUsuario(nombresActuales);

    // 3. Ordenamos las recetas según la cantidad de coincidencias
    const recetasCoincidentes = recetasMapeadas.map((receta) => {
      let matches = 0;
      if (recipe.ingredientes) {
        const recipeIngs = recipe.ingredientes.split(",");
        recipeIngs.forEach((ing) => {
          const cleanIng = ing.trim().toLowerCase();
          const hasItem = currentOwnedNames.some(
            (owned) => owned.length > 2 && cleanIng.includes(owned),
          );
          if (hasItem) matches++;
        });
      }
      return { ...recipe, matches };
    });

    // Filtramos las que tengan CERO coincidencias si solo queremos sugerir cosas útiles
    // o simplemente las ordenamos para que las de "Mejor match" salgan primero
    const sorted = matchRecipes
      .filter((r) => r.matches > 0)
      .sort((a, b) => b.matches - a.matches);

    setSuggestedRecipes(sorted);
    setLoadingSuggestions(false);
  };

  const agregarAlimentoDetallado = async () => {
    if (!nuevoAlimento.nombre.trim()) return;
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    const fechaFormateada = nuevoAlimento.fechaCaducidad
      ? nuevoAlimento.fechaCaducidad.split("/").reverse().join("-")
      : null;

    await alimentoService.addFood({
      user_id: data.user.id,
      nombre: nuevoAlimento.nombre,
      cantidad: nuevoAlimento.cantidad,
      fecha_caducidad: fechaFormateada,
      almacenamiento: nuevoAlimento.almacen || almacenSeleccionado,
      notificado: false,
    });

    setMostrarModalAgregar(false);
    setNuevoAlimento({
      nombre: "",
      fechaCaducidad: "",
      cantidad: "",
      almacen: almacenSeleccionado,
    });
    cargarAlimentos();
  };

  const eliminarAlimento = async (id) => {
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

            const { error } = await alimentoService.deleteFood(id, user.id);

            if (error) Alert.alert("Error", error.message);
            else cargarAlimentos();
          },
        },
      ],
    );
  };

  const cfg = STORAGE_CONFIG[almacenSeleccionado];

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

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
          const active = almacenSeleccionado === key;
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
              onPress={() => setAlmacenSeleccionado(key)}
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
            setNuevoAlimento({
              nombre: "",
              fechaCaducidad: "",
              cantidad: "",
              almacen: almacenSeleccionado,
            });
            setMostrarModalAgregar(true);
          }}
        >
          <Text style={styles.addButtonPlus}>+</Text>
          <Text style={styles.addButtonText}>Añadir alimento</Text>
        </Pressable>

        {/* Botón Sugerencias Global */}
        <Pressable
          style={[styles.aiButtonMain, { shadowColor: theme.colors.success }]}
          onPress={obtenerSugerencias}
        >
          <Text style={styles.aiButtonMainIcon}>💡</Text>
          <Text style={styles.aiButtonMainText}>¿Qué puedo cocinar?</Text>
        </Pressable>

        {/* Cards de alimentos */}
        {alimentos.map((item) => {
          const daysLeft = obtenerDiasRestantes(item.fecha_caducidad);
          const exp = obtenerEstiloCaducidad(daysLeft);

          return (
            <View
              key={item.id}
              style={[
                styles.foodCard,
                exp && {
                  borderColor: exp.border,
                  backgroundColor: theme.colors.surfaceSolid,
                },
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
                onPress={() => eliminarAlimento(item.id)}
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

      {/* ── MODALS COMPONETIZADOS ── */}
      <ModalSugerencias
        visible={mostrarModalSugerencias}
        alCerrar={() => setMostrarModalSugerencias(false)}
        cargando={cargandoSugerencias}
        recetasSugeridas={recetasSugeridas}
        alimentos={todosLosIngredientesUsuario}
      />

      <ModalAgregarAlimento
        visible={mostrarModalAgregar}
        alCerrar={() => setMostrarModalAgregar(false)}
        nuevoAlimento={nuevoAlimento}
        setNuevoAlimento={setNuevoAlimento}
        alGuardar={agregarAlimentoDetallado}
        configAlmacen={STORAGE_CONFIG}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: 54,
    paddingBottom: 16,
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
  headerTitle: {
    color: theme.colors.text,
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
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.7,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(13,30,53,1)",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
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
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },

  content: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 16 },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  addButtonPlus: { color: theme.colors.text, fontSize: 22, fontWeight: "700" },
  addButtonText: { color: theme.colors.text, fontWeight: "800", fontSize: 15 },

  aiButtonMain: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(46,204,113,0.15)", // Verde tenue
    borderWidth: 1,
    borderColor: "rgba(46,204,113,0.3)",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  aiButtonMainIcon: { fontSize: 18 },
  aiButtonMainText: {
    color: theme.colors.success,
    fontWeight: "800",
    fontSize: 15,
  },

  foodCard: {
    ...globalStyles.card,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    gap: 12,
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
  foodName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  foodMeta: { color: theme.colors.textSecondary, fontSize: 12 },
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
  emptyTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
