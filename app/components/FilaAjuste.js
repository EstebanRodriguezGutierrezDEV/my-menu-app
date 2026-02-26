import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { globalStyles } from "../styles/globalStyles";

export default function FilaAjuste({
  label,
  value,
  icon,
  showForm,
  onToggle,
  children,
}) {
  return (
    <View
      style={[
        globalStyles.card,
        { padding: 0, marginBottom: 12, overflow: "hidden" },
      ]}
    >
      <Pressable style={styles.fieldRow} onPress={onToggle}>
        <View style={styles.fieldIconBadge}>
          <Text style={styles.fieldIcon}>{icon}</Text>
        </View>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>
            {value}
          </Text>
        </View>
        <View style={[styles.chevron, showForm && styles.chevronOpen]}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </Pressable>
      {showForm && <View style={styles.editForm}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  fieldIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(77,166,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldIcon: { fontSize: 19 },
  fieldInfo: { flex: 1 },
  fieldLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  fieldValue: {
    color: "#fff", // Reemplazo seguro de COLORS variable
    fontSize: 15,
    fontWeight: "600",
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  chevronOpen: { backgroundColor: "rgba(77,166,255,0.15)" },
  chevronText: { color: "rgba(255,255,255,0.4)", fontSize: 20, lineHeight: 24 },
  editForm: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
});
