// src/hooks/admin/Product/useGetProductsByCategory.ts

import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

export interface StockPointSales {
  id: number;
  name: string;
  stock: number;
}

export interface StockDeposit {
  id: number;
  stock: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductDetail {
  id: number;
  code: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  stock_point_sales: StockPointSales[];
  stock_deposit: StockDeposit;
}

export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener productos por categoría
 */
const getProductsByCategory = async (
  categoryId: number
): Promise<ApiSuccessResponse<ProductDetail[]>> => {
  if (!categoryId) {
    throw new Error("ID de categoría requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<ProductDetail[]>>(
    `/api/v1/product/get_by_category/${categoryId}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener productos por ID de categoría usando react-query
 */
export const useGetProductsByCategory = (categoryId: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ProductsGetByCategory", categoryId],
    queryFn: () => getProductsByCategory(categoryId!),
    enabled: !!categoryId, // solo ejecuta si hay un ID válido
    retry: 1, // reintenta una vez si falla
  });

  const apiError = getApiError(error);

  return {
    products: data?.body || [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
