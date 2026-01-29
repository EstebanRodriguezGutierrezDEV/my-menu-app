import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";

export default function Menu({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.leftBox}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.centerBox}>
          <Text style={styles.headerTitle}>мумєηυ</Text>
        </View>

        <View style={styles.rightBox} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Echale un vistazo a nuestra carta</Text>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Cesar.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Ensalada César</Text>

          <Text style={styles.productIngredients}>
            Lechuga, pollo, queso parmesano, salsa césar, picatostes
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/PizzaJamon.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Pizza Jamón York y queso</Text>

          <Text style={styles.productIngredients}>
            Masa, salsa de tomate, jamón york, queso mozzarella
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Bravas.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Patatas bravioli</Text>

          <Text style={styles.productIngredients}>
            Patatas, salsa brava, ajo, perejil, salsa alioli
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Albondigas.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Albondigas</Text>

          <Text style={styles.productIngredients}>
            Albondigas, salsa de tomate, ajo, perejil
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/CocidoMadrileño.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Cocido Madrileño</Text>

          <Text style={styles.productIngredients}>
            Garbanzos, chorizo, morcilla, ternera, patatas, zanahoria, pimiento, ajo, perejil, hueso de jamón, hueso de caña 
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        
        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Tortelini.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Tortelini</Text>

          <Text style={styles.productIngredients}>
            Pasta fresca, espinacas, queso, sal, pimienta
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Hamburguesa.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Hamburguesa</Text>

          <Text style={styles.productIngredients}>
            Pan, carne, lechuga, pepinillos, tomate, queso, salsa de queso
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/CafeHelado.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Café Helado</Text>

          <Text style={styles.productIngredients}>
            Café, leche, hielo, azúcar, nata, sirope de chocolate, cacao
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Shushi.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Sushi de langostino frito</Text>

          <Text style={styles.productIngredients}>
            Langostino, panco, arroz, alga nori, aguacate
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Lentejas.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Lentejas</Text>

          <Text style={styles.productIngredients}>
            Lentejas, cebolla, ajo, pimentón, paprika, aceite de oliva, sal, pimienta, morcilla, chorizo, jamon
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

        <Pressable
          style={({ hovered, pressed }) => [
            styles.productCard,
            hovered && styles.cardHover,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/platos/Pella.png")}
              style={styles.productImage}
            />
          </View>

          <Text style={styles.productTitle}>Paella</Text>

          <Text style={styles.productIngredients}>
            Arroz, mariscos, pimentón, azafrán, aceite de oliva, sal, pimienta
          </Text>

          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </Pressable>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    backgroundColor: "#2f695a",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  leftBox: {
    width: 50,
    justifyContent: "center",
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
  },

  rightBox: {
    width: 50,
  },

  backArrow: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  content: {
    padding: 20,
  },

  welcome: {
    fontSize: 28,
    color: "#2f695a",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  productCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#eee",
  },

  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },

  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#222",
  },

  productIngredients: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },

  addButton: {
    backgroundColor: "#f93",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  cardHover: {
    backgroundColor: "#f0f0f0",
  },

  cardPressed: {
    opacity: 0.7,
  },
});
