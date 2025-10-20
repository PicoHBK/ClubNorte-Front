import { useState, useMemo, useCallback } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { Banknote, CreditCard, ShoppingCart, Smartphone } from "lucide-react";
import type { Product } from "@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale";
import ProductSearchInput from "./ProductLogic/ProductSearchInput/ProductSearchInput";
import { useIncomeMutations } from "@/hooks/pointSale/Income/useIncomeMutations";
import type { IncomeCreateData } from "@/hooks/pointSale/Income/incomeTypes";
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import SelectedProductsList from "./ProductLogic/ProductSelected/SelectedProductsList";

interface FormData extends IncomeCreateData {
  product_search?: string; // Solo para el formulario, no se envía al backend
}

export default function FormCreateIncome() {
  const [selectedProducts, setSelectedProducts] = useState<
    Map<number, Product>
  >(new Map());

  // Hook de mutaciones - asumiendo que tiene las mismas propiedades que useCategoryMutations
  const { createIncome, isCreating, createError, isCreated, resetCreateState } =
    useIncomeMutations();

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      description: "",
      items: [],
      payment_method: "efectivo",
      product_search: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });

  // Calcular total
  const total = useMemo(() => {
    return watchedItems.reduce((sum, item) => {
      const product = selectedProducts.get(item.product_id);
      return sum + (product ? product.price * (item.quantity || 0) : 0);
    }, 0);
  }, [watchedItems, selectedProducts]);

  // Agregar producto
  const addProduct = useCallback(
    (product: Product) => {
      if (product.stock <= 0) {
        alert("Este producto no tiene stock disponible");
        return;
      }

      const existingIndex = fields.findIndex(
        (field) => field.product_id === product.id
      );

      setSelectedProducts((prev) => new Map(prev).set(product.id, product));

      if (existingIndex >= 0) {
        const currentQuantity = watchedItems[existingIndex]?.quantity || 0;
        const newQuantity = currentQuantity + 1;

        if (newQuantity > product.stock) {
          alert(
            `No puedes agregar más unidades. Stock disponible: ${product.stock}`
          );
          return;
        }

        setValue(`items.${existingIndex}.quantity`, newQuantity);
        clearErrors(`items.${existingIndex}.quantity`);
      } else {
        append({ product_id: product.id, quantity: 1 });
      }
    },
    [fields, watchedItems, setValue, append, clearErrors]
  );

  // Cambiar cantidad
  const updateQuantity = useCallback(
    (index: number, delta: number) => {
      const currentQuantity = watchedItems[index]?.quantity || 0;
      const newQuantity = Math.max(1, currentQuantity + delta);
      const productId = fields[index]?.product_id;
      const product = selectedProducts.get(productId);

      if (product && newQuantity > product.stock) {
        alert(`Stock máximo: ${product.stock}`);
        return;
      }

      setValue(`items.${index}.quantity`, newQuantity);
      clearErrors(`items.${index}.quantity`);
    },
    [watchedItems, fields, selectedProducts, setValue, clearErrors]
  );

  // Remover producto
  const removeProduct = useCallback(
    (index: number, productId: number) => {
      setSelectedProducts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(productId);
        return newMap;
      });
      remove(index);
    },
    [remove]
  );

  // Función para resetear todo el formulario
  const resetForm = useCallback(() => {
    reset();
    setSelectedProducts(new Map());
  }, [reset]);

  // Submit
  const onSubmit = useCallback(
    (data: FormData) => {
      let hasStockErrors = false;

      data.items.forEach((item, index) => {
        const product = selectedProducts.get(item.product_id);
        if (product && item.quantity > product.stock) {
          setError(`items.${index}.quantity`, {
            type: "manual",
            message: `Stock máximo: ${product.stock}`,
          });
          hasStockErrors = true;
        }
      });

      if (hasStockErrors) {
        alert("Por favor corrige los errores de stock antes de continuar");
        return;
      }

      // Crear objeto sin product_search usando rest operator
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { product_search, ...submitData } = data;
      createIncome(submitData, {
        onSuccess: () => {
          resetForm(); // Resetear formulario después del éxito
        },
      });
    },
    [selectedProducts, setError, createIncome, resetForm]
  );

  // Obtener mensaje de error de la mutación
  const mutationApiError = getApiError(createError);

  // Si el ingreso fue creado exitosamente, mostrar mensaje de éxito
  if (isCreated) {
    return (
      <SuccessMessage
        title="¡Ingreso Creado!"
        description="El ingreso ha sido registrado exitosamente y el inventario ha sido actualizado."
        primaryButton={{
          text: "Crear Otro",
          onClick: () => {
            resetCreateState();
            resetForm();
          },
          variant: "indigo",
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header optimizado para tablet */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Crear Ingreso</h1>
                <p className="text-slate-300 text-sm">
                  Registra un nuevo ingreso con productos
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm">{fields.length} productos</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Mostrar error de mutación si existe */}
            {mutationApiError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6">
                <p className="text-red-400 text-center">
                  {mutationApiError.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Layout optimizado para tablet - descripción removida del área principal */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Columna izquierda - Info esencial (2/5) */}
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      Método de pago
                    </label>
                    <div className="flex flex-wrap gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
                      {[
                        {
                          value: "efectivo",
                          label: "Efectivo",
                          Icon: Banknote,
                        },
                        {
                          value: "tarjeta",
                          label: "Tarjeta",
                          Icon: CreditCard,
                        },
                        {
                          value: "transferencia",
                          label: "Transferencia",
                          Icon: Smartphone,
                        },
                      ].map(({ value, label, Icon }) => (
                        <label
                          key={value}
                          className="cursor-pointer flex-1 min-w-[100px]"
                        >
                          <input
                            type="radio"
                            {...register("payment_method")}
                            value={value}
                            className="sr-only peer"
                            disabled={isCreating}
                          />
                          <div
                            className="flex items-center justify-center gap-1 py-3 px-2 rounded-md text-center transition-all 
                        peer-checked:bg-indigo-600 peer-checked:text-white 
                        text-slate-400 hover:text-slate-300 
                        peer-checked:shadow-md peer-disabled:opacity-50 
                        peer-disabled:cursor-not-allowed min-h-[48px]"
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
                              {label}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Total destacado */}
                  <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl p-5 border border-emerald-500/30">
                    <div className="text-center">
                      <div className="text-slate-300 text-sm mb-1">
                        Total a pagar
                      </div>
                      <div className="text-3xl font-bold text-emerald-400">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(total)}
                      </div>

                      {fields.length > 0 && (
                        <div className="text-slate-400 text-xs mt-1">
                          {fields.length} productos
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Columna derecha - Productos (3/5) */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Productos
                  </label>

                  {/* Buscador */}
                  <div className="mb-4">
                    <Controller
                      name="product_search"
                      control={control}
                      render={({ field }) => (
                        <ProductSearchInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          onProductSelect={addProduct}
                          selectedProducts={Array.from(
                            selectedProducts.values()
                          )}
                          placeholder="Buscar productos..."
                          disabled={isCreating}
                        />
                      )}
                    />
                  </div>

                  {/* Lista de productos - Ahora usando el componente separado */}
                  <SelectedProductsList
                    fields={fields}
                    selectedProducts={selectedProducts}
                    watchedItems={watchedItems}
                    updateQuantity={updateQuantity}
                    removeProduct={removeProduct}
                    register={register}
                    isCreating={isCreating}
                  />
                </div>
              </div>

              {/* Submit button mejorado */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={fields.length === 0 || isCreating}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-[1.01] disabled:hover:scale-100 disabled:opacity-60 text-lg shadow-lg"
                  >
                    {isCreating
                      ? "Creando ingreso..."
                      : fields.length === 0
                      ? "Agrega productos para continuar"
                      : `Crear Ingreso • $${total.toFixed(2)}`}
                  </button>

                  {/* Botón para limpiar estado si hay error */}
                  {createError && (
                    <button
                      type="button"
                      onClick={() => resetCreateState()}
                      className="px-6 bg-slate-600 hover:bg-slate-500 text-white font-medium py-4 rounded-xl text-sm transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Descripción opcional al final */}
              <div className="pt-4 border-t border-white/5">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white transition-colors py-2">
                    <span className="text-sm font-medium">
                      Descripción (opcional)
                    </span>
                    <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="pt-3">
                    <textarea
                      {...register("description")}
                      disabled={isCreating}
                      className="w-full px-4 py-3 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Descripción del ingreso (opcional)..."
                      rows={3}
                    />
                  </div>
                </details>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
