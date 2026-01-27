import { View, Text, StyleSheet, Pressable, ImageBackground, TextInput } from 'react-native';
import { useState } from 'react';

export default function Register({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleRegister = () => {
    if (usuario.trim() !== '' && email.trim() !== '' && contraseña.trim() !== '') {
      navigation.navigate('Home');
    } else {
      alert('Por favor completa todos los campos');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>мумєηυ</Text>

          <Text style={styles.subtitle1}>𝓡𝓮𝓰𝓲𝓼𝓽𝓻𝓸:</Text>

          <Text style={styles.subtitle}>𝓤𝓼𝓾𝓪𝓻𝓲𝓸:</Text>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            value={usuario}
            onChangeText={setUsuario}
          />

          <Text style={styles.subtitle}>𝒞𝑜𝓇𝓇𝑒𝑜 𝐸𝓁𝑒𝒸𝓉𝓇ó𝓃𝒾𝒸𝑜:</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.subtitle}>𝒞𝑜𝓃𝓉𝓇𝒶𝓈𝑒ñ𝒶:</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry
          />

          <Pressable
            onPress={handleRegister}
            style={({ hovered, pressed }) => [
              styles.button,
              hovered && styles.hover,
              pressed && styles.pressed
            ]}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.subtitle2}>Ya tienes cuenta, </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerLink}>inicia sesión aquí.</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  formContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(48, 163, 58, 0.85)',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#1df700ff',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },

  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  subtitle1: {
    fontSize: 20,
    marginBottom: 20,
    alignSelf: 'flex-start',
    color: 'white',
    fontFamily: 'Arial',
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
    color: 'white',
    fontFamily: 'Arial',
  },

  subtitle2: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Arial',
  },

  registerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    alignSelf: 'center',
  },

  registerLink: {
    color: 'blue',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontFamily: 'Arial',
  },

  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'black',
    width: '100%',
    padding: 14,
    borderRadius: 8,
  },

  hover: {
    backgroundColor: 'greenyellow',
  },

  pressed: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});