import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

export interface Category {
  id: number;
  name: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

const getAllCategories = async (): Promise<ApiSuccessResponse<Category[]>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<Category[]>>(
    "/api/v1/category/get_all", // Ajusta esta ruta según tu API
    { withCredentials: true }
  );
  return response.data;
};

export const useGetAllCategories = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAllCategories"],
    queryFn: () => getAllCategories()
  });

  const apiError = getApiError(error);

  return {
    categories: data?.body ?? [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message
  };
};