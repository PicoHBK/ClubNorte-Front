// Tipo para un punto de venta individual


// Tipo para la respuesta exitosa de la API
export interface ApiSuccessResponse {
  status: boolean
  message: string
  body: PointSale[]
}

// Hook completo con el tipo correcto
import apiClubNorte from "@/api/apiClubNorte"
import { useQuery } from "@tanstack/react-query"
import { getApiError } from "@/utils/apiError"
import type { PointSale } from "./poinSaleType"

const getAllPointSale = async (): Promise<ApiSuccessResponse> => {
  const response = await apiClubNorte.get<ApiSuccessResponse>('/api/v1/point_sale/get_all', {
    withCredentials: true
  })
  return response.data
}

export const usePointSaleGetAll = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pointSaleGetAll'],
    queryFn: getAllPointSale
  })

  const apiError = getApiError(error)

  return {
    pointSales: data?.body || [],
    isLoading,
    isError,
    errorMessage: apiError?.message || null,
    status: data?.status,
    message: data?.message
  }
}