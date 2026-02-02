import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, Alert } from 'react-native';

import Menu from '../screens/Menu';
import Lista from '../screens/Lista';
import Configuracion from '../screens/Configuracion';
import Almacen from '../screens/Almacen';
import { supabase } from '../lib/supabase';

const Tab = createBottomTabNavigator();

/* ⏱️ Calcula días hasta caducar */
function diasHastaCaducar(fechaCaducidad) {
  const hoy = new Date();
  const caducidad = new Date(fechaCaducidad);
  const diferencia = caducidad - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

// Componente icono (NO tocamos tu diseño)
function TabBarIcon({ focused, name, size, IconComponent = Ionicons }) {
  return (
    <View style={styles.iconContainer}>
      <View
        style={[
          styles.iconBackground,
          focused && styles.iconBackgroundFocused,
        ]}
      >
        <IconComponent
          name={name}
          size={size}
          color={focused ? '#007AFF' : '#8e8e93'}
        />
      </View>
    </View>
  );
}

export default function Tabs() {

  /* 🚀 ALERT AL INICIAR SESIÓN */
  useEffect(() => {
    async function comprobarCaducidades() {
      // 1️⃣ Usuario autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 2️⃣ Obtener alimentos del usuario
      const { data: alimentos, error } = await supabase
        .from('alimentos')
        .select(
          'id, nombre, fecha_caducidad, almacenamiento, notificado'
        )
        .eq('user_id', user.id);

      if (error || !alimentos || alimentos.length === 0) return;

      // 3️⃣ Filtrar alimentos a punto de caducar
      const alimentosCaducar = alimentos.filter(alimento => {
        const dias = diasHastaCaducar(alimento.fecha_caducidad);
        return dias <= 3 && dias >= 0 && !alimento.notificado;
      });

      if (alimentosCaducar.length === 0) return;

      // 4️⃣ Construir mensaje
      const mensaje = alimentosCaducar
        .map(alimento => {
          const dias = diasHastaCaducar(alimento.fecha_caducidad);
          return `• ${alimento.nombre} (${alimento.almacenamiento}) → ${dias} día(s)`;
        })
        .join('\n');

      // 5️⃣ Mostrar ALERT
      Alert.alert(
        '⚠️ Alimentos a punto de caducar',
        mensaje,
        [{ text: 'Entendido' }]
      );

      // 6️⃣ Marcar como notificados
      alimentosCaducar.forEach(async alimento => {
        await supabase
          .from('alimentos')
          .update({ notificado: true })
          .eq('id', alimento.id);
      });
    }

    comprobarCaducidades();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Almacen"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 55,
          right: 55,
          elevation: 0,
          backgroundColor:
            Platform.OS === 'ios'
              ? 'rgba(255,255,255,0.95)'
              : '#ffffff',
          borderRadius: 35,
          height: 70,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },

        tabBarItemStyle: {
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 15,
        },

        tabBarIcon: ({ focused }) => {
          let iconName;
          let iconSize = 24;
          let IconComponent = Ionicons;

          switch (route.name) {
            case 'Menu':
              iconName = focused
                ? 'restaurant'
                : 'restaurant-outline';
              break;

            case 'Lista':
              iconName = focused
                ? 'cart'
                : 'cart-outline';
              break;

            case 'Almacen':
              IconComponent = MaterialCommunityIcons;
              iconName = focused
                ? 'fridge'
                : 'fridge-outline';
              iconSize = 26;
              break;

            case 'Configuracion':
              iconName = focused
                ? 'settings'
                : 'settings-outline';
              break;
          }

          return (
            <TabBarIcon
              focused={focused}
              name={iconName}
              size={iconSize}
              IconComponent={IconComponent}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Menu" component={Menu} />
      <Tab.Screen name="Lista" component={Lista} />
      <Tab.Screen name="Almacen" component={Almacen} />
      <Tab.Screen name="Configuracion" component={Configuracion} />
    </Tab.Navigator>
  );
}

/* 🎨 Estilos (los tuyos) */
const styles = {
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  iconBackground: {
    width: Platform.OS === 'ios' ? 44 : 40,
    height: Platform.OS === 'ios' ? 44 : 40,
    borderRadius: Platform.OS === 'ios' ? 22 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBackgroundFocused: {
    backgroundColor:
      Platform.OS === 'ios' ? '#007AFF15' : '#007AFF10',
  },
};
