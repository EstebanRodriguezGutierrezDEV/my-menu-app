import React from "react";
import {
  View,
  Text,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Alert,
  StyleSheet,
} from "react-native";
import { theme } from "../styles/theme";
import { globalStyles } from "../styles/globalStyles";
import TarjetaReceta from "./TarjetaReceta";

export default function ModalSugerencias({
  visible,
  alCerrar,
  cargando,
  recetasSugeridas,
  alimentos, // Lista de strings con los nombres (para que la carta lo pinte de verde)
  todosLosAlimentos, // array con los objetos enteros para validación si hace falta, aunque alimentos.map tmb sirve
  etiquetaAlmacen,
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={alCerrar}>
      <View style={globalStyles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />

        <View
          style={[
            styles.header,
            { paddingTop: Platform.OS === "ios" ? 54 : 34 },
          ]}
        >
          <View>
            <Text style={styles.headerEyebrow}>SUGERENCIAS</Text>
            <Text style={styles.headerTitle}>Recetas Posibles</Text>
          </View>
          <Pressable style={styles.closeModalBtn} onPress={alCerrar}>
            <Text style={styles.closeModalBtnText}>Volver</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {cargando ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🤖</Text>
              <Text style={styles.emptyTitle}>Analizando ingredientes...</Text>
            </View>
          ) : recetasSugeridas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🤷‍♂️</Text>
              <Text style={styles.emptyTitle}>Sin coincidencias</Text>
              <Text style={styles.emptySubtext}>
                No tienes suficientes ingredientes clave en tu inventario para
                hacer ninguna de las recetas.
              </Text>
            </View>
          ) : (
            recetasSugeridas.map((recipe) => (
              <TarjetaReceta
                key={recipe.id}
                receta={recipe}
                difficultyConfig={{
                  label: recipe.matches + " coincidencia(s)",
                  bg: theme.colors.success + "22",
                  color: theme.colors.success,
                }}
                difficultyIcon="✅"
                ownedIngredients={alimentos}
                onAddToList={() => {
                  Alert.alert(
                    "Ups!",
                    "Cierra las sugerencias para interactuar con la lista de la compra de forma habitual.",
                  );
                }}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
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
  closeModalBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  closeModalBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  content: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 16 },
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
