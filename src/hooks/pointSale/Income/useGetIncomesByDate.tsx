import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { IncomesResponse } from "./incomeTypes"; // Aquí tienes tus tipos

// Tipo genérico para manejar la respuesta de la API
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// Datos que se envían en el POST
export interface GetIncomesByDateParams {
  from_date: string; // Formato: "YYYY-MM-DD"
  to_date: string;   // Formato: "YYYY-MM-DD"
}

// Llamada a la API para obtener ingresos por rango de fechas
const getIncomesByDate = async (
  params: GetIncomesByDateParams,
  page: number = 1,
  limit: number = 10
): Promise<ApiSuccessResponse<IncomesResponse>> => {
  const response = await apiClubNorte.post<ApiSuccessResponse<IncomesResponse>>(
    `/api/v1/income/get_by_date?page=${page}&limit=${limit}`,
    params,
    { withCredentials: true }
  );

  return response.data;
};

// Custom hook para usar en componentes
export const useGetIncomesByDate = (
  params: GetIncomesByDateParams,
  page: number = 1,
  limit: number = 10
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getIncomesByDate", params, page, limit],
    queryFn: () => getIncomesByDate(params, page, limit),
    enabled: !!params.from_date && !!params.to_date, // solo se ejecuta si hay fechas
  });

  const apiError = getApiError(error);

  return {
    incomesData: data?.body ?? {
      incomes: [],
      limit,
      page,
      total: 0,
      total_pages: 0
    },
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message
  };
};
