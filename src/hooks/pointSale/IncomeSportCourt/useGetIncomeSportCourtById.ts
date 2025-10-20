// src/hooks/admin/IncomeSportCourt/useGetIncomeSportCourtById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { IncomeSportCourtDetails } from "./IncomeSportCourtTypes";

// Interfaz genérica de respuestas exitosas
export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener los detalles de un ingreso de cancha por ID
 */
const getIncomeSportCourtById = async (
  id: number
): Promise<ApiSuccessResponse<IncomeSportCourtDetails>> => {
  if (!id) {
    throw new Error("ID de ingreso de cancha requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<IncomeSportCourtDetails>>(
    `/api/v1/income_sport_court/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener los detalles de un ingreso de cancha por ID usando react-query
 */
export const useGetIncomeSportCourtById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["IncomeSportCourtGetById", id],
    queryFn: () => getIncomeSportCourtById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    incomeSportCourt: data?.body, // Contiene IncomeSportCourtDetails
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};