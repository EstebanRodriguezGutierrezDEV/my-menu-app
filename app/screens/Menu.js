import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Alert,
  StatusBar,
  ImageBackground,
  Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { recetasService } from "../lib/services/recetasService";
import { listaCompraService } from "../lib/services/listaCompraService";
import { alimentoService } from "../lib/services/alimentoService";
import { theme } from "../styles/theme";
import { globalStyles } from "../styles/globalStyles";
import TarjetaReceta from "../components/TarjetaReceta";

const { width } = Dimensions.get("window");

// Colores por dificultad
const DIFF_CONFIG = {
  facil: {
    label: "Fácil",
    color: theme.colors.success,
    bg: "rgba(46,204,113,0.18)",
  },
  medio: {
    label: "Medio",
    color: theme.colors.warning,
    bg: "rgba(243,156,18,0.18)",
  },
  dificil: {
    label: "Difícil",
    color: theme.colors.danger,
    bg: "rgba(231,76,60,0.18)",
  },
};

// Emojis de dificultad
const DIFF_ICONS = { facil: "🟢", medio: "🟡", dificil: "🔴" };

export default function Menu() {
  const [recetas, setRecetas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [dificultadSeleccionada, setDificultadSeleccionada] = useState("Todos");
  const [cargando, setCargando] = useState(true);
  const [focoBusqueda, setFocoBusqueda] = useState(false);

  const cargarRecetas = async () => {
    // La unión de videos y recetas se hace dentro del servicio
    const { recetas: recetasMapeadas, error } =
      await recetasService.getAllRecipes();

    if (error) {
      console.error("Error cargando recetas:", error);
      return;
    }

    setRecetas(recetasMapeadas || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarRecetas();
  }, []);

  const recetasFiltradas = recetas.filter((receta) => {
    const coincideBusqueda = receta.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const cfg = DIFF_CONFIG[receta.nivel];
    const coincideDificultad =
      dificultadSeleccionada === "Todos" ||
      (cfg && cfg.label === dificultadSeleccionada);
    return coincideBusqueda && coincideDificultad;
  });

  const agregarAListaCompra = async (ingredientes, tituloReceta) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión");
        return;
      }

      // 1. Obtener inventario del usuario y limpiarlo
      const { data: alimentosUsuario, error: errorAlimentos } =
        await alimentoService.getAllUserFoods(user.id);
      if (errorAlimentos) throw errorAlimentos;

      const ingredientesPropios = (alimentosUsuario || []).map((f) =>
        f.nombre.toLowerCase().trim(),
      );
      const arrayIngredientesReceta = ingredientes
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      // 2. Algoritmo Filtro Inteligente (Solo añadir lo que nos falte)
      const elementosAAgregar = arrayIngredientesReceta.filter((ing) => {
        const ingBruto = ing.toLowerCase();
        const coincide = ingredientesPropios.some((propio) => {
          return propio.length > 2 && ingBruto.includes(propio);
        });
        return !coincide; // Solo nos quedamos con los que NO tenemos
      });

      const cantidadYaObtenida =
        arrayIngredientesReceta.length - elementosAAgregar.length;

      // 3. Evaluar resultados
      if (elementosAAgregar.length === 0) {
        Alert.alert(
          "¡Todo listo! 🥳",
          `Ya tienes todos los ingredientes de "${tituloReceta}" en tu despensa.`,
        );
        return;
      }

      // 4. Inserción final de la lista limpia
      const { error, count } = await listaCompraService.addMultipleItems(
        user.id,
        elementosAAgregar.join(","),
      );

      if (error) throw error;

      // 5. Feedback adaptativo
      if (cantidadYaObtenida > 0) {
        Alert.alert(
          "¡Añadido Inteligente! 🛒🧠",
          `Añadidos ${count} ingredientes de "${tituloReceta}".\n\n¡Te has ahorrado comprar ${cantidadYaObtenida} que ya tenías en la nevera!`,
        );
      } else {
        Alert.alert(
          "¡Añadido! 🛒",
          `${count} ingredientes de "${tituloReceta}" en tu lista.`,
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron añadir los ingredientes");
    }
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>RECETAS</Text>
          <Text style={styles.headerTitle}>Nuestra Carta 🍽️</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{recetasFiltradas.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── BUSCADOR ── */}
        <View
          style={[styles.searchWrapper, focoBusqueda && styles.searchFocused]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar receta..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={busqueda}
            onChangeText={setBusqueda}
            onFocus={() => setFocoBusqueda(true)}
            onBlur={() => setFocoBusqueda(false)}
          />
          {busqueda.length > 0 && (
            <Pressable onPress={() => setBusqueda("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* ── FILTROS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {["Todos", "Fácil", "Medio", "Difícil"].map((diff) => {
            const isActive = dificultadSeleccionada === diff;
            const colorMap = {
              Fácil: theme.colors.success,
              Medio: theme.colors.warning,
              Difícil: theme.colors.danger,
            };
            const activeColor = colorMap[diff] || theme.colors.primary;

            return (
              <Pressable
                key={diff}
                style={[
                  styles.chip,
                  isActive && {
                    backgroundColor: activeColor,
                    borderColor: activeColor,
                  },
                ]}
                onPress={() => setDificultadSeleccionada(diff)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {diff}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── ESTADO CARGA ── */}
        {cargando && (
          <Text style={styles.emptyText}>Cargando recetas... 👨‍🍳</Text>
        )}

        {/* ── CARDS ── */}
        {recetasFiltradas.map((receta) => {
          const cfg = DIFF_CONFIG[receta.nivel] ?? {
            label: "—",
            color: "#999",
            bg: "#eee",
          };
          const icon = DIFF_ICONS[receta.nivel] ?? "⚪";

          return (
            <TarjetaReceta
              key={receta.id}
              receta={receta}
              configDificultad={cfg}
              iconoDificultad={icon}
              alAgregarALista={() =>
                agregarAListaCompra(receta.ingredientes, receta.nombre)
              }
            />
          );
        })}

        {/* ── SIN RESULTADOS ── */}
        {recetasFiltradas.length === 0 && !cargando && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No encontramos recetas con esos filtros
            </Text>
          </View>
        )}
      </ScrollView>
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
  headerBadgeText: { color: "#4DA6FF", fontWeight: "900", fontSize: 18 },

  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchFocused: {
    borderColor: "#4DA6FF",
    backgroundColor: "rgba(77,166,255,0.08)",
  },
  searchIcon: { fontSize: 17, marginRight: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 15 },
  clearIcon: { fontSize: 15, color: "rgba(255,255,255,0.4)", paddingLeft: 6 },

  filtersScroll: { marginBottom: 12 },
  filtersContent: { paddingRight: 8 },
  chip: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  chipText: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  emptyState: { alignItems: "center", paddingTop: 50, gap: 10 },
  emptyEmoji: { fontSize: 52, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 21,
  },
});
