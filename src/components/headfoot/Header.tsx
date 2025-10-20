import { LogOut, User, Loader2, Settings, FileText, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useUserStore from "@/store/useUserStore";
import NotificationDropdown from "../generic/NotificationDropdown";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados del store
  const { logout, isLoading, user, getUserFullName, isUserAdmin, getUserRole } = useUserStore();

  // Si está en "/" (login) o en rutas que empiecen con "/point-sale/", no mostrar el header
  if (location.pathname === "/" || location.pathname.startsWith("/point-sale/"))
    return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error en logout:", error);
      navigate("/");
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleReports = () => {
    navigate("/reports");
  };

  const handleHome = () => {
    navigate("/");
  };

  // Verificar si el usuario es administrador
  const isAdmin = isUserAdmin() || getUserRole()?.toLowerCase() === "admin";

  return (
    <header className="bg-slate-600 backdrop-blur-md border-b border-white/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Título con info del usuario */}
          <div className="flex items-center gap-3">
            <User className="text-slate-400" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Panel de Control
              </h1>
              {user && (
                <p className="text-sm text-slate-300">
                  {getUserFullName()} • {user.role?.name}
                </p>
              )}
            </div>
          </div>

          {/* Botones centrales */}
          <div className="flex items-center gap-3">
            {/* Botón de Inicio - Solo si NO estamos en root */}
            {location.pathname !== "/" && (
              <Button
                onClick={handleHome}
                variant="outline"
                className="bg-slate-700/80 border-slate-500 hover:bg-slate-600 hover:border-slate-400 text-white shadow-lg transition-all duration-200"
              >
                <Home className="mr-2" size={18} />
                Inicio
              </Button>
            )}

            {/* Botón de Informes - Solo visible para admins */}
            {isAdmin && (
              <Button
                onClick={handleReports}
                variant="outline"
                className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 hover:from-blue-700 hover:to-blue-800 hover:border-blue-400 text-white shadow-lg transition-all duration-200"
              >
                <FileText className="mr-2" size={18} />
                Informes
              </Button>
            )}
          </div>

          {/* Menú de Usuario y Notificaciones */}
          <div className="flex items-center gap-3">
            {/* Componente de Notificaciones */}
            <NotificationDropdown />

            {/* Dropdown de Configuración */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-700 border-slate-500 hover:bg-slate-600 text-white"
                >
                  <Settings size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-600">
                <DropdownMenuItem
                  onClick={handleChangePassword}
                  className="text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Cambiar Contraseña
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-600" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="text-red-400 hover:bg-slate-700 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Cerrando..." : "Cerrar Sesión"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;