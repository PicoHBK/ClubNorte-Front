import { useState, useEffect } from "react"
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react"
import apiClubNorte from "@/api/apiClubNorte"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { AxiosError } from "axios"

type LoginData = {
  email: string
  password: string
}

type AuthResponse = {
  user: {
    id: string
    email: string
    name?: string
  }
  token?: string
  message?: string
}

type ApiError = {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

// Función para hacer login
const postLogin = async (form: LoginData): Promise<AuthResponse> => {
  const { data } = await apiClubNorte.post("/api/v1/auth/login", form, {
    withCredentials: true, // necesario para enviar/recibir cookies
  })
  return data
}

// Función para verificar si el usuario está autenticado
const checkAuth = async (): Promise<AuthResponse | null> => {
  try {
    const { data } = await apiClubNorte.get("/api/v1/auth/current_user", {
      withCredentials: true,
    })
    return data
  } catch (error) {
    // Si es un error 401 o 403, es normal (no autenticado)
    if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
      return null
    }
    // Para otros errores, los re-lanzamos
    throw error
  }
}

export default function Home() {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const navigate = useNavigate()

  // Query para verificar si ya está autenticado
  const { data: authData, isLoading: isCheckingAuth } = useQuery({
    queryKey: ["auth-check"],
    queryFn: checkAuth,
    retry: false, // No reintentar si falla
  })

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (authData && !isCheckingAuth) {
      navigate("/admin")
    }
  }, [authData, isCheckingAuth, navigate])

  const { mutate, isPending } = useMutation({
    mutationFn: postLogin,
    onSuccess: (data: AuthResponse) => {
      console.log("Login exitoso:", data)
      setErrorMessage("") // Limpiar errores
      // Redirigir después del login exitoso
      navigate("/admin")
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error("Error en login:", error)
      
      // Manejo específico de errores de Axios
      if (error.response) {
        // El servidor respondió con un código de error
        const apiError = error.response.data
        
        switch (error.response.status) {
          case 401:
            setErrorMessage("Credenciales incorrectas. Verifica tu email y contraseña.")
            break
          case 422:
            // Errores de validación
            if (apiError?.errors) {
              const firstError = Object.values(apiError.errors)[0]
              setErrorMessage(Array.isArray(firstError) ? firstError[0] : "Datos inválidos")
            } else {
              setErrorMessage(apiError?.message || "Datos de entrada inválidos")
            }
            break
          case 429:
            setErrorMessage("Demasiados intentos. Intenta nuevamente más tarde.")
            break
          case 500:
            setErrorMessage("Error del servidor. Intenta nuevamente más tarde.")
            break
          default:
            setErrorMessage(apiError?.message || "Error desconocido. Intenta nuevamente.")
        }
      } else if (error.request) {
        // Error de red o servidor no responde
        setErrorMessage("Error de conexión. Verifica tu internet e intenta nuevamente.")
      } else {
        // Error en la configuración de la petición
        setErrorMessage("Error inesperado. Intenta nuevamente.")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("") // Limpiar errores previos
    
    const formData = new FormData(e.currentTarget)
    const data: LoginData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }
    
    // Validación básica del lado cliente
    if (!data.email || !data.password) {
      setErrorMessage("Por favor completa todos los campos")
      return
    }
    
    mutate(data) // Ejecuta la mutación
  }

  // Mostrar loading solo mientras verifica la autenticación (no si hay error)
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Verificando sesión...</span>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar nada (el useEffect redirige)
  if (authData) {
    return null
  }

  // Si falla la verificación O no está autenticado, mostrar el formulario
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Bienvenido</h1>
        <p className="text-center text-slate-300 mb-8">
          Inicia sesión para continuar
        </p>

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@ejemplo.com"
                required
                disabled={isPending}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Extra */}
        <p className="text-center text-slate-400 text-sm mt-6">
          <a 
            href="#" 
            className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              if (isPending) {
                e.preventDefault()
              } else {
                e.preventDefault()
                // Aquí podrías abrir un modal o navegar a la página de recuperación
                console.log("Recuperar contraseña")
              }
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </p>
      </div>
    </div>
  )
}