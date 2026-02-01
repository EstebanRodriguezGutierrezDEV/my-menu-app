import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import Menu from '../screens/Menu';
import Lista from '../screens/Lista';
import Configuracion from '../screens/Configuracion';
import Almacen from '../screens/Almacen';

const Tab = createBottomTabNavigator();

// Componente personalizado para labels de iPhone
function TabBarLabel({ focused, label }) {
  return (
    <Text style={[
      styles.tabBarLabel,
      { color: focused ? '#007AFF' : '#8e8e93' }
    ]}>
      {label}
    </Text>
  );
}

// Componente personalizado para iconos con efecto de iPhone
function TabBarIcon({ focused, name, size, label }) {
  return (
    <View style={styles.iconContainer}>
      <View style={[
        styles.iconBackground,
        focused && styles.iconBackgroundFocused
      ]}>
        <Ionicons
          name={name}
          size={size}
          color={focused ? '#007AFF' : '#8e8e93'}
        />
      </View>
      <TabBarLabel focused={focused} label={label} />
    </View>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        
        // 🍎 Estilo iPhone Moderno
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 70,
          backgroundColor: Platform.OS === 'ios' 
            ? 'rgba(255,255,255,0.98)' 
            : '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#c6c6c8',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: Platform.OS === 'ios' ? -1 : -2,
          },
          shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.05,
          shadowRadius: Platform.OS === 'ios' ? 8 : 4,
          elevation: Platform.OS === 'ios' ? 8 : 4,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
        },

        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        
        // Animaciones suaves
        tabBarItemStyle: {
          paddingVertical: 4,
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = 24;

          switch (route.name) {
            case 'Menu':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;

            case 'Lista':
              iconName = focused ? 'cart' : 'cart-outline';
              break;

            case 'Almacen':
              iconName = focused ? 'snow' : 'snow-outline';
              iconSize = 26;
              break;

            case 'Configuracion':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          // Obtener el label del tabBarLabel
          const getLabel = () => {
            switch (route.name) {
              case 'Menu': return 'Menú';
              case 'Lista': return 'Lista';
              case 'Almacen': return 'Almacén';
              case 'Configuracion': return 'Configuración';
              default: return '';
            }
          };

          return (
            <TabBarIcon 
              focused={focused} 
              name={iconName} 
              size={iconSize}
              label={getLabel()}
            />
          );
        },
      })}
      sceneAnimationEnabled={true}
      animationEnabled={true}
    >
      <Tab.Screen 
        name="Menu" 
        component={Menu} 
        options={{ tabBarLabel: 'Menú' }}
      />
      <Tab.Screen 
        name="Lista" 
        component={Lista} 
        options={{ tabBarLabel: 'Lista' }}
      />
      <Tab.Screen 
        name="Almacen" 
        component={Almacen} 
        options={{ tabBarLabel: 'Almacén' }}
      />
      <Tab.Screen 
        name="Configuracion" 
        component={Configuracion} 
        options={{ tabBarLabel: 'Configuración' }}
      />
    </Tab.Navigator>
  );
}

// Estilos específicos para iPhone
const styles = {
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  
  iconBackground: {
    width: Platform.OS === 'ios' ? 52 : 48,
    height: Platform.OS === 'ios' ? 52 : 48,
    borderRadius: Platform.OS === 'ios' ? 26 : 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  
  iconBackgroundFocused: {
    backgroundColor: Platform.OS === 'ios' ? '#007AFF15' : '#007AFF10',
  },
  
  tabBarLabel: {
    fontSize: Platform.OS === 'ios' ? 11 : 10,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
};
