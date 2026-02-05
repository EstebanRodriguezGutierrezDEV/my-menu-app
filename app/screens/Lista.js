import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const { width } = Dimensions.get("window");

export default function Lista({ navigation }) {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("lista_compra")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching items:", error);
      Alert.alert("Error cargando lista", error.message);
    } else {
      setItems(data);
    }
  };

  const addItem = async () => {
    if (text.trim() === "") return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("lista_compra")
      .insert({
        user_id: user.id,
        name: text.trim(),
        is_checked: false,
      });

    if (error) {
      Alert.alert("Error", "No se pudo añadir el alimento");
      console.error(error);
    } else {
      setText("");
      fetchItems();
    }
  };

  const deleteAllItems = async () => {
    if (items.length === 0) return;

    Alert.alert(
      "Eliminar todo",
      "Seguro que quieres borrar toda la lista?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar todo",
          style: "destructive",
          onPress: async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
              Alert.alert("Error", "No estas autenticado");
              return;
            }

            const { error } = await supabase
              .from("lista_compra")
              .delete()
              .eq("user_id", user.id);

            if (error) {
              Alert.alert("Error", "No se pudo borrar la lista: " + error.message);
            } else {
              fetchItems();
            }
          },
        },
      ]
    );
  };

  const deleteItem = async (id) => {

    Alert.alert(
      "Eliminar producto",
      "¿Estás seguro de que quieres eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              Alert.alert("Error", "No estás autenticado");
              return;
            }

            const { error, count } = await supabase
              .from("lista_compra")
              .delete({ count: "exact" })
              .eq("id", id)
              .eq("user_id", user.id);

            if (error) {
              Alert.alert("Error", "No se pudo eliminar el producto: " + error.message);
            } else if (count === 0) {
              Alert.alert(
                "Error",
                "No se borró ningún elemento. Puede que no tengas permisos."
              );
              fetchItems();
            } else {
              fetchItems();
            }
          },
        },
      ]
    );
  };

  const generatePDF = async () => {
    if (items.length === 0) {
      Alert.alert("Lista vacía", "No hay elementos para generar el PDF.");
      return;
    }

    const dateStr = new Date().toLocaleDateString("es-ES");


    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 24px;
              background: #f5f7fb;
              color: #1f2a44;
            }
            .card {
              background: #ffffff;
              border-radius: 16px;
              padding: 24px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            }
            .title {
              margin: 0 0 4px 0;
              text-align: center;
              color: #0078d4;
              font-size: 28px;
            }
            .meta {
              text-align: center;
              color: #6b7280;
              font-size: 13px;
              margin-bottom: 16px;
            }
            .summary {
              background: #eef6ff;
              border: 1px solid #cfe4ff;
              color: #0b3d91;
              padding: 10px 12px;
              border-radius: 10px;
              font-size: 14px;
              margin-bottom: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 16px;
            }
            th, td {
              padding: 12px 10px;
              border-bottom: 1px solid #eef0f4;
            }
            th {
              text-align: left;
              color: #6b7280;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            .check {
              width: 18px;
              height: 18px;
              border: 2px solid #1f2a44;
              border-radius: 4px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="title">Lista de la compra</h1>
            <div class="meta">${dateStr}</div>
            <div class="summary">Total de productos: ${items.length}</div>
            <table>
              <thead>
                <tr>
                  <th>Hecho</th>
                  <th>Producto</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td><span class="check"></span></td>
                    <td>${item.name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo generar o compartir el PDF");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftBox} />
        <View style={styles.centerBox}>
          <Text style={styles.headerTitle}>мумєηυ</Text>
        </View>
        <View style={styles.rightBox} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerContent}>
          <Text style={styles.welcome}>Mylista de la compra</Text>
          <Text style={styles.subtitle}>
            Añade los alimentos que necesitas comprar
          </Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="📝 Escribe un alimento..."
              value={text}
              onChangeText={setText}
              onSubmitEditing={addItem}
            />
            <Pressable style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemWrapper}>
              <View style={styles.item}>
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
              
              <Pressable 
                style={styles.deleteButton} 
                onPress={() => deleteItem(item.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No hay alimentos en tu lista</Text>
            <Text style={styles.emptySubtext}>
              Añade tu primer alimento arriba
            </Text>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.actionsRow}>
            <Pressable style={styles.deleteAllButton} onPress={deleteAllItems}>
              <Text style={styles.deleteAllButtonText}>Eliminar todo</Text>
            </Pressable>
            <Pressable style={styles.pdfButton} onPress={generatePDF}>
              <Text style={styles.pdfButtonText}> Generar PDF y Compartir</Text>
            </Pressable>
          </View>
        )}
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
    backgroundColor: "#0078d4",
    paddingTop: 50,
    paddingBottom: 20,
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

  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  headerContent: {
    alignItems: "center",
    marginBottom: 30,
  },

  welcome: {
    fontSize: 32,
    color: "#0078d4",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  inputCard: {
    backgroundColor: "#fff",
    borderRadius: width > 400 ? 15 : 12,
    padding: width > 400 ? 15 : 12,
    marginBottom: width > 400 ? 25 : 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: width > 400 ? 10 : 6,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },

  input: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },

  addButton: {
    backgroundColor: "#0078d4",
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#0078d4",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  itemsContainer: {
    marginBottom: 20,
  },

  itemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginRight: 10,
  },
  
  deleteButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  
  deleteIcon: {
    fontSize: 20,
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  itemText: {
    flex: 1,
    fontSize: width > 400 ? 16 : 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: width > 400 ? 8 : 6,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: width > 400 ? 40 : 30,
  },

  emptyEmoji: {
    fontSize: width > 400 ? 60 : 50,
    marginBottom: width > 400 ? 15 : 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: width > 400 ? 18 : 16,
    fontWeight: "500",
    marginBottom: 5,
  },

  emptySubtext: {
    textAlign: "center",
    color: "#bbb",
    fontSize: width > 400 ? 14 : 12,
  },

  actionsRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  deleteAllButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },

  deleteAllButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  pdfButton: {
    backgroundColor: "#0078d4",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#0078d4",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
    width: "100%",
  },

  pdfButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },


});
