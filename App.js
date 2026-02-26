import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import Acceso from "./app/screens/Acceso";
import Registro from "./app/screens/Registro";
import Tabs from "./app/navigation/Tabs";
import Bienvenida from "./app/screens/Bienvenida";
import { authService } from "./app/lib/services/authService";

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then(({ session }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#07131F",
        }}
      >
        <ActivityIndicator size="large" color="#4DA6FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="MainTabs" component={Tabs} />
        ) : (
          <>
            <Stack.Screen name="Bienvenida" component={Bienvenida} />
            <Stack.Screen name="Acceso" component={Acceso} />
            <Stack.Screen name="Registro" component={Registro} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
