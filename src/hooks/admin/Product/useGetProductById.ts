// src/hooks/admin/Product/useGetProductById.ts
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
 * Llamada a la API para obtener un producto por ID
 */
const getProductById = async (id: number): Promise<ApiSuccessResponse<ProductDetail>> => {
  if (!id) {
    throw new Error("ID de producto requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<ProductDetail>>(
    `/api/v1/product/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener un producto por ID usando react-query
 */
export const useGetProductById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ProductGetById", id],
    queryFn: () => getProductById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    product: data?.body,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};