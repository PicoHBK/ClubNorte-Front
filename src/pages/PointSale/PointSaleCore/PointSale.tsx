import { useState, useEffect } from "react";
import { User, X} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import usePointSaleStore from "@/store/usePointSaleStore";
import useUserStore from "@/store/useUserStore"; // Importar el store del usuario

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
      login(Number(id), ""); // password vacío si no se necesita
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="mb-6 text-red-300 text-lg">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg"
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
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="bg-yellow-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <User className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="mb-6 text-white">No se pudo iniciar sesión en el punto de venta.</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg"
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
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-xl">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                  {selectedAction
                    ? `${selectedAction.sectionName} > ${selectedAction.modelName}`
                    : "Panel de Control"}
                </h2>
                {selectedAction && (
                  <p className="text-sm text-slate-300 mt-1">
                    {selectedAction.name}
                  </p>
                )}
              </div>
              
              {/* Información del usuario */}
              <div className="ml-4 flex items-center space-x-4">
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">En línea</span>
                  </div>
                </div>
                
                {/* Info del usuario */}
                {user ? (
                  <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {getUserFullName() || 'Usuario'}
                      </p>
                      <p className="text-xs text-slate-300">
                        {getUserRole() || 'Sin rol'}
                      </p>
                    </div>
                  </div>
                ) : userIsAuthenticated ? (
                  <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
                    <div className="bg-yellow-500 rounded-full p-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        Cargando...
                      </p>
                      <p className="text-xs text-slate-300">
                        Obteniendo datos
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
                    <div className="bg-gray-500 rounded-full p-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        No autenticado
                      </p>
                      <p className="text-xs text-slate-300">
                        Sin sesión
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Versión móvil - solo icono */}
                <div className="md:hidden bg-white/10 backdrop-blur-lg rounded-full p-2 border border-white/20">
                  <User className={`h-5 w-5 ${user ? 'text-white' : userIsAuthenticated ? 'text-yellow-400' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Panel de contenido */}
        <main className="flex-1 overflow-hidden">
          {selectedAction ? (
            <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl m-4 sm:m-6 lg:m-8 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <selectedAction.component />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-emerald-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                    <User className="h-12 w-12 text-slate-300 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Bienvenido al Panel
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Selecciona una acción del menú lateral para comenzar
                  </p>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg"
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