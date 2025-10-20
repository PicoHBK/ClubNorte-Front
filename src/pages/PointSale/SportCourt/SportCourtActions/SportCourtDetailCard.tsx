import React from 'react';
import { Store, Calendar, FileText } from "lucide-react";
import { useGetSportCourtById } from '@/hooks/pointSale/SportCourt/useGetSportCourtById';

interface SportCourtDetailCardProps {
  id: number;
}

const SportCourtDetailCard: React.FC<SportCourtDetailCardProps> = ({ id }) => {
  const { sportCourt, isLoading, isError, error } = useGetSportCourtById(id);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !sportCourt) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6">
        <div className="text-center">
          <p className="text-red-400 text-sm">
            {error?.message || "Error al cargar la cancha deportiva"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 space-y-4">
      {/* Header con ID y Código */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-xl font-bold text-white">
          {sportCourt.name}
        </h2>
        <span className="text-sm text-slate-400 font-mono">
          ID: {sportCourt.id}
        </span>
      </div>

      {/* Código */}
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-indigo-400" />
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Código</p>
          <p className="text-white font-medium">{sportCourt.code}</p>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-wide">Descripción</p>
        <p className="text-slate-300 text-sm leading-relaxed">
          {sportCourt.description}
        </p>
      </div>

      {/* Puntos de Venta */}
      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-wide">Puntos de Venta</p>
        {sportCourt.point_sales && sportCourt.point_sales.length > 0 ? (
          <div className="space-y-2">
            {sportCourt.point_sales.map((pointSale) => (
              <div key={pointSale.id} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                <Store className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{pointSale.name}</p>
                  <p className="text-slate-400 text-xs">{pointSale.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm italic">
            No hay puntos de venta asignados
          </p>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Creada</p>
            <p className="text-slate-300 text-sm">
              {new Date(sportCourt.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Actualizada</p>
            <p className="text-slate-300 text-sm">
              {new Date(sportCourt.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportCourtDetailCard;