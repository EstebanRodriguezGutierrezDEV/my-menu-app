import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

export default function Home({ navigation }) {

    const handleMenu = () => {
    navigation.navigate('Menu');
  };
  const handleLista = () => {
    navigation.navigate('Lista');
  };
  const handleAlmacen = () => {
    navigation.navigate('Almacen');
  };

  
  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>мумєηυ</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Bienvenido</Text>
        <Text style={styles.subtitle}>¿Qué deseas hacer hoy?</Text>

        
        <Pressable
          onPress={handleMenu}
          style={({ hovered, pressed }) => [
            styles.card,
            hovered && styles.cardHover,
            pressed && styles.cardPressed
          ]}
        >
          <Text style={styles.cardTitle}>Ver MyMenu</Text>
          <Text style={styles.cardText}>Explora los platos que tenemos en nuestra carta y hazlos segun el nivel.</Text>
        </Pressable>

        
        <Pressable
          onPress={handleLista}
          style={({ hovered, pressed }) => [
            styles.card,
            hovered && styles.cardHover,
            pressed && styles.cardPressed
          ]}
        >
          <Text style={styles.cardTitle}>My lista de la compra</Text>
          <Text style={styles.cardText}>Revisa lo que te falta por comprar y haz tu propia lista de la compra con solo un botón.</Text>
        </Pressable>

        
        <Pressable
          onPress={handleAlmacen}
          style={({ hovered, pressed }) => [
            styles.card,
            hovered && styles.cardHover,
            pressed && styles.cardPressed
          ]}
        >
          <Text style={styles.cardTitle}>MyAlmacén</Text>
          <Text style={styles.cardText}>Revisa lo que tienes en la nevera, en el arcon y en tu despensa. Vamos a aprovecharlo antes de que se pongan malos.</Text>
        </Pressable>

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
    backgroundColor: '#2f695a',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  headerTitle: {
    color: '#fff',
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

  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#eee',
  },

  cardHover: {
    backgroundColor: '#f0f0f0',
  },

  cardPressed: {
    opacity: 0.7,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  cardText: {
    fontSize: 14,
    color: '#555',
  },
});