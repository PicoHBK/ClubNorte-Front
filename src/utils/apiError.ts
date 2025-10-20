import { AxiosError } from "axios"

// la estructura que el backend garantiza
export interface ApiErrorResponse {
  status: boolean
  message: string
  body: string
}

// helper genérico: si es error de API, devuelve la estructura completa
export const getApiError = (error: unknown): ApiErrorResponse | null => {
  if (error instanceof AxiosError && error.response?.data) {
    return error.response.data as ApiErrorResponse
  }
  return null
}
