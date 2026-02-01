import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { useState } from "react";

const { width, height } = Dimensions.get('window');

export default function Lista({ navigation }) {
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  const [haveItems, setHaveItems] = useState([]);

  const addItem = () => {
    if (text.trim() !== '') {
      setItems([...items, text.trim()]);
      setText('');
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setHaveItems(haveItems.filter((_, i) => i !== index));
  };

  const toggleHaveItem = (index) => {
    if (haveItems.includes(index)) {
      setHaveItems(haveItems.filter(i => i !== index));
    } else {
      setHaveItems([...haveItems, index]);
    }
  };

  const removeHaveItems = () => {
    setItems(items.filter((_, index) => !haveItems.includes(index)));
    setHaveItems([]);
  };

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
        <View style={styles.headerContent}>
          <Text style={styles.welcome}>Mylista de la compra</Text>
          <Text style={styles.subtitle}>Añade los alimentos que necesitas comprar</Text>
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
          {items.map((item, index) => (
            <Pressable 
              key={index} 
              style={[
                styles.item,
                haveItems.includes(index) && styles.haveItem
              ]}
              onPress={() => toggleHaveItem(index)}
            >
              <View style={styles.itemLeft}>
                <View style={[
                  styles.checkboxBox,
                  haveItems.includes(index) && styles.checkboxChecked
                ]}>
                  {haveItems.includes(index) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.itemText,
                  haveItems.includes(index) && styles.haveItemText
                ]}>
                  {item}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No hay alimentos en tu lista</Text>
            <Text style={styles.emptySubtext}>Añade tu primer alimento arriba</Text>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              📋 Total: {items.length} {items.length === 1 ? 'alimento' : 'alimentos'}
            </Text>
          </View>
        )}

        {haveItems.length > 0 && (
          <View style={styles.haveItemsActions}>
            <Text style={styles.haveItemsCount}>
              Tienes {haveItems.length} alimentos
            </Text>
            <Pressable style={styles.removeHaveButton} onPress={removeHaveItems}>
              <Text style={styles.removeHaveButtonText}>
                Eliminar alimentos que tengo
              </Text>
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

  backArrow: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
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

  headerContent: {
    alignItems: 'center',
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
    backgroundColor: '#fff',
    borderRadius: width > 400 ? 15 : 12,
    padding: width > 400 ? 15 : 12,
    marginBottom: width > 400 ? 25 : 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: width > 400 ? 10 : 6,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },

  input: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },

  addButton: {
    backgroundColor: '#0078d4',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#0078d4',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  itemsContainer: {
    marginBottom: 20,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  itemText: {
    flex: 1,
    fontSize: width > 400 ? 16 : 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: width > 400 ? 8 : 6,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: width > 400 ? 40 : 30,
  },

  emptyEmoji: {
    fontSize: width > 400 ? 60 : 50,
    marginBottom: width > 400 ? 15 : 12,
  },

  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: width > 400 ? 18 : 16,
    fontWeight: '500',
    marginBottom: 5,
  },

  emptySubtext: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: width > 400 ? 14 : 12,
  },

  summaryContainer: {
    backgroundColor: '#0078d4',
    borderRadius: width > 400 ? 15 : 12,
    padding: width > 400 ? 15 : 12,
    alignItems: 'center',
    shadowColor: '#0078d4',
    shadowOpacity: 0.3,
    shadowRadius: width > 400 ? 8 : 5,
    shadowOffset: { width: 0, height: 4 },
  },

  summaryText: {
    color: '#fff',
    fontSize: width > 400 ? 16 : 14,
    fontWeight: 'bold',
  },

  checkbox: {
    marginRight: width > 400 ? 12 : 10,
  },

  checkboxBox: {
    width: width > 400 ? 24 : 20,
    height: width > 400 ? 24 : 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: width > 400 ? 6 : 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  checkboxChecked: {
    backgroundColor: '#0078d4',
    borderColor: '#0078d4',
  },

  checkmark: {
    color: '#fff',
    fontSize: width > 400 ? 16 : 14,
    fontWeight: 'bold',
  },

  haveItem: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },

  haveItemText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },

  haveItemsActions: {
    alignItems: 'center',
    marginTop: 10,
  },

  haveItemsCount: {
    fontSize: width > 400 ? 16 : 14,
    color: '#4caf50',
    fontWeight: 'bold',
    marginBottom: 10,
  },

  removeHaveButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: width > 400 ? 12 : 10,
    paddingHorizontal: width > 400 ? 20 : 15,
    borderRadius: width > 400 ? 10 : 8,
    shadowColor: '#ff6b6b',
    shadowOpacity: 0.3,
    shadowRadius: width > 400 ? 5 : 3,
    shadowOffset: { width: 0, height: 2 },
  },

  removeHaveButtonText: {
    color: '#fff',
    fontSize: width > 400 ? 14 : 12,
    fontWeight: 'bold',
  },
});
