import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Expense } from "./ExpenseTypes";

// Tipo genérico para manejar la respuesta de la API
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// Respuesta paginada de expenses
export interface ExpensesResponse {
  expenses: Expense[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Datos que se envían en el POST para obtener expenses por fecha
export interface GetExpensesByDateParams {
  from_date: string; // Formato: "YYYY-MM-DD"
  to_date: string; // Formato: "YYYY-MM-DD"
}

// Llamada a la API para obtener expenses por rango de fechas
const getExpensesByDate = async (
  params: GetExpensesByDateParams,
  page: number = 1,
  limit: number = 10
): Promise<ApiSuccessResponse<ExpensesResponse>> => {
  const response = await apiClubNorte.post<ApiSuccessResponse<ExpensesResponse>>(
    `/api/v1/expense/get_by_date?page=${page}&limit=${limit}`,
    params,
    { withCredentials: true }
  );
  return response.data;
};

// Custom hook para usar en componentes
export const useGetExpensesByDate = (
  params: GetExpensesByDateParams,
  page: number = 1,
  limit: number = 10
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getExpensesByDate", params, page, limit],
    queryFn: () => getExpensesByDate(params, page, limit),
    enabled: !!params.from_date && !!params.to_date, // solo se ejecuta si hay fechas
  });

  const apiError = getApiError(error);

  return {
    expensesData: data?.body ?? {
      expenses: [],
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