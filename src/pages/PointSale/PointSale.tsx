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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TableProductPointSale from "./ProductPoinSale/TableProductPointSale";
import usePointSaleStore from "@/store/usePointSaleStore";

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

const example = () => {return <h1>Example</h1>}

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
            color: "text-green-500",
            actions: [
              {
                id: "crear-ingreso",
                name: "Crear",
                icon: Plus,
                component: example,
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
            color: "text-emerald-500",
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
    ],
  };

  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
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
      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
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
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Cargando...
      </div>
    );
  }

  // Si ocurre error en el login
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <p className="mb-4 text-red-400">{error}</p>
        <button
          onClick={() => navigate("/admin")}
          className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  // Si no está autenticado después del intento
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <p className="mb-4">No se pudo iniciar sesión en el punto de venta.</p>
        <button
          onClick={() => navigate("/admin")}
          className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Botón de menú móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay para móvil */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } 
        md:translate-x-0 transform fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/10 backdrop-blur-sm border-r border-white/20 text-slate-300 p-4 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl`}
      >
        <h1 className="text-xl font-bold text-white mb-8 px-2">Panel de Control</h1>

        <nav className="flex-1 space-y-4 overflow-y-auto">
          {config.sections.map((section) => (
            <div key={section.id} className="space-y-1">
              <h2 className="px-3 py-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                {section.name}
              </h2>

              {section.models.map((model) => (
                <div key={model.id}>
                  <MenuButton
                    onClick={() => toggleDisclosure(model.id)}
                    active={selectedAction?.modelName === model.name}
                    className="justify-between"
                  >
                    <div className="flex items-center">
                      <model.icon
                        className={`h-5 w-5 mr-3 ${
                          model.color || "text-slate-400"
                        }`}
                      />
                      <span>{model.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        disclosuresOpen[model.id] ? "rotate-180" : ""
                      }`}
                    />
                  </MenuButton>

                  {disclosuresOpen[model.id] && (
                    <div className="ml-8 mt-1 space-y-1">
                      {model.actions.map((action) => (
                        <MenuButton
                          key={action.id}
                          onClick={() => handleActionSelect(action.id)}
                          active={selectedActionId === action.id}
                          className="text-xs"
                        >
                          <action.icon className="h-4 w-4 mr-3" />
                          {action.name}
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
        <div className="mt-auto pt-4 border-t border-white/20 space-y-2">
          {/* Botón de configuración */}
          <MenuButton onClick={() => {}}>
            <Settings className="h-5 w-5 mr-3" />
            <span>Configuración</span>
          </MenuButton>

          {/* Botón de salir */}
          <MenuButton onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-3 text-red-400" />
            <span>Salir</span>
          </MenuButton>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 shadow-2xl">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              {selectedAction
                ? `${selectedAction.sectionName} > ${selectedAction.modelName} > ${selectedAction.name}`
                : "Selecciona una acción"}
            </h2>
          </div>
        </header>

        {/* Panel de contenido */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {selectedAction ? (
            <div className="h-full p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl">
              <selectedAction.component />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">
                  Selecciona una acción del menú lateral
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Gestiona los usuarios de tu sistema
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PointSale;
