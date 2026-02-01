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
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

export default function Menu() {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todos");
  const [loading, setLoading] = useState(true);

  /* =======================
     CARGAR RECETAS
  ======================== */
  const loadRecipes = async () => {
    const { data, error } = await supabase
      .from("recetas")
      .select("*")
      .order("nombre");

    if (error) {
      console.error("Error cargando recetas:", error);
      return;
    }

    setRecipes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  /* =======================
     FILTRADO
  ======================== */
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.nombre
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const recipeDifficulty =
      recipe.nivel === "facil"
        ? "Fácil"
        : recipe.nivel === "medio"
        ? "Medio"
        : "Difícil";

    const matchesDifficulty =
      selectedDifficulty === "Todos" ||
      recipeDifficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  /* =======================
     COLORES DIFICULTAD
  ======================== */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "facil":
        return "#4caf50";
      case "medio":
        return "#ff9800";
      case "dificil":
        return "#f44336";
      default:
        return "#999";
    }
  };

  /* =======================
     AÑADIR A LISTA COMPRA
  ======================== */
  const addToShoppingList = async (ingredients, recipeTitle) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

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

      const { error } = await supabase
        .from("lista_compra")
        .insert(inserts);

      if (error) throw error;

      Alert.alert(
        "¡Añadido!",
        `Se añadieron ${itemsToAdd.length} ingredientes de "${recipeTitle}".`
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron añadir los ingredientes");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>мумєηυ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Échale un vistazo a nuestra carta</Text>

        {/* BUSCADOR */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar receta..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* FILTROS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {["Todos", "Fácil", "Medio", "Difícil"].map((diff) => (
            <Pressable
              key={diff}
              style={[
                styles.filterChip,
                selectedDifficulty === diff && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedDifficulty(diff)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedDifficulty === diff && styles.filterChipTextSelected,
                ]}
              >
                {diff}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* LISTADO */}
        {loading && <Text style={styles.emptyText}>Cargando recetas...</Text>}

        {filteredRecipes.map((recipe) => {
          const difficultyLabel =
            recipe.nivel === "facil"
              ? "Fácil"
              : recipe.nivel === "medio"
              ? "Medio"
              : "Difícil";

          return (
            <View key={recipe.id} style={styles.productCard}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: recipe.imagen_url }}
                  style={styles.productImage}
                />
              </View>

              <View style={styles.titleRow}>
                <Text style={styles.productTitle}>{recipe.nombre}</Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(recipe.nivel) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(recipe.nivel) },
                    ]}
                  >
                    {difficultyLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.productIngredients}>
                {recipe.ingredientes}
              </Text>

              <Pressable
                style={styles.addButton}
                onPress={() =>
                  addToShoppingList(recipe.ingredientes, recipe.nombre)
                }
              >
                <Text style={styles.addButtonText}>Añadir</Text>
              </Pressable>
            </View>
          );
        })}

        {filteredRecipes.length === 0 && !loading && (
          <Text style={styles.emptyText}>
            No se encontraron recetas 😕
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

/* =======================
   ESTILOS
======================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    backgroundColor: "#0078d4",
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },

  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },

  content: { padding: 20, paddingBottom: 120 },

  welcome: {
    fontSize: 26,
    color: "#0078d4",
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  filtersContainer: { marginBottom: 20 },

  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  filterChipSelected: {
    backgroundColor: "#0078d4",
    borderColor: "#0078d4",
  },

  filterChipText: { color: "#666", fontWeight: "600" },
  filterChipTextSelected: { color: "#fff" },

  productCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },

  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },

  productImage: { width: "100%", height: "100%", resizeMode: "cover" },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },

  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  difficultyText: { fontSize: 12, fontWeight: "bold" },

  productIngredients: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },

  addButton: {
    backgroundColor: "#2EC4B6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
    fontStyle: "italic",
  },
});
