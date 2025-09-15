import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

// ---- Interfaces para tipado ----

// Categoría de producto
export interface Category {
  id: number;
  name: string;
}

// Producto individual
export interface Product {
  id: number;
  code: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
}

// Respuesta paginada con productos
export interface ProductsResponse {
  limit: number;
  page: number;
  products: Product[];
  total: number;
  total_pages: number;
}

// Estructura de la respuesta general de la API
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// ---- Función para obtener productos ----
const getAllProducts = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiSuccessResponse<ProductsResponse>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<ProductsResponse>>(
    `/api/v1/point_sale_product/get_all?page=${page}&limit=${limit}`,
    { withCredentials: true }
  );
  return response.data;
};

// ---- Hook para React Query ----
export const useGetAllProductsPointSale = (page: number = 1, limit: number = 10) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAllProducts", page, limit],
    queryFn: () => getAllProducts(page, limit),
  });

  const apiError = getApiError(error);

  return {
    productsData: data?.body ?? {
      limit: limit,
      page: page,
      products: [],
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
