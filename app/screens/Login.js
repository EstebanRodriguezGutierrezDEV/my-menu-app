import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  TextInput,
  Alert,
} from 'react-native'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ navigation }) {
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (loading) return

    if (!email || !contraseña) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: contraseña,
      })

      if (error) {
        Alert.alert('Error', 'Correo o contraseña incorrectos')
        return
      }

      const { data } = await supabase.auth.getUser()
      
      if (data?.user) {
        const { data: alimentos } = await supabase
          .from('alimentos')
          .select('nombre, fecha_caducidad')
          .eq('user_id', data.user.id)

        if (alimentos) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const expiringCount = alimentos.filter((item) => {
            if (!item.fecha_caducidad) return false
            const parts = item.fecha_caducidad.split('-')
            if (parts.length !== 3) return false
            
            const year = parseInt(parts[0], 10)
            const month = parseInt(parts[1], 10) - 1
            const day = parseInt(parts[2], 10)
            
            const expiry = new Date(year, month, day)
            const diff = expiry - today
            const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
            
            return daysLeft <= 3
          }).length

          if (expiringCount > 0) {
            Alert.alert(
              '¡Atención!',
              `Tienes ${expiringCount} producto(s) a punto de caducar o caducados.`,
              [{ text: 'Entendido', onPress: () => navigation.replace('MainTabs') }]
            )
            return
          }
        }
      }

      // ✅ LOGIN CORRECTO → ENTRAMOS A LAS TABS
      navigation.replace('MainTabs')

    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>мумєηυ</Text>

          <Text style={styles.subtitle1}>Iniciar Sesión:</Text>

          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, passwordFocused && styles.inputFocused]}
            placeholder="Contraseña"
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              loading && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </Text>
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.subtitle2}>¿No tienes cuenta? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Crea una.</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 40,
    borderRadius: 8,
    elevation: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 30,
    color: '#222',
    textAlign: 'center',
  },

  subtitle1: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },

  subtitle2: {
    fontSize: 14,
    color: '#666',
  },

  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignSelf: 'center',
  },

  registerLink: {
    color: '#0078d4',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  input: {
    width: '100%',
    height: 44,
    padding: 12,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#605e5c',
    fontSize: 14,
  },

  inputFocused: {
    borderBottomColor: '#0078d4',
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    backgroundColor: '#0078d4',
    width: '100%',
    padding: 12,
    borderRadius: 4,
  },

  pressed: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
