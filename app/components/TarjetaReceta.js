import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Linking,
  StyleSheet,
} from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { theme } from "../styles/theme";

export default function TarjetaReceta({
  receta,
  configDificultad,
  iconoDificultad,
  alAgregarALista,
  ingredientesPropios = [], // Nombres de los ingredientes que el usuario tiene
}) {
  const renderizarIngredientes = () => {
    if (!receta.ingredientes) return null;

    // Si no pasamos nada, renderizamos texto normal
    if (!ingredientesPropios || ingredientesPropios.length === 0) {
      return (
        <Text style={styles.ingredientsText} numberOfLines={3}>
          {receta.ingredientes}
        </Text>
      );
    }

    // Dividimos la cadena "1 Zanahoria, 2 Cebollas" -> ["1 Zanahoria", " 2 Cebollas"]
    const arrayIngredientes = receta.ingredientes.split(",");

    return (
      <Text style={styles.ingredientsText} numberOfLines={3}>
        {arrayIngredientes.map((ing, i) => {
          const ingBruto = ing.trim().toLowerCase();

          // Buscar alguna coincidencia (ej. "Zanahoria" en "1 Zanahoria grande")
          const coincide = ingredientesPropios.some((propio) => {
            const propioLimpio = propio.toLowerCase().trim();
            // Comprobamos si el ingrediente de la tarjeta incluye el nombre de lo que tenemos
            return propioLimpio.length > 2 && ingBruto.includes(propioLimpio);
          });

          return (
            <Text
              key={i}
              style={[
                coincide && { color: theme.colors.success, fontWeight: "800" },
              ]}
            >
              {ing}
              {i < arrayIngredientes.length - 1 ? ", " : ""}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={[globalStyles.card, { marginBottom: 24 }]}>
      {/* Imagen con overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: receta.imagen_url }} style={styles.cardImage} />
      </View>

      {/* Contenido */}
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text
            style={[globalStyles.cardTitle, { flexShrink: 1, marginRight: 8 }]}
            numberOfLines={1}
          >
            {receta.nombre}
          </Text>
          <View
            style={[styles.diffBadge, { backgroundColor: configDificultad.bg }]}
          >
            <Text
              style={[styles.diffBadgeText, { color: configDificultad.color }]}
            >
              {iconoDificultad} {configDificultad.label}
            </Text>
          </View>
        </View>

        {/* Ingredientes con Resaltado Inteligente */}
        <View style={styles.ingredientsRow}>
          <Text style={styles.ingredientsLabel}>🥘 Ingredientes</Text>
        </View>
        {renderizarIngredientes()}

        {/* Separador */}
        <View style={styles.cardDivider} />

        {/* Botón añadir */}
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={alAgregarALista}
        >
          <Text style={styles.addButtonIcon}></Text>
          <Text style={styles.addButtonText}>Añadir a la lista</Text>
        </Pressable>

        {receta.youtube_url && (
          <Pressable
            style={({ pressed }) => [
              styles.youtubeButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => Linking.openURL(receta.youtube_url)}
          >
            <Text style={styles.youtubeButtonIcon}></Text>
            <Text style={styles.youtubeButtonText}>Ver en YouTube</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    marginHorizontal: -16, // theme.spacing.lg (debes asegurar que esto coincide con theme)
    marginTop: -16,
    marginBottom: 16,
    borderTopLeftRadius: 24, // Para que el contenedor enmascare bien si overflows
    borderTopRightRadius: 24,
    overflow: "hidden", // Importante
    alignItems: "stretch", // Fuerza a la imagen a ocupar el ancho real disponible más sus márgenes
  },
  cardImage: {
    width: "auto", // Usa el contenedor
    height: 180, // Mueve la altura aquí
  },
  cardBody: { padding: 0 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
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
});
