import { LogOut, User, Loader2 } from 'lucide-react'
import { useNavigate, useLocation } from "react-router-dom"
import useUserStore from '@/store/useUserStore'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Estados del store
  const logout = useUserStore((state) => state.logout)
  const isLoading = useUserStore((state) => state.isLoading)
  const user = useUserStore((state) => state.user)
  const getUserFullName = useUserStore((state) => state.getUserFullName)
  
  // Si está en "/" (login), no mostrar el header
  if (location.pathname === "/") {
    return null
  }
  
  const handleLogout = async () => {
    try {
      await logout()
      // El logout del store ya maneja la limpieza del estado
      // Redirigir al login después del logout
      navigate("/")
    } catch (error) {
      console.error("Error en logout:", error)
      // El store ya maneja los errores, pero aún redirigimos
      // porque el estado local se limpió
      navigate("/")
    }
  }

  return (
    <header className="bg-slate-600 backdrop-blur-md border-b border-white/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Título con info del usuario */}
          <div className="flex items-center gap-3">
            <User className="text-slate-400" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
              {user && (
                <p className="text-sm text-slate-300">
                  {getUserFullName()} • {user.role?.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Botón Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Cerrando...
              </>
            ) : (
              <>
                <LogOut size={18} />
                Cerrar Sesión
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header