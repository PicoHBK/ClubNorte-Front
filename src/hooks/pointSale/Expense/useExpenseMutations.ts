import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { ExpenseCreateData } from "./ExpenseTypes";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = ["getAllExpenses", "ExpenseGetById","getExpensesByDate"];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para crear expense
const createExpense = async (formData: ExpenseCreateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/expense/create",
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar expense
const deleteExpense = async (expenseId: string): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.delete(
    `/api/v1/expense/delete/${expenseId}`,
    { withCredentials: true }
  );
  return data;
};

export const useExpenseMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Egreso creado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear egreso:", errorMessage);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Egreso eliminado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar egreso:", errorMessage);
    },
  });

  return {
    // Funciones de mutación
    createExpense: createMutation.mutate,
    deleteExpense: deleteMutation.mutate,

    // Estados de loading
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Estados de éxito
    isCreated: createMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,

    // Errores
    createError: createMutation.error,
    deleteError: deleteMutation.error,

    // Funciones de reset (para limpiar estados)
    resetCreateState: createMutation.reset,
    resetDeleteState: deleteMutation.reset,

    // Mutaciones completas (por si necesitas más control)
    createMutation,
    deleteMutation,
  };
};