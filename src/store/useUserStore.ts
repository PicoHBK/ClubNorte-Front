import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClubNorte from '../api/apiClubNorte'
import { AxiosError } from 'axios'

interface PointSale {
  id: number
  name: string
  description: string
}

interface Role {
  id: number
  name: string
}

interface ApiSuccessResponse {
  body: {
    address: string
    cellphone: string
    email: string
    first_name: string
    id: number
    is_admin: boolean
    last_name: string
    point_sales: PointSale[]
    role: Role
    username: string
  }
  message: string
  status: true
}

interface ApiErrorResponse {
  body: string
  message: string
  status: false
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  cellphone: string
  address: string
  isAdmin: boolean
  role: Role
  pointSales: PointSale[]
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  setUser: (userData: ApiSuccessResponse) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearUser: () => void
  getUserFullName: () => string
  getUserRole: () => string | null
  getPointSales: () => PointSale[]
  isUserAdmin: () => boolean
  updateUser: (updates: Partial<User>) => void
  fetchCurrentUser: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkTokenValidity: () => Promise<boolean>
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (userData: ApiSuccessResponse) => {
        const { body } = userData
        
        set({
          user: {
            id: body.id,
            firstName: body.first_name,
            lastName: body.last_name,
            email: body.email,
            username: body.username,
            cellphone: body.cellphone,
            address: body.address,
            isAdmin: body.is_admin,
            role: body.role,
            pointSales: body.point_sales
          },
          isAuthenticated: true,
          error: null
        })
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearUser: () => set({
        user: null,
        isAuthenticated: false,
        error: null
      }),

      getUserFullName: () => {
        const { user } = get()
        return user ? `${user.firstName} ${user.lastName}` : ''
      },

      getUserRole: () => {
        const { user } = get()
        return user?.role?.name || null
      },

      getPointSales: () => {
        const { user } = get()
        return user?.pointSales || []
      },

      isUserAdmin: () => {
        const { user } = get()
        return user?.isAdmin || false
      },

      updateUser: (updates: Partial<User>) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClubNorte.get<ApiResponse>('/api/v1/auth/current_user', {
            withCredentials: true
          })
          const userData = response.data
          
          if (userData.status) {
            get().setUser(userData)
          } else {
            set({ 
              error: userData.message || 'Error desconocido',
              user: null,
              isAuthenticated: false
            })
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>
          
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            // Llamar logout automáticamente para limpiar sesión del servidor
            await get().logout()
            set({ error: 'Sesión expirada. Se cerró automáticamente.' })
            return
          }
          
          set({ 
            error: axiosError.response?.data?.message || axiosError.message || 'Error desconocido',
            user: null,
            isAuthenticated: false
          })
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClubNorte.post('/api/v1/auth/login', {
            email,
            password
          }, {
            withCredentials: true
          })
          
          // Si el login fue exitoso (200), obtener datos del usuario
          if (response.status === 200) {
            await get().fetchCurrentUser()
            // fetchCurrentUser cambiará isAuthenticated a true
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>
          
          if (axiosError.response) {
            switch (axiosError.response.status) {
              case 401:
                set({ error: "Credenciales incorrectas. Verifica tu email y contraseña." })
                break
              case 422:
                set({ error: axiosError.response.data?.message || "Datos de entrada inválidos" })
                break
              case 429:
                set({ error: "Demasiados intentos. Intenta nuevamente más tarde." })
                break
              case 500:
                set({ error: "Error del servidor. Intenta nuevamente más tarde." })
                break
              default:
                set({ error: axiosError.response.data?.message || "Error desconocido. Intenta nuevamente." })
            }
          } else if (axiosError.request) {
            set({ error: "Error de conexión. Verifica tu internet e intenta nuevamente." })
          } else {
            set({ error: "Error inesperado. Intenta nuevamente." })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        
        try {
          await apiClubNorte.post('/api/v1/auth/logout', {}, {
            withCredentials: true
          })
          
          get().clearUser()
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>
          
          // Aunque falle el logout del servidor, limpiamos el estado local
          get().clearUser()
          set({ 
            error: axiosError.response?.data?.message || 'Error al cerrar sesión'
          })
        } finally {
          set({ isLoading: false })
        }
      },

      checkTokenValidity: async () => {
        const { user } = get()
        
        if (!user) return false
        
        try {
          const response = await apiClubNorte.get<ApiResponse>('/api/v1/auth/current_user', {
            withCredentials: true
          })
          const data = response.data
          
          if (!data.status) {
            // También aquí llamamos logout automático
            await get().logout()
            return false
          }
          
          return true
        } catch (error) {
          const axiosError = error as AxiosError
          
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            // Logout automático para tokens inválidos
            await get().logout()
            return false
          }
          
          await get().logout()
          return false
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

export default useUserStore