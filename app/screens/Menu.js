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

const { width } = Dimensions.get("window");

// Colores por dificultad
const DIFF_CONFIG = {
  facil: { label: "Fácil", color: "#2ECC71", bg: "rgba(46,204,113,0.18)" },
  medio: { label: "Medio", color: "#F39C12", bg: "rgba(243,156,18,0.18)" },
  dificil: { label: "Difícil", color: "#E74C3C", bg: "rgba(231,76,60,0.18)" },
};

// Emojis de dificultad
const DIFF_ICONS = { facil: "🟢", medio: "🟡", dificil: "🔴" };

export default function Menu() {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const loadRecipes = async () => {
    const { data, error } = await supabase
      .from("recetas")
      .select("*")
      .order("nombre");
    if (error) {
      console.error("Error cargando recetas:", error);
      return;
    }

    // Intentamos cargar los videos asociados si están en una tabla separada
    const { data: videosData } = await supabase.from("videos").select("*");

    // Unimos los videos con las recetas (asumiendo que hay un campo receta_id o id_receta)
    const recipesWithVideos = data.map((recipe) => {
      const video = videosData?.find(
        (v) => v.receta_id === recipe.id || v.id_receta === recipe.id,
      );
      return {
        ...recipe,
        youtube_url: video?.url || video?.youtube_url || recipe.youtube_url,
      };
    });

    setRecipes(recipesWithVideos);
    setLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.nombre
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const cfg = DIFF_CONFIG[recipe.nivel];
    const matchesDifficulty =
      selectedDifficulty === "Todos" ||
      (cfg && cfg.label === selectedDifficulty);
    return matchesSearch && matchesDifficulty;
  });

  const addToShoppingList = async (ingredients, recipeTitle) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión");
        return;
      }

      const itemsToAdd = ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      const inserts = itemsToAdd.map((name) => ({
        user_id: user.id,
        name,
        is_checked: false,
      }));

      const { error } = await supabase.from("lista_compra").insert(inserts);
      if (error) throw error;

      Alert.alert(
        "¡Añadido! 🛒",
        `${itemsToAdd.length} ingredientes de "${recipeTitle}" en tu lista.`,
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron añadir los ingredientes");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>RECETAS</Text>
          <Text style={styles.headerTitle}>Nuestra Carta 🍽️</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{filteredRecipes.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── BUSCADOR ── */}
        <View
          style={[styles.searchWrapper, searchFocused && styles.searchFocused]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar receta..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
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
            const isActive = selectedDifficulty === diff;
            const colorMap = {
              Fácil: "#2ECC71",
              Medio: "#F39C12",
              Difícil: "#E74C3C",
            };
            const activeColor = colorMap[diff] || "#4DA6FF";

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
                onPress={() => setSelectedDifficulty(diff)}
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
        {loading && (
          <Text style={styles.emptyText}>Cargando recetas... 👨‍🍳</Text>
        )}

        {/* ── CARDS ── */}
        {filteredRecipes.map((recipe) => {
          const cfg = DIFF_CONFIG[recipe.nivel] ?? {
            label: "—",
            color: "#999",
            bg: "#eee",
          };
          const icon = DIFF_ICONS[recipe.nivel] ?? "⚪";

          return (
            <View key={recipe.id} style={styles.card}>
              {/* Imagen con overlay */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: recipe.imagen_url }}
                  style={styles.cardImage}
                />
              </View>

              {/* Contenido */}
              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {recipe.nombre}
                  </Text>
                  <View style={[styles.diffBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.diffBadgeText, { color: cfg.color }]}>
                      {icon} {cfg.label}
                    </Text>
                  </View>
                </View>

                {/* Ingredientes */}
                <View style={styles.ingredientsRow}>
                  <Text style={styles.ingredientsLabel}>🥘 Ingredientes</Text>
                </View>
                <Text style={styles.ingredientsText} numberOfLines={3}>
                  {recipe.ingredientes}
                </Text>

                {/* Separador */}
                <View style={styles.cardDivider} />

                {/* Botón añadir */}
                <Pressable
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() =>
                    addToShoppingList(recipe.ingredientes, recipe.nombre)
                  }
                >
                  <Text style={styles.addButtonIcon}></Text>
                  <Text style={styles.addButtonText}>Añadir a la lista</Text>
                </Pressable>

                {recipe.youtube_url && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.youtubeButton,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => Linking.openURL(recipe.youtube_url)}
                  >
                    <Text style={styles.youtubeButtonIcon}></Text>
                    <Text style={styles.youtubeButtonText}>Ver en YouTube</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        {/* ── SIN RESULTADOS ── */}
        {filteredRecipes.length === 0 && !loading && (
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

  card: {
    backgroundColor: "#111D30",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 7,
  },
  imageContainer: { width: "100%", height: 180 },
  cardImage: { width: "100%", height: "100%" },
  cardBody: { padding: 16 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    flex: 1,
  },
  diffBadge: {
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  diffBadgeText: { fontSize: 11, fontWeight: "800" },
  ingredientsRow: { marginBottom: 6 },
  ingredientsLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "700",
  },
  ingredientsText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0078D4",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  addButtonIcon: { fontSize: 16 },
  addButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  youtubeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF0000",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  youtubeButtonIcon: { fontSize: 16 },
  youtubeButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },

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
