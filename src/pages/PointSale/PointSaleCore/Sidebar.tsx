import { type ReactNode } from "react";
import { ChevronDown, Settings, LogOut, Menu, X } from "lucide-react";
import usePointSaleStore from "@/store/usePointSaleStore";
import useUserStore from "@/store/useUserStore";
import type { PointSaleConfig } from "./pointSaleConfig";
import { usePointSaleById } from "@/hooks/pointSale/usePointSaleById";
import { filterConfigByRole } from "./pointSaleConfig";

interface MenuButtonProps {
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
  variant?: "model" | "action" | "utility";
}

interface SidebarProps {
  config: PointSaleConfig;
  selectedActionId: string | null;
  sidebarOpen: boolean;
  disclosuresOpen: Record<string, boolean>;
  onActionSelect: (actionId: string) => void;
  onToggleDisclosure: (modelId: string) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  selectedAction?: {
    id: string;
    name: string;
    modelName: string;
    sectionName: string;
  } | null;
}

const MenuButton = ({
  onClick,
  children,
  active = false,
  className = "",
  variant = "action",
}: MenuButtonProps) => {
  const baseClasses = "flex items-center w-full font-medium rounded-xl transition-all duration-300";
  
  const variantClasses = {
    model: active
      ? "px-4 py-3.5 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 scale-[1.02] border border-indigo-400/30"
      : "px-4 py-3.5 text-slate-300 hover:bg-white/10 hover:text-white border border-transparent",
    action: active
      ? "px-3 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
      : "px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200",
    utility: "px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Sidebar = ({
  config,
  selectedActionId,
  sidebarOpen,
  disclosuresOpen,
  onActionSelect,
  onToggleDisclosure,
  onToggleSidebar,
  onLogout,
  selectedAction,
}: SidebarProps) => {
  const { currentPointSaleId } = usePointSaleStore();
  
  // Obtener rol y si es super admin
  const role = useUserStore((state) => state.getUserRole());
  const isSuperAdmin = useUserStore((state) => state.isUserAdmin());
  
  const {
    pointSale,
    isLoading: isPointSaleLoading,
  } = usePointSaleById(currentPointSaleId || 0);

  // Filtrar configuración según rol
  // Si es super admin O rol ADMIN, ve todo. Si no, se aplica el filtro según su rol
  const filteredConfig = (isSuperAdmin || role === "admin") ? config : filterConfigByRole(config, role ?? undefined);

  const handleActionSelect = (actionId: string) => {
    onActionSelect(actionId);
  };

  const getDisplayTitle = () => {
    if (isPointSaleLoading) {
      return "Cargando...";
    }
    return pointSale?.name || "Punto de venta no encontrado";
  };

  return (
    <>
      {/* Botón de menú para móvil y tablet */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white/10 backdrop-blur-lg text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-2xl active:scale-95"
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay para móvil y tablet */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={onToggleSidebar}
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
        <div className="p-5 border-b border-white/20">
          <div className="flex items-center mb-1.5">
            {isPointSaleLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-400 border-t-transparent mr-2.5"></div>
            )}
            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text">
              {getDisplayTitle()}
            </h1>
          </div>
          <p className="text-xs text-slate-400">Gestión de punto de venta</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {filteredConfig.sections.map((section) => (
            <div key={section.id} className="space-y-2">
              {/* Divisor de sección más compacto */}
              <div className="flex items-center px-2 py-1">
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent flex-1"></div>
                <h2 className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {section.name}
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent flex-1"></div>
              </div>

              {section.models.map((model) => (
                <div key={model.id} className="space-y-1">
                  {/* Botón de modelo - MÁS GRANDE */}
                  <MenuButton
                    onClick={() => onToggleDisclosure(model.id)}
                    active={selectedAction?.modelName === model.name}
                    variant="model"
                    className="justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-white/10 mr-3 group-hover:scale-110 transition-transform">
                        <model.icon
                          className={`h-5 w-5 ${model.color || "text-slate-400"}`}
                        />
                      </div>
                      <span className="font-semibold text-base">{model.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        disclosuresOpen[model.id] ? "rotate-180" : ""
                      }`}
                    />
                  </MenuButton>

                  {/* Acciones - MÁS PEQUEÑAS */}
                  {disclosuresOpen[model.id] && (
                    <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 animate-fadeIn">
                      {model.actions.map((action) => (
                        <MenuButton
                          key={action.id}
                          onClick={() => handleActionSelect(action.id)}
                          active={selectedActionId === action.id}
                          variant="action"
                          className="group"
                        >
                          <div className="flex items-center">
                            <div className="p-1 rounded-md bg-white/5 mr-2.5 group-hover:scale-110 transition-transform">
                              <action.icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-normal">{action.name}</span>
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

        {/* Footer del sidebar - BOTONES PEQUEÑOS */}
        <div className="p-3 border-t border-white/20 space-y-1">
          <MenuButton 
            onClick={() => {}} 
            variant="utility"
            className="group"
          >
            <div className="p-1.5 rounded-lg bg-white/5 mr-2.5 group-hover:scale-110 transition-transform">
              <Settings className="h-4 w-4 text-slate-400" />
            </div>
            <span>Configuración</span>
          </MenuButton>

          <MenuButton 
            onClick={onLogout} 
            variant="utility"
            className="group hover:bg-red-500/10 hover:text-red-400"
          >
            <div className="p-1.5 rounded-lg bg-red-500/10 mr-2.5 group-hover:scale-110 transition-transform">
              <LogOut className="h-4 w-4 text-red-400" />
            </div>
            <span>Salir</span>
          </MenuButton>
        </div>
      </div>
    </>
  );
};

export default Sidebar;