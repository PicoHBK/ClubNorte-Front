import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type LucideIcon, Store, PackageCheck, FileSpreadsheet, } from 'lucide-react';

interface Informe {
  id: number;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  ruta: string;
  color: string;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();


const informes: Informe[] = [
  {
    id: 1,
    titulo: 'Rentabilidad por Punto de Venta',
    descripcion: 'Comparativa de rendimiento económico entre sucursales',
    icono: Store,
    ruta: '/reports/puntos-venta-rentabilidad',
    color: 'from-indigo-600 to-indigo-500'
  },
  {
    id: 2,
    titulo: 'Productos Más Rentables',
    descripcion: 'Ranking de productos con mejor margen de ganancia',
    icono: PackageCheck,
    ruta: '/reports/productos-rentables',
    color: 'from-emerald-500 to-emerald-400'
  },
  {
    id: 4,
    titulo: 'Control de Stock',
    descripcion: 'Informe de Stock',
    icono: PackageCheck,
    ruta: '/reports/informe-stock',
    color: 'from-emerald-500 to-emerald-400'
  },
  {
    id: 3,
    titulo: 'Descargar Reporte en Excel',
    descripcion: 'Descarga un archivo Excel con todos los datos consolidados',
    icono: FileSpreadsheet,
    ruta: '/reports/descargar-informe',
    color: 'from-indigo-600 to-indigo-500'
  }
];


  const irAInforme = (ruta: string): void => {
    navigate(ruta);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Panel de Informes
          </h1>
          <p className="text-slate-300 text-base sm:text-lg px-4">
            Selecciona un informe para ver la información detallada
          </p>
        </div>

        {/* Grid de Informes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {informes.map((informe) => {
            const IconComponent = informe.icono;
            return (
              <button
                key={informe.id}
                onClick={() => irAInforme(informe.ruta)}
                className="group text-left w-full"
              >
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-105 hover:bg-white/15 h-full flex flex-col min-h-[180px]">
                  {/* Icono */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${informe.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>

                  {/* Contenido */}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {informe.titulo}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm flex-grow">
                    {informe.descripcion}
                  </p>

                  {/* Indicador */}
                  <div className="mt-3 sm:mt-4 flex items-center text-indigo-400 font-semibold text-xs sm:text-sm">
                    <span>Ver informe</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;