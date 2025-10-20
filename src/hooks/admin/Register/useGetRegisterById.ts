// src/hooks/admin/Register/useGetRegisterById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { RegisterDetails } from "./registerType";

// Interfaz genérica de respuestas exitosas
export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener los detalles de un registro por ID
 */
const getRegisterById = async (
  id: number
): Promise<ApiSuccessResponse<RegisterDetails>> => {
  if (!id) {
    throw new Error("ID de registro requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<RegisterDetails>>(
    `/api/v1/register/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener los detalles de un registro por ID usando react-query
 */
export const useGetRegisterById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["RegisterGetById", id],
    queryFn: () => getRegisterById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    register: data?.body, // Contiene RegisterDetails con income[] y expenses[]
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};