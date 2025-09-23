// src/hooks/admin/Income/useGetIncomeById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { IncomeDetails } from "./incomeTypes";

// Reutilizamos la misma interfaz genérica de respuestas exitosas
export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener un ingreso por ID
 */
const getIncomeById = async (
  id: number
): Promise<ApiSuccessResponse<IncomeDetails["body"]>> => {
  if (!id) {
    throw new Error("ID de ingreso requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<IncomeDetails["body"]>>(
    `/api/v1/income/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener un ingreso por ID usando react-query
 */
export const useGetIncomeById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["IncomeGetById", id],
    queryFn: () => getIncomeById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    income: data?.body,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
