import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook para invalidar múltiples queries con React Query.
 *
 * @returns una función que recibe un array de keys y las invalida.
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  /**
   * Invalida todas las queries pasadas como keys.
   *
   * @param keys Lista de keys a invalidar
   */
  const invalidateQueries = async (keys: string[]) => {
    if (!Array.isArray(keys) || keys.length === 0) {
      console.warn("⚠️ Debes pasar al menos una key para invalidar.");
      return;
    }

    await Promise.all(
      keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
    );
  };

  return invalidateQueries;
};

export default useInvalidateQueries;
