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

export default function Register({ navigation }) {
  const [usuario, setUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [usuarioFocused, setUsuarioFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (loading) return

    if (!usuario || !email || !contraseña) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    if (contraseña.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: contraseña,
        options: {
          data: {
            nombre: usuario, // se guarda en metadata y lo usa el trigger
          },
        },
      })

      if (error) {
        Alert.alert('Error', error.message)
        return
      }

      Alert.alert(
        'Cuenta creada',
        'Registro exitoso. Revisa tu correo si es necesario.'
      )

      navigation.navigate('Login')

    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Error inesperado')
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

          <Text style={styles.subtitle1}>Crea tu cuenta en мумєηυ:</Text>

          <TextInput
            style={[styles.input, usuarioFocused && styles.inputFocused]}
            placeholder="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            onFocus={() => setUsuarioFocused(true)}
            onBlur={() => setUsuarioFocused(false)}
            autoCapitalize="none"
          />

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
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              loading && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Text>
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.subtitle2}>¿Ya tienes cuenta? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerLink}>Inicie sesión.</Text>
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
    fontSize: 24,
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
