import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { IncomeSportCourt } from "./IncomeSportCourtTypes";

// Tipo genérico para manejar la respuesta de la API
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// Tipo para la paginación
export interface PaginationData {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

// Tipo para el cuerpo de la respuesta de ingresos
export interface IncomesResponseBody extends PaginationData {
  incomes: IncomeSportCourt[];
}

// Datos que se envían en el POST
export interface GetIncomesByDateParams {
  from_date: string; // Formato: "YYYY-MM-DD"
  to_date: string; // Formato: "YYYY-MM-DD"
}

// Llamada a la API para obtener ingresos por rango de fechas
const getIncomesSportCourtByDate = async (
  params: GetIncomesByDateParams,
  page: number = 1,
  limit: number = 10
): Promise<ApiSuccessResponse<IncomesResponseBody>> => {
  const response = await apiClubNorte.post<ApiSuccessResponse<IncomesResponseBody>>(
    `/api/v1/income_sport_court/get_by_date?page=${page}&limit=${limit}`,
    params,
    { withCredentials: true }
  );
  return response.data;
};

// Custom hook para usar en componentes
export const useGetIncomesSportCourtByDate = (
  params: GetIncomesByDateParams,
  page: number = 1,
  limit: number = 10
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getIncomesSportCourtByDate", params, page, limit],
    queryFn: () => getIncomesSportCourtByDate(params, page, limit),
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