import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Movement} from "./movementStockType";

// Interfaces para la estructura de datos

export interface MovementsResponse {
  limit: number;
  movements: Movement[];
  page: number;
  total: number;
  total_pages: number;
}

export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// Función para obtener movimientos
const getAllMovements = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiSuccessResponse<MovementsResponse>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<MovementsResponse>>(
    `/api/v1/movement_stock/get_all?page=${page}&limit=${limit}`,
    { withCredentials: true }
  );
  return response.data;
};

// Hook para usar el query
export const useGetAllMovements = (page: number = 1, limit: number = 10) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAllMovements", page, limit],
    queryFn: () => getAllMovements(page, limit),
  });

  const apiError = getApiError(error);

  return {
    movementsData: data?.body ?? {
      limit: 10,
      page: 1,
      movements: [],
      total: 0,
      total_pages: 0,
    },
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
