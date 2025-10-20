// src/hooks/admin/SportCourt/useGetSportCourtById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { SportCourtDetails } from "./SportCourt";

export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener una cancha deportiva por ID
 */
const getSportCourtById = async (id: number): Promise<ApiSuccessResponse<SportCourtDetails>> => {
  if (!id) {
    throw new Error("ID de cancha deportiva requerido");
  }
  
  const response = await apiClubNorte.get<ApiSuccessResponse<SportCourtDetails>>(
    `/api/v1/sport_court/get/${id}`,
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Hook para obtener una cancha deportiva por ID usando react-query
 */
export const useGetSportCourtById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["SportCourtGetById", id],
    queryFn: () => getSportCourtById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    sportCourt: data?.body,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};