// src/hooks/admin/Product/useSearchProductsByCode.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Product, ApiSuccessResponse } from "./useGetAllProducts";

/**
 * Llamada a la API para buscar productos por código
 */
const searchProductsByCode = async (code: string): Promise<ApiSuccessResponse<Product[]>> => {
  if (!code.trim()) {
    return {
      status: true,
      message: "Sin búsqueda",
      body: []
    };
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<Product[]>>(
    `/api/v1/product/get_by_code?code=${encodeURIComponent(code)}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para buscar productos por código usando react-query
 */
export const useSearchProductsByCode = (code: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchProductsByCode", code],
    queryFn: () => searchProductsByCode(code),
    enabled: !!code.trim(), // solo ejecuta si hay texto
  });

  const apiError = getApiError(error);

  return {
    products: data?.body ?? [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
