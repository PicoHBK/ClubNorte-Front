import apiClubNorte from "@/api/apiClubNorte"
import { useQuery } from "@tanstack/react-query"
import { getApiError } from "@/utils/apiError"

export interface PointSale {
  id: number
  name: string
  description: string
}

export interface ApiSuccessResponseById {
  status: boolean
  message: string
  body: PointSale
}

const getPointSaleById = async (id: number): Promise<ApiSuccessResponseById> => {
  const response = await apiClubNorte.get<ApiSuccessResponseById>(
    `/api/v1/point_sale/get/${id}`,
    { withCredentials: true }
  )
  return response.data
}

export const usePointSaleById = (id: number) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pointSaleById", id],
    queryFn: () => getPointSaleById(id),
    enabled: !!id // evita ejecutar si id es null/undefined/0
  })

  const apiError = getApiError(error)

  return {
    pointSale: data?.body ?? null,
    isLoading,
    isError,
    error: apiError,       // manejás error ya formateado
    status: data?.status,
    message: data?.message
  }
}
