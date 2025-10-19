import { useState } from "react";
import { List, Plus, ChevronLeft } from "lucide-react";
import FormCreateCategory from "./Category/FormCreateCategory";
import TableCategories from "./Category/TableCategory";

const CategoryAdmin = () => {
  const [activeView, setActiveView] = useState<"selection" | "listar" | "crear">("selection");

  const handleBack = () => setActiveView("selection");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
      {/* Vista de Selección */}
      {activeView === "selection" && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Gestión de Categorías</h2>
            <p className="text-slate-300">Selecciona la acción que deseas realizar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Listar Categorías */}
            <button
              onClick={() => setActiveView("listar")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-8 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-lg"></div>
                  <div className="relative bg-indigo-600 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                    <List className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Listar Categorías</h4>
                  <p className="text-slate-400 text-sm">
                    Consulta, edita y administra todas las categorías
                  </p>
                </div>
              </div>
            </button>

            {/* Crear Categoría */}
            <button
              onClick={() => setActiveView("crear")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-8 hover:border-emerald-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-lg"></div>
                  <div className="relative bg-emerald-500 rounded-full p-5 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Crear Categoría</h4>
                  <p className="text-slate-400 text-sm">
                    Añade una nueva categoría al sistema
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
                <List className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Listar Categorías</h3>
                <p className="text-slate-300 text-sm">Administra todas las categorías del sistema</p>
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
          <TableCategories />
        </div>
      )}

      {/* Vista Crear */}
      {activeView === "crear" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-lg p-2">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Crear Categoría</h3>
                <p className="text-slate-300 text-sm">Añade una nueva categoría al sistema</p>
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
          <FormCreateCategory />
        </div>
      )}
    </div>
  );
};

export default CategoryAdmin;