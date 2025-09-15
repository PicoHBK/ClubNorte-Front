import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetCategoryById } from '@/hooks/admin/Category/useGetCategoryById';
import { useCategoryMutations } from '@/hooks/admin/Category/useCategoryMutations';
import { getApiError } from '@/utils/apiError';

interface CategoryFormData {
  name: string;
}

interface EditDeleteCategoryProps {
  id: number;
  onClose?: () => void; // Opcional para cerrar modal o volver atrás
}

const EditDeleteCategory: React.FC<EditDeleteCategoryProps> = ({ id, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CategoryFormData>();

  // Obtener datos de la categoría
  const { 
    category, 
    isLoading: isLoadingCategory, 
    isError: isErrorCategory, 
    error: categoryError 
  } = useGetCategoryById(id);

  // Hook de mutaciones
  const {
    updateCategory,
    deleteCategory,
    isUpdating,
    isDeleting,
    isUpdated,
    isDeleted,
    updateError,
    deleteError,
    resetUpdateState,
  } = useCategoryMutations();

  // Cargar datos en el formulario cuando se obtenga la categoría
  useEffect(() => {
    if (category) {
      setValue('name', category.name);
    }
  }, [category, setValue]);

  const onSubmit = (data: CategoryFormData) => {
    updateCategory({ id, data });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta categoría?');
    if (confirmDelete) {
      deleteCategory(id);
    }
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Procesar errores para mostrar en UI
  const mutationUpdateError = getApiError(updateError);
  const mutationDeleteError = getApiError(deleteError);

  // Pantalla de éxito para actualización
  if (isUpdated) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Categoría Actualizada!</h2>
              <p className="text-slate-300 text-sm">
                La categoría ha sido actualizada exitosamente
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => resetUpdateState()}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 rounded-md text-sm transition"
              >
                Editar de nuevo
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-md text-sm transition"
                >
                  Volver
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si la categoría fue eliminada exitosamente
  if (isDeleted) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¡Categoría Eliminada!</h2>
              <p className="text-slate-300 text-sm">
                La categoría ha sido eliminada exitosamente
              </p>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-md text-sm transition"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingCategory) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            Cargando categoría...
          </div>
        </div>
      </div>
    );
  }

  if (isErrorCategory) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
            <p className="text-red-400 text-center">
              Error al cargar la categoría: {categoryError?.message || 'Error desconocido'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 rounded-md text-sm transition"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Editar Categoría</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mostrar errores de mutación */}
        {mutationUpdateError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              {mutationUpdateError.message}
            </p>
          </div>
        )}

        {mutationDeleteError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              Error al eliminar: {mutationDeleteError.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Nombre</label>
            <input
              type="text"
              {...register('name', {
                required: 'Nombre obligatorio',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres'
                },
                maxLength: {
                  value: 50,
                  message: 'El nombre no puede exceder los 50 caracteres'
                }
              })}
              className={inputClass}
              placeholder="Nombre de la categoría"
              disabled={isUpdating || isDeleting}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
              disabled={isUpdating || isDeleting}
            >
              {isUpdating ? "Actualizando..." : "Actualizar"}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
              disabled={isUpdating || isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            ID: {category?.id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditDeleteCategory;