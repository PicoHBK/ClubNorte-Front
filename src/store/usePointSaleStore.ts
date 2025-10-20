import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClubNorte from '../api/apiClubNorte'
import { AxiosError } from 'axios'

interface ApiSuccessResponse {
  message: string
  status: true
}

interface ApiErrorResponse {
  message: string
  status: false
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse

interface PointSaleAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  currentPointSaleId: number | null

  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setAuthenticated: (auth: boolean, pointSaleId?: number | null) => void
  clearState: () => void

  login: (pointSaleId: number, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchCurrentPointSale: () => Promise<void>
}

const usePointSaleStore = create<PointSaleAuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      currentPointSaleId: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      setAuthenticated: (auth, pointSaleId = null) =>
        set({
          isAuthenticated: auth,
          currentPointSaleId: pointSaleId,
        }),

      clearState: () =>
        set({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          currentPointSaleId: null,
        }),

      /**
       * LOGIN: Inicia sesión en un point sale
       */
      login: async (pointSaleId: number, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClubNorte.post<ApiResponse>(
            `/api/v1/auth/login_point_sale/${pointSaleId}`,
            { password },
            { withCredentials: true }
          )

          if (response.data.status) {
            set({
              isAuthenticated: true,
              currentPointSaleId: pointSaleId,
              error: null,
            })
          } else {
            set({
              isAuthenticated: false,
              error: response.data.message || 'Error desconocido al iniciar sesión.',
            })
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>

          if (axiosError.response) {
            switch (axiosError.response.status) {
              case 401:
                set({ error: 'Credenciales incorrectas.' })
                break
              case 422:
                set({ error: axiosError.response.data?.message || 'Datos inválidos.' })
                break
              case 429:
                set({ error: 'Demasiados intentos. Intenta más tarde.' })
                break
              case 500:
                set({ error: 'Error interno del servidor.' })
                break
              default:
                set({ error: axiosError.response.data?.message || 'Error desconocido.' })
            }
          } else if (axiosError.request) {
            set({ error: 'Error de conexión. Verifica tu internet.' })
          } else {
            set({ error: 'Error inesperado. Intenta nuevamente.' })
          }

          set({ isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * FETCH CURRENT SESSION: Valida si la sesión del point sale sigue activa
       */
      fetchCurrentPointSale: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClubNorte.get<ApiResponse>(
            '/api/v1/auth/current_point_sale',
            { withCredentials: true }
          )

          if (response.data.status) {
            set({ isAuthenticated: true })
          } else {
            get().clearState()
            set({ error: response.data.message || 'Sesión no válida.' })
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>

          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            await get().logout()
            set({ error: 'Sesión expirada.' })
          } else {
            set({
              error: axiosError.response?.data?.message || 'Error desconocido al validar sesión.',
            })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * LOGOUT: Cierra la sesión actual
       */
      logout: async () => {
        const { currentPointSaleId } = get()
        if (!currentPointSaleId) {
          get().clearState()
          return
        }

        set({ isLoading: true, error: null })

        try {
          await apiClubNorte.post<ApiResponse>(
            `/api/v1/auth/login_point_sale/${currentPointSaleId}`,
            {}, // sin body
            { withCredentials: true }
          )
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>
          set({
            error: axiosError.response?.data?.message || 'Error al cerrar sesión.',
          })
        } finally {
          get().clearState()
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'point-sale-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentPointSaleId: state.currentPointSaleId,
      }),
    }
  )
)

export default usePointSaleStore
