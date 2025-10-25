import { useState } from "react";
import { Package, PackagePlus, ChevronLeft, DollarSign } from "lucide-react";
import FormCreateProduct from "./Product/FormCreateProduct";
import TableProduct from "./Product/TableProduct";
import MassPriceEditor from "./Product/MassPriceEditor"; // Tu componente nuevo

const ProductAdmin = () => {
  const [activeView, setActiveView] = useState<"selection" | "listar" | "crear" | "edicion-masiva">("selection");

  const handleBack = () => setActiveView("selection");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
      {/* Vista de Selección */}
      {activeView === "selection" && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Gestión de Productos</h2>
            <p className="text-slate-300">Selecciona la acción que deseas realizar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Listar Productos */}
            <button
              onClick={() => setActiveView("listar")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-8 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-lg"></div>
                  <div className="relative bg-indigo-600 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Listar Productos</h4>
                  <p className="text-slate-400 text-sm">
                    Consulta, edita y administra todos los productos
                  </p>
                </div>
              </div>
            </button>

            {/* Crear Producto */}
            <button
              onClick={() => setActiveView("crear")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-8 hover:border-emerald-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-lg"></div>
                  <div className="relative bg-emerald-500 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                    <PackagePlus className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Crear Producto</h4>
                  <p className="text-slate-400 text-sm">
                    Añade un nuevo producto al inventario
                  </p>
                </div>
              </div>
            </button>

            {/* Edición Masiva de Precios - NUEVO */}
            <button
              onClick={() => setActiveView("edicion-masiva")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-8 hover:border-amber-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-amber-500/20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-lg"></div>
                  <div className="relative bg-amber-500 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Edición Masiva de Precios</h4>
                  <p className="text-slate-400 text-sm">
                    Actualiza precios de múltiples productos
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Vista Listar */}
      {activeView === "listar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Listar Productos</h3>
                <p className="text-slate-300 text-sm">Administra todos los productos del inventario</p>
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
          <TableProduct />
        </div>
      )}

      {/* Vista Crear */}
      {activeView === "crear" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-lg p-2">
                <PackagePlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Crear Producto</h3>
                <p className="text-slate-300 text-sm">Añade un nuevo producto al inventario</p>
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
          <FormCreateProduct />
        </div>
      )}

      {/* Vista Edición Masiva - NUEVO */}
      {activeView === "edicion-masiva" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 rounded-lg p-2">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Edición Masiva de Precios</h3>
                <p className="text-slate-300 text-sm">Actualiza precios de múltiples productos simultáneamente</p>
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
          <MassPriceEditor />
        </div>
      )}
    </div>
  );
};

export default ProductAdmin;