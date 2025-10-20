import { useState } from "react";
import { Package, History, ShoppingCart, FileText, ChevronLeft } from "lucide-react";
import TableMovements from "./MovementStock/TableMovements";
import TableReponerStock from "./MovementStock/MovementStockTable";
import FormCreateExpenseBuy from "./MovementStock/FormCreateExpenseBuy";
import TableExpenseBuys from "./MovementStock/TableExpenseBuys";

const MovementStockAdmin = () => {
  const [activeView, setActiveView] = useState<"selection" | "administrar" | "historial" | "compras" | "historial-compras">("selection");

  const handleBack = () => setActiveView("selection");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
      {/* Vista de Selección */}
      {activeView === "selection" && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Gestión de Stock</h2>
            <p className="text-slate-300">Selecciona la acción que deseas realizar</p>
          </div>

          {/* Sección de Administración de Stock */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Administración de Stock</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveView("administrar")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-lg"></div>
                    <div className="relative bg-indigo-600 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">Administrar Stock</h4>
                    <p className="text-slate-400 text-sm">
                      Mover y gestionar inventario entre ubicaciones
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView("historial")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-lg"></div>
                    <div className="relative bg-indigo-600 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                      <History className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">Historial de Movimientos</h4>
                    <p className="text-slate-400 text-sm">
                      Consulta todos los movimientos de stock realizados
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Sección de Compras */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Gestión de Compras</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveView("compras")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 hover:border-emerald-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-lg"></div>
                    <div className="relative bg-emerald-500 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                      <ShoppingCart className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">Registrar Compra</h4>
                    <p className="text-slate-400 text-sm">
                      Añade nuevas compras al sistema de inventario
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveView("historial-compras")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 hover:border-emerald-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-lg"></div>
                    <div className="relative bg-emerald-500 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-white mb-2">Historial de Compras</h4>
                    <p className="text-slate-400 text-sm">
                      Revisa todas las compras registradas en el sistema
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Administrar Stock */}
      {activeView === "administrar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Administrar Stock</h3>
                <p className="text-slate-300 text-sm">Gestiona el inventario entre ubicaciones</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Menú
            </button>
          </div>
          <TableReponerStock />
        </div>
      )}

      {/* Vista Historial Movimientos */}
      {activeView === "historial" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Historial de Movimientos</h3>
                <p className="text-slate-300 text-sm">Consulta los movimientos de stock realizados</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Menú
            </button>
          </div>
          <TableMovements />
        </div>
      )}

      {/* Vista Registrar Compra */}
      {activeView === "compras" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-lg p-2">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Registrar Compra</h3>
                <p className="text-slate-300 text-sm">Añade nuevas compras al inventario</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Menú
            </button>
          </div>
          <FormCreateExpenseBuy />
        </div>
      )}

      {/* Vista Historial Compras */}
      {activeView === "historial-compras" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-lg p-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Historial de Compras</h3>
                <p className="text-slate-300 text-sm">Revisa las compras registradas</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Menú
            </button>
          </div>
          <TableExpenseBuys />
        </div>
      )}
    </div>
  );
};

export default MovementStockAdmin;