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

const { width, height } = Dimensions.get("window");

export default function Almacen({ navigation }) {
  const [selectedStorage, setSelectedStorage] = useState('nevera');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    expiryDate: '',
    quantity: '',
    storage: selectedStorage // Usar el almacenamiento seleccionado actualmente
  });

  const formatExpiryDate = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 8 digits (DDMMYYYY)
    const limited = cleaned.slice(0, 8);
    
    // Add slashes: DD/MM/YYYY
    let formatted = limited;
    if (limited.length > 2) {
      formatted = limited.slice(0, 2) + '/' + limited.slice(2);
    }
    if (limited.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + limited.slice(4);
    }
    
    return formatted;
  };

  const handleExpiryDateChange = (text) => {
    const formatted = formatExpiryDate(text);
    setNewItem({...newItem, expiryDate: formatted});
  };

  const openAddModal = () => {
    setNewItem({
      name: '',
      expiryDate: '',
      quantity: '',
      storage: selectedStorage // Establecer el almacenamiento seleccionado actualmente
    });
    setShowAddModal(true);
  };

  const addDetailedItem = () => {
    if (newItem.name.trim() !== '') {
      setNewItem({
        name: '',
        expiryDate: '',
        quantity: '',
        storage: selectedStorage
      });
      setShowAddModal(false);
    }
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
      
      <View style={styles.storageContainer}>
        <Pressable 
          style={[
            styles.storageBox,
            selectedStorage === 'nevera' && styles.selectedStorage
          ]}
          onPress={() => setSelectedStorage('nevera')}
        >
          <Text style={[
            styles.storageTitle,
            selectedStorage === 'nevera' && styles.selectedStorageText
          ]}>
            Nevera
          </Text>
          {selectedStorage === 'nevera' && (
            <View style={styles.selectedIndicator} />
          )}
        </Pressable>
        
        <Pressable 
          style={[
            styles.storageBox,
            selectedStorage === 'arcon' && styles.selectedStorage
          ]}
          onPress={() => setSelectedStorage('arcon')}
        >
          <Text style={[
            styles.storageTitle,
            selectedStorage === 'arcon' && styles.selectedStorageText
          ]}>
            Arcon
          </Text>
          {selectedStorage === 'arcon' && (
            <View style={styles.selectedIndicator} />
          )}
        </Pressable>
        
        <Pressable 
          style={[
            styles.storageBox,
            selectedStorage === 'despensa' && styles.selectedStorage
          ]}
          onPress={() => setSelectedStorage('despensa')}
        >
          <Text style={[
            styles.storageTitle,
            selectedStorage === 'despensa' && styles.selectedStorageText
          ]}>
            Despensa
          </Text>
          {selectedStorage === 'despensa' && (
            <View style={styles.selectedIndicator} />
          )}
        </Pressable>
      </View>
      
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.buttonsContainer}>
          <Pressable style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>Ver todos los alimentos</Text>
          </Pressable>
          
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>Añadir alimento</Text>
          </Pressable>
        </View>
      </ScrollView>

      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Alimento</Text>
              <Pressable style={styles.closeButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del alimento</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej: Manzanas"
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({...newItem, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fecha de caducidad</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="DD/MM/YYYY"
                  value={newItem.expiryDate}
                  onChangeText={handleExpiryDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cantidad</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej: 500g"
                  value={newItem.quantity}
                  onChangeText={(text) => setNewItem({...newItem, quantity: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Almacenamiento</Text>
                <View style={styles.storageSelector}>
                  {['nevera', 'arcon', 'despensa'].map((storage) => (
                    <Pressable
                      key={storage}
                      style={[
                        styles.storageOption,
                        newItem.storage === storage && styles.selectedStorageOption
                      ]}
                      onPress={() => setNewItem({...newItem, storage})}
                    >
                      <Text style={[
                        styles.storageOptionText,
                        newItem.storage === storage && styles.selectedStorageText
                      ]}>
                        {storage === 'nevera' ? 'Nevera' : storage === 'arcon' ? 'Arcon' : 'Despensa'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={addDetailedItem}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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

  storageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  storageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width > 400 ? 20 : 16,
    paddingHorizontal: width > 400 ? 20 : 15,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    minWidth: width > 400 ? 100 : 80,
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    flex: 1,
  },

  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff9800',
  },

  selectedStorage: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  storageTitle: {
    fontSize: width > 400 ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  selectedStorageText: {
    color: '#ff9800',
    fontWeight: 'bold',
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },

  viewAllButton: {
    backgroundColor: '#2f695a',
    paddingVertical: width > 400 ? 16 : 14,
    paddingHorizontal: width > 400 ? 24 : 20,
    borderRadius: width > 400 ? 12 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2f695a',
    shadowOpacity: 0.3,
    shadowRadius: width > 400 ? 8 : 6,
    shadowOffset: { width: 0, height: 4 },
    flex: 1,
    marginRight: 10,
    maxWidth: 200,
  },

  viewAllButtonText: {
    color: '#fff',
    fontSize: width > 400 ? 16 : 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  addButton: {
    backgroundColor: '#ff9800',
    paddingVertical: width > 400 ? 16 : 14,
    paddingHorizontal: width > 400 ? 24 : 20,
    borderRadius: width > 400 ? 12 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff9800',
    shadowOpacity: 0.3,
    shadowRadius: width > 400 ? 8 : 6,
    shadowOffset: { width: 0, height: 4 },
    flex: 1,
    marginLeft: 10,
    maxWidth: 200,
  },

  addButtonText: {
    color: '#fff',
    fontSize: width > 400 ? 16 : 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: width > 400 ? 20 : 15,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: width > 400 ? 20 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  modalTitle: {
    fontSize: width > 400 ? 20 : 18,
    fontWeight: 'bold',
    color: '#2f695a',
  },

  closeButton: {
    width: width > 400 ? 30 : 25,
    height: width > 400 ? 30 : 25,
    borderRadius: width > 400 ? 15 : 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: width > 400 ? 16 : 14,
    color: '#666',
    fontWeight: 'bold',
  },

  modalContent: {
    padding: width > 400 ? 20 : 15,
    maxHeight: 400,
  },

  inputGroup: {
    marginBottom: width > 400 ? 20 : 15,
  },

  inputLabel: {
    fontSize: width > 400 ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: width > 400 ? 10 : 8,
    padding: width > 400 ? 12 : 10,
    fontSize: width > 400 ? 16 : 14,
    backgroundColor: '#f8f9fa',
  },

  storageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  storageOption: {
    flex: 1,
    padding: width > 400 ? 12 : 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: width > 400 ? 8 : 6,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#f8f9fa',
  },

  selectedStorageOption: {
    backgroundColor: 'transparent',
    borderColor: '#ff9800',
    borderWidth: 2,
  },

  storageOptionText: {
    fontSize: width > 400 ? 14 : 12,
    color: '#666',
    fontWeight: '500',
  },

  selectedStorageText: {
    color: '#ff9800',
    fontWeight: 'bold',
  },

  modalActions: {
    flexDirection: 'row',
    padding: width > 400 ? 20 : 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'space-between',
  },

  cancelButton: {
    flex: 1,
    padding: width > 400 ? 12 : 10,
    borderRadius: width > 400 ? 10 : 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginRight: 10,
  },

  cancelButtonText: {
    fontSize: width > 400 ? 16 : 14,
    color: '#666',
    fontWeight: '600',
  },

  saveButton: {
    flex: 1,
    padding: width > 400 ? 12 : 10,
    borderRadius: width > 400 ? 10 : 8,
    backgroundColor: '#2f695a',
    alignItems: 'center',
    marginLeft: 10,
  },

  saveButtonText: {
    fontSize: width > 400 ? 16 : 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});
