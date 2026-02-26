import { supabase } from "../supabase";

export const alimentoService = {
  /**
   * Obtiene la lista de alimentos para un usuario específico (para el widget de Bienvenida o global).
   * @param {string} userId
   */
  async getAlimentosPorUsuario(userId) {
    const { data, error } = await supabase
      .from("alimentos")
      .select("nombre, fecha_caducidad")
      .eq("user_id", userId);

    return { alimentos: data, error };
  },

  /**
   * Obtiene todos los alimentos de un almacén concreto, ordenados por caducidad.
   */
  async getAlimentosPorAlmacen(storageType) {
    const { data, error } = await supabase
      .from("alimentos")
      .select("*")
      .eq("almacenamiento", storageType)
      .order("fecha_caducidad", { ascending: true });

    return { data, error };
  },

  /**
   * Obtiene absolutamente todos los alimentos del usuario actual
   */
  async getAllUserFoods(userId) {
    const { data, error } = await supabase
      .from("alimentos")
      .select("nombre")
      .eq("user_id", userId);

    return { data, error };
  },

  /**
   * Añade un nuevo alimento al inventario
   */
  async addFood(payload) {
    const { error } = await supabase.from("alimentos").insert([payload]);
    return { error };
  },

  /**
   * Elimina un alimento de un usuario
   */
  async deleteFood(id, userId) {
    const { error } = await supabase
      .from("alimentos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    return { error };
  },

  /**
   * Marca un alimento como notificado
   */
  async markAsNotified(id) {
    const { error } = await supabase
      .from("alimentos")
      .update({ notificado: true })
      .eq("id", id);
    return { error };
  },
};
