import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { theme } from "../styles/theme";
import { globalStyles } from "../styles/globalStyles";
import FilaAjuste from "../components/FilaAjuste";

export default function Configuracion({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseñaNueva, setContraseñaNueva] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);

  const [nombreFocused, setNombreFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passNuevaFocused, setPassNuevaFocused] = useState(false);

  const cargarDatosUsuario = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const { data: userData } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("id", user.id)
          .single();
        if (userData) setNombre(userData.nombre || "");
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const actualizarNombre = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("usuarios")
        .update({ nombre: nombre.trim() })
        .eq("id", user.id);
      if (error) {
        Alert.alert("Error", "No se pudo actualizar el nombre");
        return;
      }
      Alert.alert("✅ Éxito", "Nombre actualizado", [
        { text: "OK", onPress: () => setShowNameForm(false) },
      ]);
    } catch (e) {
      Alert.alert("Error", "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const actualizarEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "El email no puede estar vacío");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) {
        Alert.alert("Error", "No se pudo actualizar el email");
        return;
      }
      Alert.alert(
        "✅ Éxito",
        "Email actualizado. Revisa tu correo para confirmar.",
        [{ text: "OK", onPress: () => setShowEmailForm(false) }],
      );
    } catch (e) {
      Alert.alert("Error", "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const actualizarContraseña = async () => {
    if (!contraseñaNueva.trim()) {
      Alert.alert("Error", "La contraseña no puede estar vacía");
      return;
    }
    if (contraseñaNueva.length < 6) {
      Alert.alert("Error", "Mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: contraseñaNueva,
      });
      if (error) {
        Alert.alert("Error", "No se pudo actualizar la contraseña");
        return;
      }
      setContraseñaNueva("");
      Alert.alert("✅ Éxito", "Contraseña actualizada", [
        { text: "OK", onPress: () => setShowPasswordForm(false) },
      ]);
    } catch (e) {
      Alert.alert("Error", "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              // El listener global en App.js cambiará la ruta automáticamente.
            } catch (e) {
              Alert.alert("Error", "No se pudo cerrar sesión");
            }
          },
        },
      ],
    );
  };

  const avatarLetter = nombre ? nombre.charAt(0).toUpperCase() : "U";

  return (
    <View style={globalStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>CUENTA</Text>
          <Text style={styles.headerTitle}>Configuración ⚙️</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── AVATAR CARD ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{nombre || "Usuario"}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>✓ Cuenta activa</Text>
          </View>
        </View>

        {/* ── SECCIÓN: INFORMACIÓN PERSONAL ── */}
        <Text style={styles.sectionLabel}>👤 INFORMACIÓN PERSONAL</Text>

        <FilaAjuste
          label="Nombre de usuario"
          value={nombre || "—"}
          icon="✏️"
          showForm={showNameForm}
          onToggle={() => setShowNameForm(!showNameForm)}
        >
          <View
            style={[styles.inputWrapper, nombreFocused && styles.inputFocused]}
          >
            <TextInput
              style={styles.input}
              placeholder="Nuevo nombre"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={nombre}
              onChangeText={setNombre}
              onFocus={() => setNombreFocused(true)}
              onBlur={() => setNombreFocused(false)}
            />
          </View>
          <View style={styles.btnRow}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setShowNameForm(false);
                cargarDatosUsuario();
              }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={actualizarNombre}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "⏳" : "✓"} Guardar
              </Text>
            </Pressable>
          </View>
        </FilaAjuste>

        <FilaAjuste
          label="Correo electrónico"
          value={email || "—"}
          icon="📧"
          showForm={showEmailForm}
          onToggle={() => setShowEmailForm(!showEmailForm)}
        >
          <View
            style={[styles.inputWrapper, emailFocused && styles.inputFocused]}
          >
            <TextInput
              style={styles.input}
              placeholder="Nuevo email"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.btnRow}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setShowEmailForm(false);
                cargarDatosUsuario();
              }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={actualizarEmail}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "⏳" : "✓"} Guardar
              </Text>
            </Pressable>
          </View>
        </FilaAjuste>

        {/* ── SECCIÓN: SEGURIDAD ── */}
        <Text style={styles.sectionLabel}>🔒 SEGURIDAD</Text>

        <FilaAjuste
          label="Contraseña"
          value="••••••••"
          icon="🔑"
          showForm={showPasswordForm}
          onToggle={() => setShowPasswordForm(!showPasswordForm)}
        >
          <View
            style={[
              styles.inputWrapper,
              passNuevaFocused && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={contraseñaNueva}
              onChangeText={setContraseñaNueva}
              onFocus={() => setPassNuevaFocused(true)}
              onBlur={() => setPassNuevaFocused(false)}
              secureTextEntry
            />
          </View>
          <View style={styles.btnRow}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setShowPasswordForm(false);
                setContraseñaNueva("");
              }}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={actualizarContraseña}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "⏳" : "✓"} Actualizar
              </Text>
            </Pressable>
          </View>
        </FilaAjuste>

        {/* ── SECCIÓN: SESIÓN ── */}
        <Text style={styles.sectionLabel}>🚪 SESIÓN</Text>

        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed,
          ]}
          onPress={cerrarSesion}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerEyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerTitle: { color: theme.colors.text, fontSize: 26, fontWeight: "900" },

  content: { padding: 20, paddingBottom: 120 },

  profileCard: {
    ...globalStyles.card,
    alignItems: "center",
    marginBottom: 28,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 34, fontWeight: "900", color: theme.colors.text },
  profileName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 14,
  },
  profileBadge: {
    backgroundColor: "rgba(46,204,113,0.15)",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(46,204,113,0.3)",
  },
  profileBadgeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "700",
  },

  sectionLabel: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 4,
  },

  inputWrapper: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    marginTop: 12,
    justifyContent: "center",
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(77,166,255,0.08)",
  },
  input: { color: "#fff", fontSize: 15, height: "100%" },

  btnRow: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cancelBtnText: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: theme.colors.primaryDark,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(231,76,60,0.12)",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.25)",
    gap: 10,
    marginTop: 4,
  },
  logoutBtnPressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  logoutIcon: { fontSize: 18 },
  logoutText: {
    color: theme.colors.danger,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
