import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import { useMutation } from "@tanstack/react-query";
import { useForm } from 'react-hook-form';

interface CategoryFormData {
  name: string;
}

const postCategory = async (formData: CategoryFormData) => {
  const { data } = await apiClubNorte.post(
    "/api/v1/category/create", // ajusta la URL según tu API
    formData,
    { withCredentials: true }
  );
  return data;
};

const FormCreateCategory = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CategoryFormData>();

  const invalidateQueries = useInvalidateQueries();

  const { mutate, isPending, error: mutationError } = useMutation({
    mutationFn: postCategory,
    onSuccess: async (data) => {
      alert("✅ Categoría creada con éxito");
      await invalidateQueries(["getAllCategories"])
      console.log("Categoría creada:", data);
      reset();
      // invalidateQueries(["getAllCategories"]) // si quieres refrescar lista
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear categoría:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    mutate(data);
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Procesar error de mutación para mostrar en UI
  const mutationApiError = getApiError(mutationError);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 text-center">Crear Categoría</h2>

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
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Creando..." : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormCreateCategory;