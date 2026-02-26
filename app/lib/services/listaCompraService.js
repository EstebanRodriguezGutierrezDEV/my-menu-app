import { supabase } from "../supabase";

export const listaCompraService = {
  /**
   * Obtiene todos los elementos de la lista de compra de un usuario
   */
  async getItems(userId) {
    const { data, error } = await supabase
      .from("lista_compra")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    return { data, error };
  },

  /**
   * Añade un único elemento a la lista de compra
   */
  async addItem(userId, name) {
    const { error } = await supabase.from("lista_compra").insert({
      user_id: userId,
      name: name,
      is_checked: false,
    });
    return { error };
  },

  /**
   * Añade múltiples elementos a la lista de compra (usado desde Menu.js)
   */
  async addMultipleItems(userId, ingredientsString) {
    const itemsToAdd = ingredientsString
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const inserts = itemsToAdd.map((name) => ({
      user_id: userId,
      name,
      is_checked: false,
    }));

    const { error } = await supabase.from("lista_compra").insert(inserts);
    return { error, count: itemsToAdd.length };
  },

  /**
   * Elimina un único elemento
   */
  async deleteItem(id, userId) {
    const { error } = await supabase
      .from("lista_compra")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    return { error };
  },

  /**
   * Vacía la lista completa de un usuario
   */
  async deleteAllItems(userId) {
    const { error } = await supabase
      .from("lista_compra")
      .delete()
      .eq("user_id", userId);
    return { error };
  },
};
