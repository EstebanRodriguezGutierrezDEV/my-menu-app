import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Animated,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const LogoApp = require("../assets/LogoApp.png");

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "❄️",
    tag: "ALMACÉN",
    title: "Todo bajo\ncontrol",
    description:
      "Gestiona tu nevera, arcón y despensa desde el móvil. Siempre sabrás qué tienes.",
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    accent: "#4DA6FF",
    accentDark: "#0057A8",
  },
  {
    id: "2",
    icon: "🍽️",
    tag: "RECETAS",
    title: "Cocina sin\ndesperdiciar",
    description:
      "Descubre recetas inteligentes con los ingredientes que ya tienes en casa.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    accent: "#FF9F43",
    accentDark: "#A85E00",
  },
  {
    id: "3",
    icon: "🔔",
    tag: "ALERTAS",
    title: "Nunca más\ncaducado",
    description:
      "Recibe avisos inteligentes antes de que tus alimentos se estropeen.",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    accent: "#2ECC71",
    accentDark: "#1A7A44",
  },
];

// ── Componente Slide ──────────────────────────────────────────
const Slide = ({ item }) => (
  <ImageBackground
    source={{ uri: item.image }}
    style={styles.imageBackground}
    resizeMode="cover"
  >
    <View style={styles.gradientLayer1} />
  </ImageBackground>
);

// ── Punto paginador ───────────────────────────────────────────
const Paginator = ({ data, scrollX, currentIndex }) => (
  <View style={styles.paginatorContainer}>
    {data.map((item, i) => {
      const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
      const dotWidth = scrollX.interpolate({
        inputRange,
        outputRange: [8, 32, 8],
        extrapolate: "clamp",
      });
      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.35, 1, 0.35],
        extrapolate: "clamp",
      });
      return (
        <Animated.View
          key={i.toString()}
          style={[
            styles.dot,
            {
              width: dotWidth,
              opacity,
              backgroundColor:
                i === currentIndex
                  ? data[currentIndex].accent
                  : "rgba(255,255,255,0.7)",
            },
          ]}
        />
      );
    })}
  </View>
);

// ── Componente principal ──────────────────────────────────────
export default function Onboarding() {
  const navigation = useNavigation();
  const [showWelcome, setShowWelcome] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const carouselFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(60)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowWelcome(false);
      Animated.parallel([
        Animated.timing(carouselFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleFinish = () => navigation.replace("Login");

  const handleNext = () =>
    slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });

  const current = SLIDES[currentIndex];

  // ── Pantalla de bienvenida ──────────────────────────────────
  if (showWelcome) {
    return (
      <View style={styles.welcomeContainer}>
        <StatusBar hidden />

        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
        <View style={[styles.bgCircle, styles.bgCircle3]} />

        <Animated.View
          style={[
            styles.welcomeContent,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Image source={LogoApp} style={styles.logo} resizeMode="contain" />

          <Text style={styles.welcomeLabel}>BIENVENIDO A</Text>
          <Text style={styles.appName}>𝓜𝔂𝓜𝓮𝓷𝓾</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerDot}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.welcomeSubtitle}>
            Tu asistente de cocina inteligente
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ── Carrusel principal ──────────────────────────────────────
  return (
    <Animated.View style={[styles.container, { opacity: carouselFadeAnim }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <FlatList
        data={SLIDES}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.floatingContent} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.topBrand}>
            <Image
              source={LogoApp}
              style={styles.topLogo}
              resizeMode="contain"
            />
            <Text style={styles.topAppName}>𝓜𝔂𝓜𝓮𝓷𝓾</Text>
          </View>
          <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Omitir</Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardSlideAnim }] }]}
        >
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: current.accentDark + "55" },
            ]}
          >
            <Text style={styles.iconEmoji}>{current.icon}</Text>
          </View>

          <Text style={[styles.slideTag, { color: current.accent }]}>
            {current.tag}
          </Text>

          <Text style={styles.slideTitle}>{current.title}</Text>

          <Text style={styles.slideDescription}>{current.description}</Text>

          <Paginator
            data={SLIDES}
            scrollX={scrollX}
            currentIndex={currentIndex}
          />

          {currentIndex === SLIDES.length - 1 ? (
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: current.accent }]}
              onPress={handleFinish}
              activeOpacity={0.88}
            >
              <Text style={styles.mainButtonText}>¡Comenzar ahora! 🚀</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: current.accent }]}
              onPress={handleNext}
              activeOpacity={0.88}
            >
              <Text style={styles.mainButtonText}>Siguiente</Text>
              <Text style={styles.mainButtonArrow}>→</Text>
            </TouchableOpacity>
          )}

          {currentIndex < SLIDES.length - 1 && (
            <Text style={styles.swipeHint}>Desliza para continuar</Text>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // BIENVENIDA
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07131F",
    overflow: "hidden",
  },
  bgCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.18,
  },
  bgCircle1: {
    width: 400,
    height: 400,
    backgroundColor: "#4DA6FF",
    top: -80,
    right: -100,
  },
  bgCircle2: {
    width: 300,
    height: 300,
    backgroundColor: "#0078D4",
    bottom: -60,
    left: -80,
  },
  bgCircle3: {
    width: 200,
    height: 200,
    backgroundColor: "#2ECC71",
    bottom: 100,
    right: -50,
  },
  welcomeContent: { alignItems: "center", paddingHorizontal: 40 },
  logo: { width: 100, height: 100, borderRadius: 28, marginBottom: 24 },
  welcomeLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: "#0078D4",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dividerDot: { color: "#4DA6FF", fontSize: 14 },
  welcomeSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // CARRUSEL
  container: { flex: 1, backgroundColor: "#000" },
  imageBackground: { width, height },
  gradientLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,14,26,0.55)",
  },
  floatingContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 54,
    paddingHorizontal: 24,
  },
  topBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  topLogo: { width: 34, height: 34, borderRadius: 10 },
  topAppName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  skipBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 36,
    backgroundColor: "rgba(10,20,35,0.72)",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconEmoji: { fontSize: 30 },
  slideTag: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 42,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  slideDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 23,
    marginBottom: 24,
    fontWeight: "400",
  },
  paginatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 22,
  },
  dot: { height: 7, borderRadius: 4 },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 18,
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  mainButtonArrow: { color: "#fff", fontSize: 20, fontWeight: "800" },
  swipeHint: {
    textAlign: "center",
    marginTop: 14,
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
