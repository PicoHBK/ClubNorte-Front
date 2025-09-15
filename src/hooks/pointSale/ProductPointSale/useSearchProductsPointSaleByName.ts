// src/hooks/admin/Product/useSearchProductsPointSaleByName.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Product, ApiSuccessResponse } from "./useGetAllProductsPointSale";

// ---- Respuesta para búsqueda de productos por nombre (normalizada) ----
export interface SearchProductsPointSaleByNameResponse {
  products: Product[];
}

// ---- Función para llamar a la API ----
const searchProductsPointSaleByName = async (
  name: string
): Promise<ApiSuccessResponse<SearchProductsPointSaleByNameResponse>> => {
  if (!name.trim()) {
    // Si no hay texto de búsqueda, retornamos una estructura vacía
    return {
      status: true,
      message: "Sin búsqueda",
      body: { products: [] },
    };
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<Product[]>>(
    `/api/v1/point_sale_product/get_by_name?name=${encodeURIComponent(name)}`,
    { withCredentials: true }
  );

  // Normalizamos la respuesta para que siempre tenga el formato { products: [] }
  return {
    status: response.data.status,
    message: response.data.message,
    body: { products: response.data.body || [] },
  };
};

// ---- Hook para React Query ----
export const useSearchProductsPointSaleByName = (name: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchProductsPointSaleByName", name],
    queryFn: () => searchProductsPointSaleByName(name),
    enabled: !!name.trim(), // Solo ejecuta si el texto de búsqueda no está vacío
  });

  const apiError = getApiError(error);

  return {
    productsData: data?.body ?? { products: [] },
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
