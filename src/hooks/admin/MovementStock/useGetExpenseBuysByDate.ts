import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { ExpenseBuyType } from "./movementStockType";

// Tipo genérico para manejar la respuesta de la API
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// Respuesta paginada de expense buys (estructura que devuelve el API)
export interface ExpenseBuysApiResponse {
  expenses: ExpenseBuyType[]; // ← La API devuelve "expenses", no "expense_buys"
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Estructura que usaremos en el componente
export interface ExpenseBuysResponse {
  expense_buys: ExpenseBuyType[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Datos que se envían en el POST para obtener expense buys por fecha
export interface GetExpenseBuysByDateParams {
  from_date: string; // Formato: "YYYY-MM-DD"
  to_date: string; // Formato: "YYYY-MM-DD"
}

// Llamada a la API para obtener expense buys por rango de fechas
const getExpenseBuysByDate = async (
  params: GetExpenseBuysByDateParams,
  page: number = 1,
  limit: number = 10
): Promise<ApiSuccessResponse<ExpenseBuysApiResponse>> => {
  const response = await apiClubNorte.post<ApiSuccessResponse<ExpenseBuysApiResponse>>(
    `/api/v1/expense_buy/get_by_date?page=${page}&limit=${limit}`,
    params,
    { withCredentials: true }
  );
  return response.data;
};

// Custom hook para usar en componentes
export const useGetExpenseBuysByDate = (
  params: GetExpenseBuysByDateParams,
  page: number = 1,
  limit: number = 10
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getExpenseBuysByDate", params, page, limit],
    queryFn: () => getExpenseBuysByDate(params, page, limit),
    enabled: !!params.from_date && !!params.to_date, // solo se ejecuta si hay fechas
  });

  const apiError = getApiError(error);

  // Mapear "expenses" a "expense_buys" para mantener consistencia en el componente
  return {
    expenseBuysData: data?.body ? {
      expense_buys: data.body.expenses, // ← AQUÍ está el cambio clave
      limit: data.body.limit,
      page: data.body.page,
      total: data.body.total,
      total_pages: data.body.total_pages
    } : {
      expense_buys: [],
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