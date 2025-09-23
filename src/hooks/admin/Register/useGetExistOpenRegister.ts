import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

const getExistOpenRegister = async (): Promise<ApiSuccessResponse<boolean>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<boolean>>(
    `/api/v1/register/exist_open`,
    { withCredentials: true }
  );
  return response.data;
};

export const useGetExistOpenRegister = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["existOpenRegister"],
    queryFn: () => getExistOpenRegister(),
    refetchInterval: 60 * 60 * 1000, // 1 hora en milisegundos
    refetchIntervalInBackground: true
  });

  const apiError = getApiError(error);

  return {
    existOpen: data?.body ?? false,
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
    refetch
  };
};