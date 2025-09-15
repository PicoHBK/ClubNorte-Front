import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

// Interfaces para la estructura de datos
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  cellphone: string;
  email: string;
  username: string;
}

export interface MovementProduct {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
}

export interface Movement {
  id: number;
  user: User;
  product: MovementProduct;
  amount: number;
  from_id: number;
  from_type: "deposit" | "point_sale";
  to_id: number;
  to_type: "deposit" | "point_sale";
  ignore_stock: boolean;
  created_at: string;
}

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
