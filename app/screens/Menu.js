import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";

export default function Menu({ navigation }) {
  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        
        {/* Flecha izquierda */}
        <Pressable onPress={() => navigation.goBack()} style={styles.leftBox}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        {/* Título centrado */}
        <View style={styles.centerBox}>
          <Text style={styles.headerTitle}>мумєηυ</Text>
        </View>

        {/* Caja vacía para equilibrar el layout */}
        <View style={styles.rightBox} />

      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Bienvenido</Text>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  header: {
    backgroundColor: 'rgba(48, 163, 58, 0.85)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftBox: {
    width: 50,
    justifyContent: 'center',
  },

  centerBox: {
    flex: 1,
    alignItems: 'center',
  },

  rightBox: {
    width: 50, // equilibra la flecha
  },

  backArrow: {
    fontSize: 34,      // flecha más grande
    fontWeight: 'bold',
    color: '#22222',
  },

  headerTitle: {
    color: '#22222',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  content: {
    padding: 20,
  },

  welcome: {
    fontSize: 28,
    color: '#22222',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
});