import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const globalStyles = StyleSheet.create({
  // Layouts
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  absoluteFillOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Cards / Superficies
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },

  // Tipografía
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.text,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  // Formularios (Inputs)
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 52,
    marginBottom: theme.spacing.md,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(77,166,255,0.1)",
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    height: "100%",
  },

  // Botones
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
