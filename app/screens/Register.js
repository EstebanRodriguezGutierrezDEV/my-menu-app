import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  TextInput,
  Alert,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const LogoApp = require("../assets/LogoApp.png");
const { width, height } = Dimensions.get("window");

const COLORS = {
  accent: "#4DA6FF",
  accentDark: "#0078D4",
  textPrimary: "#FFFFFF",
  textSub: "rgba(255,255,255,0.45)",
};

export default function Register({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [usuarioFocused, setUsuarioFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (loading) return;

    if (!usuario || !email || !contraseña) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (contraseña.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: contraseña,
        options: {
          data: {
            nombre: usuario,
          },
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert(
        "¡Cuenta creada! 🎉",
        "Registro exitoso. Revisa tu correo si es necesario.",
      );

      navigation.navigate("Login");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/fondo.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* Capa oscura */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo + nombre */}
          <View style={styles.brandSection}>
            <Image source={LogoApp} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>𝓜𝔂𝓜𝓮𝓷𝓾</Text>
            <Text style={styles.tagline}>Empieza a gestionar tu cocina</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear cuenta</Text>

            {/* Campo usuario */}
            <View
              style={[
                styles.inputWrapper,
                usuarioFocused && styles.inputWrapperFocused,
              ]}
            >
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={usuario}
                onChangeText={setUsuario}
                onFocus={() => setUsuarioFocused(true)}
                onBlur={() => setUsuarioFocused(false)}
                autoCapitalize="none"
              />
            </View>

            {/* Campo email */}
            <View
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
              ]}
            >
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Campo contraseña */}
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
              ]}
            >
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={contraseña}
                onChangeText={setContraseña}
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>

            {/* Botón */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                loading && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Text>
            </Pressable>

            {/* Separador */}
            <View style={styles.separator}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>o</Text>
              <View style={styles.sepLine} />
            </View>

            {/* Link a login */}
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Inicia sesión</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,12,24,0.62)",
  },
  keyboardView: { flex: 1, justifyContent: "center", alignItems: "center" },

  content: { width: "100%", alignItems: "center", paddingHorizontal: 24 },

  brandSection: { alignItems: "center", marginBottom: 36 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 14 },
  appName: {
    fontSize: 32,
    color: COLORS.textPrimary,
    fontWeight: "900",
    letterSpacing: 2,
    textShadowColor: COLORS.accentDark,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSub,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(15,25,45,0.78)",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(77,166,255,0.1)",
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15, height: "100%" },

  button: {
    backgroundColor: COLORS.accentDark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  buttonText: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.5,
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  sepLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },
  sepText: { color: "rgba(255,255,255,0.35)", fontSize: 13 },

  linkRow: { flexDirection: "row", justifyContent: "center" },
  linkText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  link: { color: COLORS.accent, fontWeight: "700", fontSize: 14 },
});
