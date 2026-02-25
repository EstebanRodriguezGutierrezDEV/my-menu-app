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
  bg: "#0A1628",
  accent: "#4DA6FF",
  accentDark: "#0078D4",
  textPrimary: "#FFFFFF",
  textSub: "rgba(255,255,255,0.45)",
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
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

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !contraseña) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: contraseña,
      });

      if (error) {
        Alert.alert("Error", "Correo o contraseña incorrectos");
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        const { data: alimentos } = await supabase
          .from("alimentos")
          .select("nombre, fecha_caducidad")
          .eq("user_id", data.user.id);

        if (alimentos) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const expiringCount = alimentos.filter((item) => {
            if (!item.fecha_caducidad) return false;
            const parts = item.fecha_caducidad.split("-");
            if (parts.length !== 3) return false;
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const expiry = new Date(year, month, day);
            const diff = expiry - today;
            const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
            return daysLeft <= 3;
          }).length;

          if (expiringCount > 0) {
            Alert.alert(
              "¡Atención!",
              `Tienes ${expiringCount} producto(s) a punto de caducar o caducados.`,
              [
                {
                  text: "Entendido",
                  onPress: () => navigation.replace("MainTabs"),
                },
              ],
            );
            return;
          }
        }
      }

      navigation.replace("MainTabs");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Error inesperado al iniciar sesión");
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
            <Text style={styles.tagline}>Tu despensa, siempre al día</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar sesión</Text>

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
                placeholder="Contraseña"
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
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                loading && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? "Iniciando..." : "Entrar"}
              </Text>
            </Pressable>

            {/* Separador */}
            <View style={styles.separator}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>o</Text>
              <View style={styles.sepLine} />
            </View>

            {/* Link a registro */}
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>¿No tienes cuenta? </Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>Regístrate</Text>
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
