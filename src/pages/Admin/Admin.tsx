import { LogOut, User, Loader2 } from 'lucide-react'
import apiClubNorte from "@/api/apiClubNorte"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

// Función para hacer logout
const postLogout = async () => {
  const { data } = await apiClubNorte.post("/api/v1/auth/logout", {}, {
    withCredentials: true, // necesario para enviar cookies
  })
  return data
}

const Admin = () => {
  const navigate = useNavigate()

  const { mutate: logout, isPending } = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      console.log("Logout exitoso")
      // Redirigir al login después del logout exitoso
      navigate("/")
    },
    onError: (error) => {
      console.error("Error en logout:", error)
      // Si hay error, NO redirigir automáticamente
      // Mostrar mensaje de error o manejar según tu lógica
    },
  })

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header con logout */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo/Título */}
            <div className="flex items-center gap-3">
              <User className="text-indigo-400" size={24} />
              <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
            </div>

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
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

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Bienvenido al Admin</h2>
          <p className="text-slate-300 text-lg">
            Panel de administración - Aquí puedes gestionar todo el contenido.
          </p>
          
          {/* Ejemplo de cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Usuarios</h3>
              <p className="text-slate-400">Gestionar usuarios del sistema</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Contenido</h3>
              <p className="text-slate-400">Administrar contenido de la web</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Configuración</h3>
              <p className="text-slate-400">Ajustes generales del sistema</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Admin