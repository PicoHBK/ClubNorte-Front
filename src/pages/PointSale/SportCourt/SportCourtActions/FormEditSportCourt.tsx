import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Edit, AlertCircle } from 'lucide-react';
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import { useGetSportCourtById } from '@/hooks/pointSale/SportCourt/useGetSportCourtById';
import type { SportCourtUpdateData } from '@/hooks/pointSale/SportCourt/SportCourt';
import { useSportCourtMutations } from '@/hooks/pointSale/SportCourt/useSportCourtMutations';

interface Props {
  sportCourtId: number;
}

export default function FormEditSportCourt({ sportCourtId }: Props) {
  // Hook para obtener los datos de la cancha deportiva
  const { sportCourt, isLoading: isLoadingSportCourt, isError } = useGetSportCourtById(sportCourtId);

  // Hook de mutaciones
  const { 
    updateSportCourt, 
    isUpdating, 
    updateError, 
    isUpdated,
    resetUpdateState 
  } = useSportCourtMutations();

  // Form setup
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SportCourtUpdateData>({
    defaultValues: {
      id: sportCourtId,
      code: '',
      description: '',
      name: ''
    }
  });

  // Cargar datos de la cancha cuando se obtengan
  useEffect(() => {
    if (sportCourt) {
      reset({
        id: sportCourt.id,
        code: sportCourt.code,
        description: sportCourt.description,
        name: sportCourt.name
      });
    }
  }, [sportCourt, reset]);

  // Submit
  const onSubmit = (data: SportCourtUpdateData) => {
    updateSportCourt({ id: data.id, data });
  };

  // Obtener mensaje de error de la mutación
  const mutationApiError = getApiError(updateError);

  const inputClass = "w-full px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded text-sm focus:ring-1 focus:ring-indigo-500 disabled:opacity-50";

  // Loading state
  if (isLoadingSportCourt) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
          <p className="text-slate-300 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Error loading sportCourt o No encontrado
  if (isError || !sportCourt && !isLoadingSportCourt) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-300 bg-slate-900/80 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
        <AlertCircle className="w-6 h-6 mb-2 text-slate-400" />
        <span className="text-sm">No se encontró la cancha deportiva</span>
      </div>
    );
  }

  // Si la cancha fue actualizada exitosamente, mostrar mensaje de éxito
  if (isUpdated) {
    return (
      <SuccessMessage
        title="¡Actualizada!"
        description="Cancha deportiva actualizada exitosamente."
        primaryButton={{
          text: "Continuar",
          onClick: resetUpdateState,
          variant: 'indigo'
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      
      {/* Header compacto */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
        <Edit className="w-4 h-4 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Editar Cancha #{sportCourtId}</h3>
      </div>

      {/* Error de mutación */}
      {mutationApiError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded p-2">
          <p className="text-red-400 text-sm text-center">{mutationApiError.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Código */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Código</label>
          <input
            type="text"
            {...register('code', { required: 'Código obligatorio' })}
            className={inputClass}
            placeholder="Ej: CANCHA-01"
            disabled={isUpdating}
          />
          {errors.code && (
            <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Nombre</label>
          <input
            type="text"
            {...register('name', { required: 'Nombre obligatorio' })}
            className={inputClass}
            placeholder="Ej: Cancha de Fútbol Principal"
            disabled={isUpdating}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Descripción</label>
          <textarea
            {...register('description', { required: 'Descripción obligatoria' })}
            className={inputClass}
            placeholder="Describe las características de la cancha deportiva..."
            rows={3}
            disabled={isUpdating}
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Botón actualizar */}
        <div className="pt-2 border-t border-slate-700">
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded transition-all text-sm"
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar Cancha'}
          </button>
        </div>
      </form>
    </div>
  );
}