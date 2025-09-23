import { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { Edit, AlertCircle } from 'lucide-react';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import ProductSearchInput from './ProductLogic/ProductSearchInput/ProductSearchInput';
import { useIncomeMutations } from '@/hooks/pointSale/Income/useIncomeMutations';
import { useGetIncomeById } from '@/hooks/pointSale/Income/useGetIncomeById';
import type { IncomeUpdateData } from '@/hooks/pointSale/Income/incomeTypes';
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import SelectedProductsListEdit from './ProductLogic/ProductSelected/SelectedProductsListEdit';

interface FormData extends IncomeUpdateData {
  product_search: string; // Solo para el formulario, no se envía al backend
}

interface Props {
  incomeId: number;
}

export default function FormEditIncome({ incomeId }: Props) {
  const [selectedProducts, setSelectedProducts] = useState<Map<number, Product>>(new Map());

  // Hook para obtener los datos del ingreso
  const { income, isLoading: isLoadingIncome, isError } = useGetIncomeById(incomeId);

  // Hook de mutaciones
  const { 
    updateIncome, 
    isUpdating, 
    updateError, 
    isUpdated,
    resetUpdateState 
  } = useIncomeMutations();

  // Form setup
  const { register, control, handleSubmit, setValue, setError, clearErrors, reset } = useForm<FormData>({
    defaultValues: {
      id: incomeId,
      description: '',
      items: [],
      payment_method: 'efectivo',
      product_search: ''
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = useWatch({
    control,
    name: 'items',
    defaultValue: []
  });

  // Cargar datos del ingreso cuando se obtengan
  useEffect(() => {
    if (income) {
      // Crear mapa de productos seleccionados
      const productsMap = new Map<number, Product>();
      const items = income.items.map(item => {
        const product: Product = {
          id: item.product.id,
          code: item.product.code,
          name: item.product.name,
          price: item.product.price,
          stock: item.product.price, // Nota: necesitarías el stock real del producto
          category: { id: 0, name: '' } // Valor por defecto corregido
        };
        productsMap.set(product.id, product);
        return {
          product_id: item.product.id,
          quantity: item.quantity
        };
      });

      setSelectedProducts(productsMap);
      
      // Resetear formulario con datos cargados
      reset({
        id: income.id,
        description: income.description,
        items: items,
        payment_method: income.payment_method,
        product_search: ''
      });

      // Reemplazar items del formulario
      replace(items);
    }
  }, [income, reset, replace]);

  // Calcular total
  const total = useMemo(() => {
    return watchedItems.reduce((sum, item) => {
      const product = selectedProducts.get(item.product_id);
      return sum + (product ? product.price * (item.quantity || 0) : 0);
    }, 0);
  }, [watchedItems, selectedProducts]);

  // Agregar producto
  const addProduct = useCallback((product: Product) => {
    if (product.stock <= 0) {
      alert('Este producto no tiene stock disponible');
      return;
    }

    const existingIndex = fields.findIndex(field => field.product_id === product.id);
    
    setSelectedProducts(prev => new Map(prev).set(product.id, product));
    
    if (existingIndex >= 0) {
      const currentQuantity = watchedItems[existingIndex]?.quantity || 0;
      const newQuantity = currentQuantity + 1;
      
      if (newQuantity > product.stock) {
        alert(`No puedes agregar más unidades. Stock disponible: ${product.stock}`);
        return;
      }
      
      setValue(`items.${existingIndex}.quantity`, newQuantity);
      clearErrors(`items.${existingIndex}.quantity`);
    } else {
      append({ product_id: product.id, quantity: 1 });
    }
  }, [fields, watchedItems, setValue, append, clearErrors]);

  // Cambiar cantidad
  const updateQuantity = useCallback((index: number, delta: number) => {
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
  }, [watchedItems, fields, selectedProducts, setValue, clearErrors]);

  // Remover producto
  const removeProduct = useCallback((index: number, productId: number) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
    remove(index);
  }, [remove]);

  // Submit
  const onSubmit = useCallback((data: FormData) => {
    let hasStockErrors = false;
    
    data.items.forEach((item, index) => {
      const product = selectedProducts.get(item.product_id);
      if (product && item.quantity > product.stock) {
        setError(`items.${index}.quantity`, {
          type: 'manual',
          message: `Stock máximo: ${product.stock}`
        });
        hasStockErrors = true;
      }
    });

    if (hasStockErrors) {
      alert('Por favor corrige los errores de stock antes de continuar');
      return;
    }

    // Crear objeto sin product_search usando rest operator
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { product_search, ...submitData } = data;
    updateIncome(submitData);
  }, [selectedProducts, setError, updateIncome]);

  // Obtener mensaje de error de la mutación
  const mutationApiError = getApiError(updateError);

  // Loading state
  if (isLoadingIncome) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
          <p className="text-slate-300 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Error loading income o No encontrado
  if (isError || !income && !isLoadingIncome) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-300 bg-slate-900/80 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
        <AlertCircle className="w-6 h-6 mb-2 text-slate-400" />
        <span className="text-sm">No se encontró el ingreso</span>
      </div>
    );
  }

  // Si el ingreso fue actualizado exitosamente, mostrar mensaje de éxito
  if (isUpdated) {
    return (
      <SuccessMessage
        title="¡Actualizado!"
        description="Ingreso actualizado exitosamente."
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
        <h3 className="text-lg font-semibold text-white">Editar Ingreso #{incomeId}</h3>
      </div>

      {/* Error de mutación */}
      {mutationApiError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded p-2">
          <p className="text-red-400 text-sm text-center">{mutationApiError.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Descripción */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Descripción</label>
          <textarea
            {...register('description')}
            disabled={isUpdating}
            className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded text-sm focus:ring-1 focus:ring-indigo-500 resize-none disabled:opacity-50"
            placeholder="Descripción del ingreso..."
            rows={2}
          />
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Método de pago</label>
          <div className="flex gap-2">
            {[
              { value: 'efectivo', label: 'Efectivo' },
              { value: 'tarjeta', label: 'Tarjeta' },
              { value: 'transferencia', label: 'Transferencia' }
            ].map(({ value, label }) => (
              <label key={value} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  {...register('payment_method')}
                  value={value}
                  className="sr-only peer"
                  disabled={isUpdating}
                />
                <div className="py-2 px-3 bg-slate-800 border border-slate-700 rounded text-center text-sm peer-checked:bg-indigo-600 peer-checked:border-indigo-500 text-slate-300 peer-checked:text-white hover:bg-slate-700 transition-all">
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Buscador de productos */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Agregar productos</label>
          <Controller
            name="product_search"
            control={control}
            render={({ field }) => (
              <ProductSearchInput
                value={field.value}
                onChange={field.onChange}
                onProductSelect={addProduct}
                selectedProducts={Array.from(selectedProducts.values())}
                placeholder="Buscar productos..."
                disabled={isUpdating}
              />
            )}
          />
        </div>

        {/* Lista de productos - Ahora usando el componente reutilizable */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Productos ({fields.length})</label>
          <SelectedProductsListEdit
            fields={fields}
            selectedProducts={selectedProducts}
            watchedItems={watchedItems}
            updateQuantity={updateQuantity}
            removeProduct={removeProduct}
            register={register}
            isCreating={isUpdating}
          />
        </div>

        {/* Total y botón */}
        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-300 text-sm">Total:</div>
            <div className="text-xl font-bold text-emerald-400">${total.toFixed(2)}</div>
          </div>
          
          <button
            type="submit"
            disabled={fields.length === 0 || isUpdating}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded transition-all text-sm"
          >
            {isUpdating 
              ? 'Actualizando...' 
              : fields.length === 0 
                ? 'Agrega productos' 
                : 'Actualizar Ingreso'
            }
          </button>
        </div>
      </form>
    </div>
  );
}