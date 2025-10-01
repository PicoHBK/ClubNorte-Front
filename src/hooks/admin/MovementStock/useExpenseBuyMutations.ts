import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { ExpenseBuyCreate } from "./movementStockType";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllExpenseBuys",
  "getExpenseBuyById",
  "getAllProducts",
  "ProductGetById",
  "searchProductsByName",
  "searchProductsByCode",
  "ProductsGetByCategory",
];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para crear compra/gasto
const createExpenseBuy = async (
  formData: ExpenseBuyCreate
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/expense_buy",
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar compra/gasto
const deleteExpenseBuy = async (
  id: number
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.delete(
    `/api/v1/expense_buy/${id}`,
    { withCredentials: true }
  );
  return data;
};

export const useExpenseBuyMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear compra
  const createMutation = useMutation({
    mutationFn: createExpenseBuy,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Compra creada:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear compra:", errorMessage);
    },
  });

  // Mutación para eliminar compra
  const deleteMutation = useMutation({
    mutationFn: deleteExpenseBuy,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Compra eliminada:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar compra:", errorMessage);
    },
  });

  return {
    // Funciones de mutación
    createExpenseBuy: createMutation.mutate,
    deleteExpenseBuy: deleteMutation.mutate,

    // Estados de loading
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Estados de éxito
    isCreated: createMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,

    // Errores
    createError: createMutation.error,
    deleteError: deleteMutation.error,

    // Funciones de reset
    resetCreateState: createMutation.reset,
    resetDeleteState: deleteMutation.reset,

    // Mutaciones completas (por si necesitas más control)
    createMutation,
    deleteMutation,
  };
};