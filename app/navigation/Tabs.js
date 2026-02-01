import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import Menu from '../screens/Menu';
import Lista from '../screens/Lista';
import Configuracion from '../screens/Configuracion';
import Almacen from '../screens/Almacen';

const Tab = createBottomTabNavigator();

// Componente personalizado para iconos con efecto de iPhone
function TabBarIcon({ focused, name, size, IconComponent = Ionicons }) {
  return (
    <View style={styles.iconContainer}>
      <View style={[
        styles.iconBackground,
        focused && styles.iconBackgroundFocused
      ]}>
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
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.95)' : '#ffffff',
          borderRadius: 35,
          height: 70,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: 0,
        },

        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        
        tabBarItemStyle: {
          height: 70,
          paddingVertical: 0, 
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 15,
        },

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = 24;
          let IconComponent = Ionicons;

          switch (route.name) {
            case 'Menu':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;

            case 'Lista':
              iconName = focused ? 'cart' : 'cart-outline';
              break;

            case 'Almacen':
              IconComponent = MaterialCommunityIcons;
              iconName = focused ? 'fridge' : 'fridge-outline';
              iconSize = 26;
              break;

            case 'Configuracion':
              iconName = focused ? 'settings' : 'settings-outline';
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

const styles = {
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  
  iconBackground: {
    width: Platform.OS === 'ios' ? 44 : 40,
    height: Platform.OS === 'ios' ? 44 : 40,
    borderRadius: Platform.OS === 'ios' ? 22 : 20,
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
