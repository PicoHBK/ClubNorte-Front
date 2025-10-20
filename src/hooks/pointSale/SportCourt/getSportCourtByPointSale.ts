// src/hooks/admin/SportCourt/useGetSportCourtByPointSale.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { SportCourt } from "./SportCourt";

export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener canchas deportivas por punto de venta
 */
const getSportCourtByPointSale = async (): Promise<ApiSuccessResponse<SportCourt[]>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<SportCourt[]>>(
    `/api/v1/sport_court/get_all_by_point_sale`,
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Hook para obtener canchas deportivas por punto de venta usando react-query
 */
export const useGetSportCourtByPointSale = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["SportCourtGetByPointSale"],
    queryFn: getSportCourtByPointSale,
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    sportCourts: data?.body || [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};