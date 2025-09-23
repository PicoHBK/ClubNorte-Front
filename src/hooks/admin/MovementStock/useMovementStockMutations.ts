import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { MovementStockCreateData } from "./movementStockType";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllProducts", 
  "ProductGetById",
  "searchProductsByName",
  "searchProductsByCode",
  "ProductsGetByCategory",
  "getAllMovements"
];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para crear movimiento de stock
const createMovementStock = async (
  formData: MovementStockCreateData
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/movement_stock/move",
    formData,
    { withCredentials: true }
  );
  return data;
};

export const useMovementStockMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear movimiento
  const createMutation = useMutation({
    mutationFn: createMovementStock,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Movimiento de stock creado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear movimiento de stock:", errorMessage);
    },
  });

  return {
    // Función de mutación
    createMovementStock: createMutation.mutate,
    
    // Estado de loading
    isCreating: createMutation.isPending,
    
    // Estado de éxito
    isCreated: createMutation.isSuccess,
    
    // Error
    createError: createMutation.error,
    
    // Función de reset (para limpiar estados)
    resetCreateState: createMutation.reset,
    
    // Mutación completa (por si necesitas más control)
    createMutation,
  };
};