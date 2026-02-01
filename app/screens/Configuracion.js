import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Image } from 'react-native'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Iconos SVG como componentes
const UserIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>👤</Text>
  </View>
)

const SecurityIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>🔒</Text>
  </View>
)

const SettingsIcon = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>⚙️</Text>
  </View>
)

const EditIcon = () => (
  <Text style={styles.editIconText}>✏️</Text>
)

const CloseIcon = () => (
  <Text style={styles.editIconText}>✕</Text>
)

const CheckIcon = () => (
  <Text style={styles.buttonIcon}>✓</Text>
)

const LoadingIcon = () => (
  <Text style={styles.buttonIcon}>⏳</Text>
)

const LogoutIcon = () => (
  <Text style={styles.logoutIcon}>🚪</Text>
)

export default function Configuracion({ navigation }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contraseñaActual, setContraseñaActual] = useState('')
  const [contraseñaNueva, setContraseñaNueva] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showNameForm, setShowNameForm] = useState(false)
  
  const [nombreFocused, setNombreFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [contraseñaActualFocused, setContraseñaActualFocused] = useState(false)
  const [contraseñaNuevaFocused, setContraseñaNuevaFocused] = useState(false)

  const cargarDatosUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nombre')
          .eq('id', user.id)
          .single()
        
        if (userData) {
          setNombre(userData.nombre || '')
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  useEffect(() => {
    cargarDatosUsuario()
  }, [])

  const actualizarNombre = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        Alert.alert('Error', 'No hay usuario autenticado')
        return
      }

      const { error } = await supabase
        .from('usuarios')
        .update({ nombre: nombre.trim() })
        .eq('id', user.id)

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar el nombre')
        return
      }

      Alert.alert('Éxito', 'Nombre actualizado correctamente', [
        { text: 'OK', onPress: () => setShowNameForm(false) }
      ])
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const actualizarEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'El email no puede estar vacío')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: email.trim()
      })

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar el email')
        return
      }

      Alert.alert('Éxito', 'Email actualizado. Revisa tu correo para confirmar el cambio', [
        { text: 'OK', onPress: () => setShowEmailForm(false) }
      ])
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const actualizarContraseña = async () => {
    if (!contraseñaNueva.trim()) {
      Alert.alert('Error', 'La nueva contraseña no puede estar vacía')
      return
    }

    if (contraseñaNueva.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: contraseñaNueva
      })

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar la contraseña')
        return
      }

      setContraseñaNueva('')
      Alert.alert('Éxito', 'Contraseña actualizada correctamente', [
        { text: 'OK', onPress: () => setShowPasswordForm(false) }
      ])
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const cerrarSesion = async () => {
    Alert.alert(
      'Confirmar cierre de sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut()
              navigation.navigate('Login')
            } catch (error) {
              console.error(error)
              Alert.alert('Error', 'No se pudo cerrar sesión')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftBox} />
        <View style={styles.centerBox}>
          <Text style={styles.headerTitle}>Configuración</Text>
        </View>
        <View style={styles.rightBox} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Perfil del Usuario */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {nombre ? nombre.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>{nombre || 'Usuario'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        {/* Información Personal */}
        <View style={styles.sectionHeader}>
          <UserIcon />
          <Text style={styles.sectionTitle}>Información Personal</Text>
        </View>
        
        <View style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Nombre de Usuario</Text>
              <Text style={styles.fieldValue}>{nombre}</Text>
            </View>
            <Pressable 
              style={styles.editButton}
              onPress={() => setShowNameForm(!showNameForm)}
            >
              {showNameForm ? <CloseIcon /> : <EditIcon />}
            </Pressable>
          </View>
          
          {showNameForm && (
            <View style={styles.editForm}>
              <TextInput
                style={[styles.input, nombreFocused && styles.inputFocused]}
                placeholder="Nuevo nombre"
                value={nombre}
                onChangeText={setNombre}
                onFocus={() => setNombreFocused(true)}
                onBlur={() => setNombreFocused(false)}
              />
              <View style={styles.buttonRow}>
                <Pressable 
                  style={[styles.cancelButton, { marginRight: 10 }]}
                  onPress={() => {
                    setShowNameForm(false)
                    cargarDatosUsuario()
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable 
                  style={[styles.updateButton, loading && { opacity: 0.6 }]}
                  onPress={actualizarNombre}
                  disabled={loading}
                >
                  <Text style={styles.updateButtonText}>
                    {loading ? <LoadingIcon /> : <CheckIcon />} Guardar
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Correo Electrónico</Text>
              <Text style={styles.fieldValue}>{email}</Text>
            </View>
            <Pressable 
              style={styles.editButton}
              onPress={() => setShowEmailForm(!showEmailForm)}
            >
              {showEmailForm ? <CloseIcon /> : <EditIcon />}
            </Pressable>
          </View>
          
          {showEmailForm && (
            <View style={styles.editForm}>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                placeholder="Nuevo email"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.buttonRow}>
                <Pressable 
                  style={[styles.cancelButton, { marginRight: 10 }]}
                  onPress={() => {
                    setShowEmailForm(false)
                    cargarDatosUsuario()
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable 
                  style={[styles.updateButton, loading && { opacity: 0.6 }]}
                  onPress={actualizarEmail}
                  disabled={loading}
                >
                  <Text style={styles.updateButtonText}>
                    {loading ? <LoadingIcon /> : <CheckIcon />} Guardar
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Seguridad */}
        <View style={styles.sectionHeader}>
          <SecurityIcon />
          <Text style={styles.sectionTitle}>Seguridad</Text>
        </View>
        
        <View style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <Text style={styles.fieldValue}>••••••••</Text>
            </View>
            <Pressable 
              style={styles.editButton}
              onPress={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? <CloseIcon /> : <EditIcon />}
            </Pressable>
          </View>
          
          {showPasswordForm && (
            <View style={styles.editForm}>
              <TextInput
                style={[styles.input, contraseñaNuevaFocused && styles.inputFocused]}
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                value={contraseñaNueva}
                onChangeText={setContraseñaNueva}
                onFocus={() => setContraseñaNuevaFocused(true)}
                onBlur={() => setContraseñaNuevaFocused(false)}
                secureTextEntry
              />
              <View style={styles.buttonRow}>
                <Pressable 
                  style={[styles.cancelButton, { marginRight: 10 }]}
                  onPress={() => {
                    setShowPasswordForm(false)
                    setContraseñaNueva('')
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable 
                  style={[styles.updateButton, loading && { opacity: 0.6 }]}
                  onPress={actualizarContraseña}
                  disabled={loading}
                >
                  <Text style={styles.updateButtonText}>
                    {loading ? <LoadingIcon /> : <CheckIcon />} Actualizar
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.sectionHeader}>
          <SettingsIcon />
          <Text style={styles.sectionTitle}>Acciones</Text>
        </View>
        
        <View style={styles.actionContainer}>
          <Pressable style={styles.logoutButton} onPress={cerrarSesion}>
            <LogoutIcon />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  header: {
    backgroundColor: '#0078d4',
    paddingTop: 50,
    paddingBottom: 20,
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
    width: 50,
  },

  backArrow: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  // Perfil Card
  profileCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 1,
    borderColor: '#eee',
  },

  avatarContainer: {
    marginBottom: 15,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0078d4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0078d4',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },

  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },

  profileEmail: {
    fontSize: 14,
    color: '#666',
  },

  // Secciones
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
    marginTop: 10,
  },

  // Field Container
  fieldContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },

  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fafafa',
  },

  fieldInfo: {
    flex: 1,
  },

  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  fieldValue: {
    fontSize: 14,
    color: '#666',
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0078d4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0078d4',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  editButtonText: {
    fontSize: 18,
  },

  // Edit Form
  editForm: {
    padding: 20,
    backgroundColor: '#fff',
  },

  input: {
    width: '100%',
    height: 44,
    borderWidth: 0,
    borderRadius: 0,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'transparent',
    color: '#222',
    fontSize: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#605e5c',
  },

  inputFocused: {
    borderBottomColor: '#0078d4',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  updateButton: {
    backgroundColor: '#0078d4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#0078d4',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonIcon: {
    fontSize: 16,
    marginRight: 5,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },

  icon: {
    marginRight: 10,
  },

  iconText: {
    fontSize: 20,
  },

  // Logout Button
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    flexDirection: 'row',
    justifyContent: 'center',
  },

  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Action Container
  actionContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
})