import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { MovementStockCreateData, UpdateStockDepositData } from "./movementStockType";

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

// Función para actualizar stock en deposito
const updateStockDeposit = async (
  formData: UpdateStockDepositData
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    "/api/v1/deposit/update_stock",
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

  // Mutación para actualizar stock en deposito
  const updateStockMutation = useMutation({
    mutationFn: updateStockDeposit,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Stock de deposito actualizado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar stock de deposito:", errorMessage);
    },
  });

  return {
    // ===== Crear Movimiento =====
    // Función de mutación
    createMovementStock: createMutation.mutate,
    // Estado de loading
    isCreating: createMutation.isPending,
    // Estado de éxito
    isCreated: createMutation.isSuccess,
    // Error
    createError: createMutation.error,
    // Función de reset
    resetCreateState: createMutation.reset,
    // Mutación completa
    createMutation,

    // ===== Actualizar Stock Deposito =====
    // Función de mutación
    updateStockDeposit: updateStockMutation.mutate,
    // Estado de loading
    isUpdatingStock: updateStockMutation.isPending,
    // Estado de éxito
    isStockUpdated: updateStockMutation.isSuccess,
    // Error
    updateStockError: updateStockMutation.error,
    // Función de reset
    resetUpdateStockState: updateStockMutation.reset,
    // Mutación completa
    updateStockMutation,
  };
};