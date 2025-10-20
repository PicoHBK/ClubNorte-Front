import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Product } from "./productType";


export interface ProductsResponse {
  limit: number;
  page: number;
  products: Product[];
  total: number;
  total_pages: number;
}

export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

const getAllProducts = async (page: number = 1, limit: number = 10): Promise<ApiSuccessResponse<ProductsResponse>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<ProductsResponse>>(
    `/api/v1/product/get_all?page=${page}&limit=${limit}`,
    { withCredentials: true }
  );
  return response.data;
};

export const useGetAllProducts = (page: number = 1, limit: number = 10) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAllProducts", page, limit],
    queryFn: () => getAllProducts(page, limit)
  });

  const apiError = getApiError(error);

  return {
    productsData: data?.body ?? {
      limit: 10,
      page: 1,
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