import { Search, X, Plus, Minus } from 'lucide-react';
import { type UseFormRegister, type FieldArrayWithId } from 'react-hook-form';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import type { IncomeUpdateData } from '@/hooks/pointSale/Income/incomeTypes';

interface FormData extends IncomeUpdateData {
  product_search: string;
}

interface SelectedProductsListEditProps {
  fields: FieldArrayWithId<FormData, "items", "id">[];
  selectedProducts: Map<number, Product>;
  watchedItems: Array<{ product_id: number; quantity: number }>;
  updateQuantity: (index: number, delta: number) => void;
  removeProduct: (index: number, productId: number) => void;
  register: UseFormRegister<FormData>;
  isCreating: boolean;
}

export default function SelectedProductsListEdit({
  fields,
  selectedProducts,
  watchedItems,
  updateQuantity,
  removeProduct,
  register,
  isCreating
}: SelectedProductsListEditProps) {
  
  if (fields.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded max-h-60 overflow-y-auto">
        <div className="text-center py-6 text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay productos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded max-h-60 overflow-y-auto">
      <div className="divide-y divide-slate-700">
        {fields.map((field, index) => {
          const product = selectedProducts.get(field.product_id);
          const quantity = watchedItems[index]?.quantity || 0;
          const subtotal = (product?.price || 0) * quantity;

          return (
            <div key={field.id} className="p-3 hover:bg-slate-700/30">
              
              {/* Fila 1: Producto y precio */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">
                    {product?.name || 'Producto no encontrado'}
                  </div>
                  <div className="text-xs text-slate-400">
                    Stock: {product?.stock || 0} • ${product?.price?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold ml-2">
                  ${subtotal.toFixed(2)}
                </div>
              </div>

              {/* Fila 2: Controles de cantidad */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(index, -1)}
                    disabled={quantity <= 1 || isCreating}
                    className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 flex items-center justify-center text-white transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  
                  <input
                    type="number"
                    min="1"
                    max={product?.stock || 999}
                    {...register(`items.${index}.quantity`, { 
                      valueAsNumber: true,
                      min: 1,
                      max: product?.stock || 999,
                      onChange: (e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        if (product && newQuantity > product.stock) {
                          // setValue será llamado desde el componente padre
                        }
                      }
                    })}
                    disabled={isCreating}
                    className="w-12 h-7 px-2 bg-slate-700 text-white text-center border border-slate-600 rounded text-sm focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  
                  <button
                    type="button"
                    onClick={() => updateQuantity(index, 1)}
                    disabled={quantity >= (product?.stock || 0) || isCreating}
                    className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 flex items-center justify-center text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeProduct(index, field.product_id)}
                  disabled={isCreating}
                  className="w-7 h-7 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}