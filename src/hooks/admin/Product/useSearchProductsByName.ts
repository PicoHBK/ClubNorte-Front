// src/hooks/admin/Product/useSearchProductsByName.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Product, ApiSuccessResponse } from "./useGetAllProducts";

/**
 * Llamada a la API para buscar productos por nombre
 */
const searchProductsByName = async (search: string): Promise<ApiSuccessResponse<Product[]>> => {
  if (!search.trim()) {
    // Si no hay término de búsqueda, retornamos una respuesta vacía
    return {
      status: true,
      message: "Sin búsqueda",
      body: []
    };
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<Product[]>>(
    `/api/v1/product/get_by_name?name=${encodeURIComponent(search)}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook que se encarga de buscar productos por nombre usando react-query
 */
export const useSearchProductsByName = (search: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchProductsByName", search],
    queryFn: () => searchProductsByName(search),
    enabled: !!search.trim(), // solo ejecuta si hay texto para buscar
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
