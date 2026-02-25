# 𝓜𝔂𝓜𝓮𝓷𝓾 🍽️

**MyMenu** es una aplicación móvil premium diseñada para gestionar tu cocina de forma inteligente. Con ella podrás organizar tus recetas favoritas, controlar la caducidad de tus alimentos y generar listas de la compra profesionales en formato PDF.

---

## ✨ Características Principales

### 📦 Gestión de Almacén (Smart Inventory)

- Controla el inventario de tu despensa, nevera o congelador.
- **Alertas de Caducidad**: Sistema de colores y notificaciones para alimentos próximos a caducar.
- Filtros rápidos por estado de conservación.

### 📜 Carta de Recetas e Integración con YouTube

- Explora una amplia variedad de recetas filtradas por dificultad (Fácil, Medio, Difícil).
- **Video Tutoriales**: Botón directo para ver la preparación de cada plato en YouTube.
- Buscador inteligente de recetas.

### 🛒 Lista de la Compra Inteligente

- Añade ingredientes directamente desde las recetas o añade productos personalizados.
- **Exportación a PDF**: Genera un documento profesional para compartir o imprimir tu lista.
- Sincronización en tiempo real.

### 🔐 Seguridad y Personalización

- Autenticación segura mediante **Supabase**.
- Perfil de usuario personalizable.
- Diseño visual premium con modo oscuro nativo y animaciones fluidas.

---

## 🚀 Tecnologías Utilizadas

- **Core**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **Base de Datos & Auth**: [Supabase](https://supabase.com/)
- **Navegación**: React Navigation (Stacked & Bottom Tabs)
- **UI/UX**: Arquitectura de estilos con `StyleSheet` (Premium Visual Concept)
- **Documentación**: `expo-print` & `expo-sharing` para gestión de PDFs
- **Notificaciones**: `expo-notifications`

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd my-menu-app
   ```

2. **Instalar dependencias una a una**

   **Navegación:**

   ```bash
   npx expo install @react-navigation/native
   npx expo install @react-navigation/native-stack
   npx expo install @react-navigation/bottom-tabs
   ```

   **Base de Datos y Autenticación:**

   ```bash
   npx expo install @supabase/supabase-js
   ```

   **Notificaciones:**

   ```bash
   npx expo install expo-notifications
   ```

   **Impresión y PDF:**

   ```bash
   npx expo install expo-print
   npx expo install expo-sharing
   ```

   **Utilidades y UI:**

   ```bash
   npx expo install react-native-safe-area-context
   npx expo install react-native-screens
   npx expo install @expo/vector-icons
   ```

3. **Configurar Supabase**
   Crea un archivo de configuración en `app/lib/supabase.js` (o variables de entorno) con tus credenciales.

4. **Lanzar la aplicación**
   ```bash
   npx expo start
   ```

---

## 📂 Estructura del Proyecto

- `app/screens/`: Pantallas principales de la aplicación (Menu, Almacen, Lista, Login, etc.).
- `app/navigation/`: Configuración de la navegación por pestañas y stacks.
- `app/assets/`: Recursos gráficos, logos y fondos.
- `app/lib/`: Configuración del cliente de Supabase.

---

## 👨‍💻 Desarrollo

Este proyecto utiliza un enfoque de **estilos inline optimizados** para garantizar el máximo rendimiento y consistencia visual en cada pantalla, evitando dependencias externas innecesarias para el diseño.
