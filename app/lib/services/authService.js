import { supabase } from "../supabase";

export const authService = {
  /**
   * Inicia sesión con correo y contraseña.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: any, session: any, error: any}>}
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  },

  /**
   * Crea un nuevo usuario.
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @returns {Promise<{user: any, error: any}>}
   */
  async register(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: name,
        },
      },
    });
    return { user: data.user, session: data.session, error };
  },

  /**
   * Cierra la sesión activa.
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Obtiene la sesión actual (si existe).
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  /**
   * Escucha los cambios de estado de autenticación de forma global.
   * @param {Function} callback
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
