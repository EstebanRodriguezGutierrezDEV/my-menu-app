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
import { authService } from "../lib/services/authService";
import { theme } from "../styles/theme";
import { globalStyles } from "../styles/globalStyles";
import InputPersonalizado from "../components/InputPersonalizado";
import BotonPrincipal from "../components/BotonPrincipal";

const LogoApp = require("../assets/LogoApp.png");
const { width, height } = Dimensions.get("window");

export default function Registro({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [cargando, setCargando] = useState(false);

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

  const manejarRegistro = async () => {
    if (cargando) return;

    if (!usuario || !email || !contraseña) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(contraseña)) {
      Alert.alert(
        "Contraseña Débil",
        "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, un número y un carácter especial (@$!%*?&).",
      );
      return;
    }

    setCargando(true);

    try {
      const { error } = await authService.register(email, contraseña, usuario);

      if (error) {
        Alert.alert(
          "Error",
          "No se pudo crear la cuenta. Verifica tus datos o intenta con otro correo.",
        );
        return;
      }

      Alert.alert(
        "¡Cuenta creada! 🎉",
        "Registro exitoso. Revisa tu correo si es necesario.",
      );

      navigation.navigate("Acceso");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Error inesperado");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/fondo.png")}
      style={globalStyles.container}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* Capa oscura */}
      <View style={globalStyles.absoluteFillOverlay} />

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
          <View style={[globalStyles.card, { width: "100%" }]}>
            <Text
              style={[
                globalStyles.cardTitle,
                { textAlign: "center", marginBottom: 24 },
              ]}
            >
              Crear cuenta
            </Text>

            <InputPersonalizado
              icon="👤"
              placeholder="Nombre de usuario"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="words"
            />

            <InputPersonalizado
              icon="✉️"
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputPersonalizado
              icon="🔒"
              placeholder="Contraseña (mín. 6 caracteres)"
              value={contraseña}
              onChangeText={setContraseña}
              secureTextEntry={true}
            />

            <BotonPrincipal
              label="Crear cuenta"
              onPress={manejarRegistro}
              cargando={cargando}
            />

            {/* Separador */}
            <View style={styles.separator}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>o</Text>
              <View style={styles.sepLine} />
            </View>

            {/* Link a login */}
            <View style={styles.linkRow}>
              <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
              <Pressable onPress={() => navigation.navigate("Acceso")}>
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
  keyboardView: { flex: 1, justifyContent: "center", alignItems: "center" },

  content: { width: "100%", alignItems: "center", paddingHorizontal: 24 },

  brandSection: { alignItems: "center", marginBottom: 36 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 14 },
  appName: {
    ...globalStyles.title,
    fontSize: 32,
    letterSpacing: 2,
    textShadowColor: theme.colors.primaryDark,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  tagline: {
    ...globalStyles.subtitle,
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  sepLine: { flex: 1, height: 1, backgroundColor: theme.colors.borderLight },
  sepText: { color: "rgba(255,255,255,0.35)", fontSize: 13 },

  linkRow: { flexDirection: "row", justifyContent: "center" },
  linkText: { color: theme.colors.textSecondary, fontSize: 14 },
  link: { color: theme.colors.primary, fontWeight: "700", fontSize: 14 },
});
