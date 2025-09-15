import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

// ---- Interfaces ----

// Rol individual
export interface Role {
  id: number;
  name: string;
}

// Respuesta de la API para roles
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// ---- Función para obtener roles ----
const getAllRoles = async (): Promise<ApiSuccessResponse<Role[]>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<Role[]>>(
    `/api/v1/role/get_all`, // ajusta el endpoint según tu backend
    { withCredentials: true }
  );
  return response.data;
};

// ---- Hook para React Query ----
export const useGetAllRoles = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAllRoles"],
    queryFn: getAllRoles,
  });

  const apiError = getApiError(error);

  return {
    roles: data?.body ?? [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};
