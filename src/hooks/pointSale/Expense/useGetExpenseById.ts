// src/hooks/admin/Expense/useGetExpenseById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { ExpenseDetails } from "./ExpenseTypes";

// Reutilizamos la misma interfaz genérica de respuestas exitosas
export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener un egreso por ID
 */
const getExpenseById = async (
  id: number
): Promise<ApiSuccessResponse<ExpenseDetails>> => {
  if (!id) {
    throw new Error("ID de egreso requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<ExpenseDetails>>(
    `/api/v1/expense/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener un egreso por ID usando react-query
 */
export const useGetExpenseById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ExpenseGetById", id],
    queryFn: () => getExpenseById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    expense: data?.body,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};