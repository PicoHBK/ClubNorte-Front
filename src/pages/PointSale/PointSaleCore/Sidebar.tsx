import { type ReactNode } from "react";
import { ChevronDown, Settings, LogOut, Menu, X } from "lucide-react";
import usePointSaleStore from "@/store/usePointSaleStore";
import type { PointSaleConfig } from "./pointSaleConfig";
import { usePointSaleById } from "@/hooks/pointSale/usePointSaleById";

interface MenuButtonProps {
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
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
  // Obtener ID del store
  const { currentPointSaleId } = usePointSaleStore();
  
  // Hook para obtener información del point sale usando el ID del store
  const {
    pointSale,
    isLoading: isPointSaleLoading,
  } = usePointSaleById(currentPointSaleId || 0);

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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-lg text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-2xl"
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center mb-2">
            {isPointSaleLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-400 border-t-transparent mr-3"></div>
            )}
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text">
              {getDisplayTitle()}
            </h1>
          </div>
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
                    onClick={() => onToggleDisclosure(model.id)}
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

          <MenuButton onClick={onLogout} className="group hover:bg-red-500/20">
            <div className="p-2 rounded-lg bg-red-500/20 mr-3 group-hover:scale-110 transition-transform">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <span>Salir</span>
          </MenuButton>
        </div>
      </div>
    </>
  );
};

export default Sidebar;