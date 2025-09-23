import { useState, useEffect, type JSX, type ReactNode } from "react";
import {
  ChevronDown,
  Settings,
  Plus,
  User,
  LogOut,
  type LucideIcon,
  DollarSign,
  ListCheckIcon,
  Menu,
  X,
  Banknote,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TableProductPointSale from "./ProductPoinSale/TableProductPointSale";
import usePointSaleStore from "@/store/usePointSaleStore";
import RegisterPointSale from "./Register/RegisterPointSale";
import IncomeCreate from "./Income/IncomeCreate";
import TableIncomes from "./Income/TableIncomes";

// Definición de tipos para la configuración
interface Action {
  id: string;
  name: string;
  icon: LucideIcon;
  component: () => JSX.Element;
}

interface Model {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  actions: Action[];
}

interface Section {
  id: string;
  name: string;
  models: Model[];
}

interface MenuButtonProps {
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
}

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

  // Login automático cuando hay un ID en los params
  useEffect(() => {
    if (id) {
      login(Number(id), ""); // <-- password vacío si no se necesita
    }
  }, [id, login]);

  // Configuración centralizada con componentes únicos
  const config: { sections: Section[] } = {
    sections: [
      {
        id: "Ingreso",
        name: "Ingreso",
        models: [
          {
            id: "expense",
            name: "Ingreso",
            icon: DollarSign,
            color: "text-emerald-500",
            actions: [
              {
                id: "crear-ingreso",
                name: "Crear",
                icon: Plus,
                component: IncomeCreate,
              },
              {
                id: "list-ingreso",
                name: "Lista",
                icon: ListCheckIcon,
                component: TableIncomes,
              },
            ],
          },
        ],
      },
      {
        id: "Productos",
        name: "Gestión",
        models: [
          {
            id: "productos",
            name: "Productos",
            icon: User,
            color: "text-indigo-400",
            actions: [
              {
                id: "listar",
                name: "Listar",
                icon: ListCheckIcon,
                component: TableProductPointSale,
              },
            ],
          },
        ],
      },

      {
        id: "Caja",
        name: "Caja e Informes",
        models: [
          {
            id: "caja",
            name: "Caja",
            icon: Banknote,
            color: "text-indigo-400",
            actions: [
              {
                id: "abrir-cerrar",
                name: "Abrir/Cerrar",
                icon: ListCheckIcon,
                component: RegisterPointSale,
              },
              
            ],
          },
        ],
      },
    ],
  };

  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [disclosuresOpen, setDisclosuresOpen] = useState<
    Record<string, boolean>
  >({});

  // Todas las acciones aplanadas
  const allActions = config.sections.flatMap((s) =>
    s.models.flatMap((m) =>
      m.actions.map((a) => ({ ...a, modelName: m.name, sectionName: s.name }))
    )
  );

  const selectedAction = allActions.find((a) => a.id === selectedActionId);

  useEffect(() => {
    if (allActions.length > 0) {
      setSelectedActionId(allActions[0].id);
      // Abrir el primer disclosure por defecto
      const firstModelId = config.sections[0]?.models[0]?.id;
      if (firstModelId) {
        setDisclosuresOpen({ [firstModelId]: true });
      }
    }
  }, []);

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

  // Botón reutilizable para el menú
  const MenuButton = ({
    onClick,
    children,
    active = false,
    className = "",
  }: MenuButtonProps) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
        active
          ? "bg-indigo-600 text-white shadow-lg scale-105"
          : "text-slate-300 hover:bg-white/10 hover:text-white hover:scale-102"
      } ${className}`}
    >
      {children}
    </button>
  );

  // Manejo del botón "Salir"
  const handleLogout = async () => {
    await logout();
    navigate("/admin"); // Redirige a /admin
  };

  // Si está cargando el login automático
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

  // Si ocurre error en el login
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

  // Si no está autenticado después del intento
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
      {/* Botón de menú para móvil y tablet */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-lg text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-2xl"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay para móvil y tablet */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } 
        lg:translate-x-0 transform fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white/10 backdrop-blur-lg border-r border-white/20 text-slate-300 flex flex-col transition-all duration-300 ease-in-out shadow-2xl`}
      >
        {/* Header del sidebar */}
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text">
            Panel de Control
          </h1>
          <p className="text-sm text-slate-300">Gestión de punto de venta</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {config.sections.map((section) => (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center px-2">
                <div className="h-px bg-gradient-to-r from-indigo-500/50 via-purple-500/30 to-emerald-500/50 flex-1"></div>
                <h2 className="px-3 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  {section.name}
                </h2>
                <div className="h-px bg-gradient-to-r from-emerald-500/50 via-purple-500/30 to-indigo-500/50 flex-1"></div>
              </div>

              {section.models.map((model) => (
                <div key={model.id} className="space-y-2">
                  <MenuButton
                    onClick={() => toggleDisclosure(model.id)}
                    active={selectedAction?.modelName === model.name}
                    className="justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-white/10 mr-3 group-hover:scale-110 transition-transform">
                        <model.icon
                          className={`h-5 w-5 ${model.color || "text-slate-400"}`}
                        />
                      </div>
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-300 ${
                        disclosuresOpen[model.id] ? "rotate-180" : ""
                      }`}
                    />
                  </MenuButton>

                  {disclosuresOpen[model.id] && (
                    <div className="ml-4 pl-4 border-l-2 border-white/20 space-y-1 animate-fadeIn">
                      {model.actions.map((action) => (
                        <MenuButton
                          key={action.id}
                          onClick={() => handleActionSelect(action.id)}
                          active={selectedActionId === action.id}
                          className="text-sm group"
                        >
                          <div className="flex items-center">
                            <div className="p-1.5 rounded-md bg-white/5 mr-3 group-hover:scale-110 transition-transform">
                              <action.icon className="h-4 w-4" />
                            </div>
                            {action.name}
                          </div>
                        </MenuButton>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-white/20 space-y-2">
          <MenuButton onClick={() => {}} className="group">
            <div className="p-2 rounded-lg bg-white/10 mr-3 group-hover:scale-110 transition-transform">
              <Settings className="h-5 w-5 text-slate-400" />
            </div>
            <span>Configuración</span>
          </MenuButton>

          <MenuButton onClick={handleLogout} className="group hover:bg-red-500/20">
            <div className="p-2 rounded-lg bg-red-500/20 mr-3 group-hover:scale-110 transition-transform">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <span>Salir</span>
          </MenuButton>
        </div>
      </div>

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
              <div className="ml-4 hidden sm:block">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">En línea</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Panel de contenido */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {selectedAction ? (
            <div className="h-full">
              <div className="h-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-full p-4 sm:p-6 lg:p-8">
                  <selectedAction.component />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
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