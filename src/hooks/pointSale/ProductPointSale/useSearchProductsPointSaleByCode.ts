// src/hooks/admin/Product/useSearchProductsPointSaleByCode.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Product, ApiSuccessResponse } from "./useGetAllProductsPointSale";

// ---- Respuesta para búsqueda de productos por código (normalizada) ----
export interface SearchProductsPointSaleResponse {
  products: Product[];
}

// ---- Función para llamar a la API ----
const searchProductsPointSaleByCode = async (
  code: string
): Promise<ApiSuccessResponse<SearchProductsPointSaleResponse>> => {
  if (!code.trim()) {
    return {
      status: true,
      message: "Sin búsqueda",
      body: { products: [] },
    };
  }

  // La API retorna un solo producto, no un array
  const response = await apiClubNorte.get<ApiSuccessResponse<Product>>(
    `/api/v1/point_sale_product/get_by_code?code=${encodeURIComponent(code)}`,
    { withCredentials: true }
  );

  // Convertir el producto único en array dentro del objeto normalizado
  return {
    status: response.data.status,
    message: response.data.message,
    body: {
      products: response.data.body ? [response.data.body] : []
    },
  };
};

// ---- Hook para React Query ----
/**
 * Hook para buscar productos de punto de venta por código usando react-query
 * Configurado para pistola escáner - sin reintentos automáticos
 */
export const useSearchProductsPointSaleByCode = (code: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchProductsPointSaleByCode", code],
    queryFn: () => searchProductsPointSaleByCode(code),
    enabled: !!code.trim(), // solo ejecuta si el código no está vacío
    retry: false, // sin reintentos - para pistola escáner
    refetchOnWindowFocus: false, // evita refetch innecesarios
    refetchOnMount: false, // evita refetch al montar
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