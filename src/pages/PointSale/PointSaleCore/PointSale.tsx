import { useState, useEffect } from "react";
import { User, X, Circle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import usePointSaleStore from "@/store/usePointSaleStore";
import useUserStore from "@/store/useUserStore";

// Importar módulos
import { pointSaleConfig, getAllActions } from "./pointSaleConfig";
import Sidebar from "./Sidebar";

const PointSale = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    login,
    logout,
    isAuthenticated,
    isLoading,
    error,
  } = usePointSaleStore();

  // Obtener información del usuario del store
  const { 
    user, 
    getUserFullName, 
    getUserRole,
    fetchCurrentUser,
    isAuthenticated: userIsAuthenticated
  } = useUserStore();

  // Estados locales
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [disclosuresOpen, setDisclosuresOpen] = useState<
    Record<string, boolean>
  >({});

  // Login automático cuando hay un ID en los params
  useEffect(() => {
    if (id) {
      login(Number(id), "");
    }
  }, [id, login]);

  // Intentar obtener datos del usuario si no los tenemos
  useEffect(() => {
    if (!user && userIsAuthenticated) {
      fetchCurrentUser();
    }
  }, [user, userIsAuthenticated, fetchCurrentUser]);

  // Debug - para ver qué datos tenemos
  useEffect(() => {
    console.log('User data:', { user, userIsAuthenticated, fullName: getUserFullName(), role: getUserRole() });
  }, [user, userIsAuthenticated, getUserFullName, getUserRole]);

  // Obtener todas las acciones y la acción seleccionada
  const allActions = getAllActions(pointSaleConfig);
  const selectedAction = allActions.find((a) => a.id === selectedActionId);

  // Inicialización: seleccionar primera acción y abrir primer disclosure
  useEffect(() => {
    if (allActions.length > 0) {
      setSelectedActionId(allActions[0].id);
      const firstModelId = pointSaleConfig.sections[0]?.models[0]?.id;
      if (firstModelId) {
        setDisclosuresOpen({ [firstModelId]: true });
      }
    }
  }, []);

  // Handlers
  const toggleDisclosure = (modelId: string) => {
    setDisclosuresOpen((prev) => ({
      ...prev,
      [modelId]: !prev[modelId],
    }));
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedActionId(actionId);
    setSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"></div>
          </div>
          <p className="text-white text-lg font-medium">Cargando punto de venta...</p>
          <p className="text-slate-400 text-sm mt-1">Por favor espera</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="relative mb-6">
            <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error de conexión</h3>
          <p className="mb-6 text-red-300">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg hover:shadow-indigo-500/30"
          >
            Volver al Admin
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="relative mb-6">
            <div className="bg-yellow-500/20 rounded-full p-4 w-16 h-16 mx-auto">
              <User className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Acceso denegado</h3>
          <p className="mb-6 text-slate-300">No se pudo iniciar sesión en el punto de venta.</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg hover:shadow-indigo-500/30"
          >
            Volver al Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar
        config={pointSaleConfig}
        selectedActionId={selectedActionId}
        sidebarOpen={sidebarOpen}
        disclosuresOpen={disclosuresOpen}
        onActionSelect={handleActionSelect}
        onToggleDisclosure={toggleDisclosure}
        onToggleSidebar={handleToggleSidebar}
        onLogout={handleLogout}
        selectedAction={selectedAction}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mejorado */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-xl">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Breadcrumb mejorado */}
              <div className="min-w-0 flex-1">
                {selectedAction ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{selectedAction.sectionName}</span>
                      <span>›</span>
                      <span>{selectedAction.modelName}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                      {selectedAction.name}
                    </h2>
                  </div>
                ) : (
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Panel de Control
                  </h2>
                )}
              </div>
              
              {/* Sección derecha - Usuario + Estado */}
              <div className="flex items-center gap-3">
                {/* Indicador de estado (oculto en móvil pequeño) */}
                <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 backdrop-blur-lg rounded-full px-3 py-1.5 border border-emerald-500/20">
                  <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">En línea</span>
                </div>
                
                {/* Card del usuario mejorada */}
                {user ? (
                  <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/20 hover:bg-white/15 transition-all">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-2">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-semibold text-white leading-tight">
                        {getUserFullName() || 'Usuario'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {getUserRole() || 'Sin rol'}
                      </p>
                    </div>
                  </div>
                ) : userIsAuthenticated ? (
                  <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-lg rounded-xl px-3 py-2 border border-yellow-500/20">
                    <div className="bg-yellow-500/20 rounded-full p-2 animate-pulse">
                      <User className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-semibold text-white">
                        Cargando...
                      </p>
                      <p className="text-xs text-slate-400">
                        Obteniendo datos
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/20 opacity-60">
                    <div className="bg-slate-600/50 rounded-full p-2">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-semibold text-slate-300">
                        No autenticado
                      </p>
                      <p className="text-xs text-slate-400">
                        Sin sesión
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Panel de contenido mejorado */}
        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          {selectedAction ? (
            <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-full overflow-y-auto">
                <selectedAction.component />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20 shadow-2xl">
                  {/* Icono con efecto glow */}
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-full p-8 w-28 h-28 mx-auto">
                      <User className="h-12 w-12 text-slate-300 mx-auto" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Bienvenido al Panel
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Selecciona una acción del menú lateral para comenzar
                  </p>
                  
                  {/* Botón para móvil */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg hover:shadow-indigo-500/30"
                  >
                    Abrir Menú
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PointSale;