import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function BotonPrincipal({ label, onPress, cargando, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [
        globalStyles.primaryButton,
        { marginTop: 8 },
        style,
        pressed && globalStyles.buttonPressed,
        cargando && { opacity: 0.6 },
      ]}
    >
      <Text style={globalStyles.primaryButtonText}>
        {cargando ? "Cargando..." : label}
      </Text>
    </Pressable>
  );
}
