import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { RegisterType } from "./registerType";

// Tipo genérico para respuesta de API
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// Params que recibe el endpoint
export interface GetRegisterByDateParams {
  from_date: string; // "YYYY-MM-DD"
  to_date: string;   // "YYYY-MM-DD"
}

// Llamada a la API para obtener registros por rango de fechas
const getRegisterInfoByDate = async (
  params: GetRegisterByDateParams
): Promise<ApiSuccessResponse<RegisterType[]>> => {
  const response = await apiClubNorte.post<
    ApiSuccessResponse<RegisterType[]>
  >("/api/v1/register/inform", params, {
    withCredentials: true,
  });

  return response.data;
};

// Custom hook
export const useGetRegisterInfoByDate = (
  params: GetRegisterByDateParams
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["RegisterInfoByDate", params],
    queryFn: () => getRegisterInfoByDate(params),
    enabled: !!params.from_date && !!params.to_date, // solo ejecuta si hay fechas
  });

  const apiError = getApiError(error);

  return {
    registersData: data?.body ?? [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
