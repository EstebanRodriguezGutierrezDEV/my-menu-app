import { supabase } from "../supabase";

export const recetasService = {
  /**
   * Obtiene todas las recetas de la base de datos
   */
  async getAllRecipes() {
    const { data: recetas, error: recetasError } = await supabase
      .from("recetas")
      .select("*");

    if (recetasError) {
      return { recetas: null, error: recetasError };
    }

    const { data: videos } = await supabase.from("videos").select("*");

    // Mappear si hay videos
    const mappedRecipes = recetas.map((recipe) => {
      const video = videos?.find(
        (v) => v.receta_id === recipe.id || v.id_receta === recipe.id,
      );
      return {
        ...recipe,
        youtube_url: video?.url || video?.youtube_url || recipe.youtube_url,
      };
    });

    return { recetas: mappedRecipes, error: null };
  },
};
