import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { IncomeCreateData, IncomeUpdateData } from "./incomeTypes";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = ["getAllIncomes", "IncomeGetById"];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para crear income
const createIncome = async (formData: IncomeCreateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/income/create",
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para actualizar income
const updateIncome = async (formData: IncomeUpdateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    `/api/v1/income/update`,
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar income
const deleteIncome = async (incomeId: string): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.delete(
    `/api/v1/income/delete/${incomeId}`,
    { withCredentials: true }
  );
  return data;
};

export const useIncomeMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: createIncome,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Ingreso creado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear ingreso:", errorMessage);
    },
  });

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: updateIncome,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Ingreso actualizado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar ingreso:", errorMessage);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Ingreso eliminado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar ingreso:", errorMessage);
    },
  });

  return {
    // Funciones de mutación
    createIncome: createMutation.mutate,
    updateIncome: updateMutation.mutate,
    deleteIncome: deleteMutation.mutate,

    // Estados de loading
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Estados de éxito
    isCreated: createMutation.isSuccess,
    isUpdated: updateMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,

    // Errores
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Funciones de reset (para limpiar estados)
    resetCreateState: createMutation.reset,
    resetUpdateState: updateMutation.reset,
    resetDeleteState: deleteMutation.reset,

    // Mutaciones completas (por si necesitas más control)
    createMutation,
    updateMutation,
    deleteMutation,
  };
};