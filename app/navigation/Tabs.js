import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, View, StyleSheet, Alert } from "react-native";

import Menu from "../screens/Menu";
import Lista from "../screens/Lista";
import Configuracion from "../screens/Configuracion";
import Almacen from "../screens/Almacen";
import { supabase } from "../lib/supabase";

const Tab = createBottomTabNavigator();

const ACCENT = "#4DA6FF";
const BAR_BG = "#0D1925";

/* ── Días hasta caducar ─────────────────────────────────────── */
function diasHastaCaducar(fechaCaducidad) {
  const hoy = new Date();
  const caducidad = new Date(fechaCaducidad);
  return Math.ceil((caducidad - hoy) / (1000 * 60 * 60 * 24));
}

/* ── Icono personalizado ────────────────────────────────────── */
function TabIcon({ focused, name, size, label, IconComponent = Ionicons }) {
  return (
    <View style={styles.iconWrapper}>
      <View style={[styles.iconBg, focused && styles.iconBgActive]}>
        <IconComponent
          name={name}
          size={size}
          color={focused ? "#fff" : "rgba(255,255,255,0.38)"}
        />
      </View>
    </View>
  );
}

/* ── Configuración de tabs ──────────────────────────────────── */
const TAB_CONFIG = {
  Menu: {
    icon: ["restaurant", "restaurant-outline"],
    label: "Carta",
    size: 22,
    Comp: Ionicons,
  },
  Lista: {
    icon: ["cart", "cart-outline"],
    label: "Lista",
    size: 22,
    Comp: Ionicons,
  },
  Almacen: {
    icon: ["fridge", "fridge-outline"],
    label: "Almacén",
    size: 24,
    Comp: MaterialCommunityIcons,
  },
  Configuracion: {
    icon: ["settings", "settings-outline"],
    label: "Ajustes",
    size: 22,
    Comp: Ionicons,
  },
};

export default function Tabs() {
  /* ── Alerta de caducidad al iniciar ────────────────────────── */
  useEffect(() => {
    async function comprobarCaducidades() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: alimentos, error } = await supabase
        .from("alimentos")
        .select("id, nombre, fecha_caducidad, almacenamiento, notificado")
        .eq("user_id", user.id);

      if (error || !alimentos || alimentos.length === 0) return;

      const alimentosCaducar = alimentos.filter((a) => {
        const dias = diasHastaCaducar(a.fecha_caducidad);
        return dias <= 3 && dias >= 0 && !a.notificado;
      });

      if (alimentosCaducar.length === 0) return;

      const mensaje = alimentosCaducar
        .map(
          (a) =>
            `• ${a.nombre} (${a.almacenamiento}) → ${diasHastaCaducar(a.fecha_caducidad)} día(s)`,
        )
        .join("\n");

      Alert.alert("⚠️ Alimentos a punto de caducar", mensaje, [
        { text: "Entendido" },
      ]);

      alimentosCaducar.forEach(async (a) => {
        await supabase
          .from("alimentos")
          .update({ notificado: true })
          .eq("id", a.id);
      });
    }

    comprobarCaducidades();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Almacen"
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name];

        return {
          headerShown: false,
          tabBarShowLabel: false,

          tabBarStyle: {
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            height: 72,
            borderRadius: 24,
            backgroundColor: BAR_BG,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45,
            shadowRadius: 20,
            elevation: 16,
            marginLeft: 15,
            marginRight: 15,
          },

          tabBarItemStyle: {
            height: 72,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 15,
            paddingTop: 0,
          },

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? cfg.icon[0] : cfg.icon[1]}
              size={cfg.size}
              IconComponent={cfg.Comp}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Menu" component={Menu} />
      <Tab.Screen name="Lista" component={Lista} />
      <Tab.Screen name="Almacen" component={Almacen} />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconBg: {
    width: 42,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconBgActive: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
});
