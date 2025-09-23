import SuccessMessage from "@/components/generic/SuccessMessage";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import type { ProductCreateData } from "@/hooks/admin/Product/productType";
import { useProductMutations } from "@/hooks/admin/Product/useProductMutations";
import { getApiError } from "@/utils/apiError";
import { useForm } from "react-hook-form";

const FormCreateProduct = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductCreateData>();

  const { categories, isLoading, isError, error } = useGetAllCategories();
  
  // Usar el hook centralizado de mutaciones
  const { 
    createProduct, 
    isCreating, 
    createError, 
    isCreated,
    resetCreateState 
  } = useProductMutations();

  const onSubmit = (data: ProductCreateData) => {
    createProduct(data, {
      onSuccess: () => {
        reset(); // Resetear formulario después del éxito
      }
    });
  };

  const inputClass =
    "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Obtener mensaje de error de la mutación
  const mutationApiError = getApiError(createError);

  // Si el producto fue creado exitosamente, mostrar mensaje de éxito
  if (isCreated) {
    return (
      <SuccessMessage
        title="¡Producto Creado!"
        description="El producto ha sido creado exitosamente y ya está disponible en el inventario."
        primaryButton={{
          text: "Crear Otro",
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
              disabled={isLoading || isError || isCreating}
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
                disabled={isCreating}
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
                disabled={isCreating}
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
              disabled={isCreating}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Precio y Cantidad Mínima */}
          <div className="grid grid-cols-2 gap-2">
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
                disabled={isCreating}
              />
              {errors.price && (
                <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-200 mb-1">Stock Mínimo</label>
              <input
                type="number"
                {...register("min_amount", {
                  required: "Stock mínimo obligatorio",
                  valueAsNumber: true,
                  min: { value: 0, message: "Debe ser >= 0" },
                })}
                className={`${inputClass} appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                placeholder="Ej: 10"
                disabled={isCreating}
              />
              {errors.min_amount && (
                <p className="text-red-400 text-xs mt-1">{errors.min_amount.message}</p>
              )}
            </div>
          </div>

          {/* Notificador */}
          <div>
            <label className="flex items-center space-x-2 text-xs text-slate-200">
              <input
                type="checkbox"
                {...register("notifier")}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500 focus:ring-2"
                disabled={isCreating}
              />
              <span>Notificar cuando el stock sea menor al mínimo</span>
            </label>
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

export default FormCreateProduct;