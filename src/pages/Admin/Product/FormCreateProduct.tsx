import apiClubNorte from "@/api/apiClubNorte";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import { getApiError } from "@/utils/apiError";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface ProductFormData {
  category_id: number;
  code: string;
  description: string;
  name: string;
  price: number;
}

const postProduct = async (formData: ProductFormData) => {
  const { data } = await apiClubNorte.post(
    "/api/v1/product/create",
    formData,
    { withCredentials: true }
  );
  return data;
};

const FormCreateProduct = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>();

  const { categories, isLoading, isError, error } = useGetAllCategories();

  const { mutate, isPending, error: mutationError } = useMutation({
    mutationFn: postProduct,
    onSuccess: (data) => {
      alert("✅ Producto creado con éxito");
      console.log("Producto creado:", data);
      reset();
      // invalidateQueries(["getAllProducts"])
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear producto:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutate(data);
  };

  const inputClass =
    "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Obtener mensaje de error de la mutación
  const mutationApiError = getApiError(mutationError);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          Crear Producto
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
          {/* Categoría */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Categoría</label>
            <select
              {...register("category_id", {
                required: "La categoría es obligatoria",
                valueAsNumber: true,
              })}
              className={inputClass}
              disabled={isLoading || isError || isPending}
            >
              <option value="">
                {isLoading ? "Cargando categorías..." : "Selecciona una categoría"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-400 text-xs mt-1">
                {errors.category_id.message}
              </p>
            )}
            {isError && (
              <p className="text-red-400 text-xs mt-1">{error?.message}</p>
            )}
          </div>

          {/* Código y Nombre */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-200 mb-1">Código</label>
              <input
                type="text"
                {...register("code", { required: "Código obligatorio" })}
                className={inputClass}
                placeholder="Código"
                disabled={isPending}
              />
              {errors.code && (
                <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-200 mb-1">Nombre</label>
              <input
                type="text"
                {...register("name", { required: "Nombre obligatorio" })}
                className={inputClass}
                placeholder="Nombre"
                disabled={isPending}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Descripción</label>
            <textarea
              {...register("description", { required: "Descripción obligatoria" })}
              rows={2}
              className={inputClass}
              placeholder="Describe el producto"
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Precio</label>
            <input
              type="number"
              step="0.01"
              {...register("price", {
                required: "Precio obligatorio",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser >= 0" },
              })}
              className={`${inputClass} appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              placeholder="0.00"
              disabled={isPending}
            />
            {errors.price && (
              <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
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

export default FormCreateProduct;