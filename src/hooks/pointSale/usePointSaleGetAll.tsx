// Tipo para un punto de venta individual
export interface PointSale {
  id: number
  name: string
  description: string
}

// Tipo para la respuesta exitosa de la API
export interface ApiSuccessResponse {
  status: boolean
  message: string
  body: PointSale[]
}

// Tipo para la respuesta de error de la API
export interface ApiErrorResponse {
  status: boolean
  message: string
  body: string | null
}

// Tipo union para ambas respuestas
export type ApiResponse = ApiSuccessResponse | ApiErrorResponse

// Hook completo con el tipo correcto
import apiClubNorte from "@/api/apiClubNorte"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

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
  
  // Extraer solo el message de la API cuando es error
  const getErrorMessage = (): string | null => {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ApiErrorResponse
      return errorData.message
    }
    return null
  }
  
  return {
    pointSales: data?.body || [],
    isLoading,
    isError,
    errorMessage: getErrorMessage(),
    status: data?.status,
    message: data?.message
  }
}