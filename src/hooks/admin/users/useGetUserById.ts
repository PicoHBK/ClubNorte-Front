// src/hooks/admin/User/useGetUserById.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

export interface Role {
  id: number;
  name: string;
}

export interface PointSale {
  id: number;
  name: string;
}

export interface UserDetail {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  cellphone: string;
  email: string;
  username: string;
  is_admin: boolean;
  role: Role;
  point_sales: PointSale[];
}

export interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para obtener un usuario por ID
 */
const getUserById = async (id: number): Promise<ApiSuccessResponse<UserDetail>> => {
  if (!id) {
    throw new Error("ID de usuario requerido");
  }

  const response = await apiClubNorte.get<ApiSuccessResponse<UserDetail>>(
    `/api/v1/user/get/${id}`,
    { withCredentials: true }
  );

  return response.data;
};

/**
 * Hook para obtener un usuario por ID usando react-query
 */
export const useGetUserById = (id: number | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userGetById", id],
    queryFn: () => getUserById(id!),
    enabled: !!id, // solo ejecuta si hay un ID válido
    retry: 1, // reintentar una vez en caso de error
  });

  const apiError = getApiError(error);

  return {
    user: data?.body,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
