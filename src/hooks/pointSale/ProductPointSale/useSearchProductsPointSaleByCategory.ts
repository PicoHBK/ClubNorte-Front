// src/hooks/admin/Product/useSearchProductsPointSaleByCategory.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Product, ApiSuccessResponse } from "./useGetAllProductsPointSale";

// ---- Respuesta para búsqueda por categoría (normalizada) ----
export interface SearchProductsPointSaleByCategoryResponse {
  products: Product[];
}

// ---- Función para llamar a la API ----
const searchProductsPointSaleByCategory = async (
  categoryId: number
): Promise<ApiSuccessResponse<SearchProductsPointSaleByCategoryResponse>> => {
  if (!categoryId) {
    // Si no hay categoría, retornamos una estructura vacía
    return {
      status: true,
      message: "Sin categoría seleccionada",
      body: { products: [] },
    };
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<Product[]>>(
    `/api/v1/point_sale_product/get_by_category/${categoryId}`,
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
export const useSearchProductsPointSaleByCategory = (categoryId: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchProductsPointSaleByCategory", categoryId],
    queryFn: () => searchProductsPointSaleByCategory(categoryId!),
    enabled: !!categoryId, // Solo ejecuta si hay un ID de categoría válido
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
