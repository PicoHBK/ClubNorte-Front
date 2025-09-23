import SuccessMessage from "@/components/generic/SuccessMessage";
import type { CategoryCreateData } from "@/hooks/admin/Category/categoryType";
import { useCategoryMutations } from "@/hooks/admin/Category/useCategoryMutations";
import { getApiError } from "@/utils/apiError";
import { useForm } from 'react-hook-form';

const FormCreateCategory = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CategoryCreateData>();

  // Usar el hook centralizado de mutaciones
  const { 
    createCategory, 
    isCreating, 
    createError, 
    isCreated,
    resetCreateState 
  } = useCategoryMutations();

  const onSubmit = (data: CategoryCreateData) => {
    createCategory(data, {
      onSuccess: () => {
        reset(); // Resetear formulario después del éxito
      }
    });
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Obtener mensaje de error de la mutación
  const mutationApiError = getApiError(createError);

  // Si la categoría fue creada exitosamente, mostrar mensaje de éxito
  if (isCreated) {
    return (
      <SuccessMessage
        title="¡Categoría Creada!"
        description="La categoría ha sido creada exitosamente y ya está disponible para asignar a productos."
        primaryButton={{
          text: "Crear Otra",
          onClick: () => {
            resetCreateState();
            reset();
          },
          variant: 'indigo'
        }}

      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          Crear Categoría
        </h2>

        {/* Mostrar error de mutación si existe */}
        {mutationApiError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              {mutationApiError.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
              disabled={isCreating}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
              disabled={isCreating}
            >
              {isCreating ? "Creando..." : "Crear"}
            </button>

            {/* Botón para limpiar estado si hay error */}
            {createError && (
              <button
                type="button"
                onClick={() => resetCreateState()}
                className="px-3 bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 rounded-md text-sm transition"
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCreateCategory;