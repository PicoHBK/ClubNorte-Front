// src/hooks/admin/Category/useGetCategoryById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

export interface CategoryDetail {
  id: number;
  name: string;
}

export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener una categoria por ID
 */
const getCategoryById = async (id: number): Promise<ApiSuccessResponse<CategoryDetail>> => {
  if (!id) {
    throw new Error("ID de categoria requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<CategoryDetail>>(
    `/api/v1/category/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener una categoria por ID usando react-query
 */
export const useGetCategoryById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["CategoryGetById", id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
    retry: 1,
  });

  const apiError = getApiError(error);

  return {
    category: data?.body,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
