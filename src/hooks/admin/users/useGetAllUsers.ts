import apiClubNorte from "@/api/apiClubNorte"
import { useQuery } from "@tanstack/react-query"
import { getApiError } from "@/utils/apiError"

export interface Role {
  id: number
  name: string
}

export interface User {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  cellphone: string
  address: string
  is_admin: boolean
  role: Role
}

export interface ApiSuccessResponse<T> {
  status: boolean
  message: string
  body: T
}

const getAllUsers = async (): Promise<ApiSuccessResponse<User[]>> => {
  const response = await apiClubNorte.get<ApiSuccessResponse<User[]>>(
    "/api/v1/user/get_all",
    { withCredentials: true }
  )
  return response.data
}

export const useGetAllUsers = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAllUsers"],
    queryFn: getAllUsers
  })

  const apiError = getApiError(error)

  return {
    users: data?.body ?? [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message
  }
}
