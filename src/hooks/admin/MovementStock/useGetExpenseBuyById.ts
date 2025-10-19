// src/hooks/admin/ExpenseBuy/useGetExpenseBuyById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { ExpenseBuyDetailType } from "./movementStockType";

/**
 * Interfaz genérica de respuestas exitosas de la API
 */
export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener un detalle de compra/gasto por ID
 */
const getExpenseBuyById = async (
  id: number
): Promise<ApiSuccessResponse<ExpenseBuyDetailType>> => {
  if (!id) {
    throw new Error("ID de compra requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<ExpenseBuyDetailType>>(
    `/api/v1/expense_buy/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener un detalle de compra/gasto por ID usando react-query
 */
export const useGetExpenseBuyById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ExpenseBuyGetById", id],
    queryFn: () => getExpenseBuyById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    expenseBuy: data?.body,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};