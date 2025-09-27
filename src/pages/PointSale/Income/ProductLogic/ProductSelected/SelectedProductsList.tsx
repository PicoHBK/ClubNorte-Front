import { Search, X, Edit3 } from 'lucide-react';
import { type UseFormRegister, type FieldArrayWithId } from 'react-hook-form';
import { useState } from 'react';
import QuantityEditModal from './QuantityEditModal';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import type { IncomeCreateData } from '@/hooks/pointSale/Income/incomeTypes';

interface FormData extends IncomeCreateData {
  product_search?: string;
}

interface SelectedProductsListProps {
  fields: FieldArrayWithId<FormData, "items", "id">[];
  selectedProducts: Map<number, Product>;
  watchedItems: Array<{ product_id: number; quantity: number }>;
  updateQuantity: (index: number, delta: number) => void;
  removeProduct: (index: number, productId: number) => void;
  register: UseFormRegister<FormData>;
  isCreating: boolean;
}

interface SelectedItem {
  index: number;
  product: Product;
  currentQuantity: number;
}

export default function SelectedProductsList({
  fields,
  selectedProducts,
  watchedItems,
  updateQuantity,
  removeProduct,
  register,
  isCreating
}: SelectedProductsListProps) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const openQuantityDialog = (index: number, product: Product, currentQuantity: number) => {
    setSelectedItem({ index, product, currentQuantity });
  };

  const closeDialog = () => {
    setSelectedItem(null);
  };

  const handleQuantityConfirm = (index: number, delta: number) => {
    updateQuantity(index, delta);
  };

  if (fields.length === 0) {
    return (
      <div className="border border-slate-700 rounded-xl bg-slate-800/50 overflow-hidden">
        <div className="text-center py-8 text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium mb-1">No hay productos agregados</p>
          <p className="text-sm opacity-75">Usa el buscador para agregar productos</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border border-slate-700 rounded-xl bg-slate-800/50 overflow-hidden">
        
        {/* TABLET/MÓVIL - Cards */}
        <div className="divide-y divide-slate-700/50 lg:hidden">
          {fields.map((field, index) => {
            const product = selectedProducts.get(field.product_id);
            const quantity = watchedItems[index]?.quantity || 0;
            const subtotal = (product?.price || 0) * quantity;
            const isLastItem = index === fields.length - 1;

            return (
              <div key={field.id} className="group relative">
                {/* Input oculto para React Hook Form */}
                <input
                  type="hidden"
                  {...register(`items.${index}.quantity`, { 
                    valueAsNumber: true,
                    min: 1,
                    max: product?.stock || 999,
                  })}
                />
                
                {/* Card clickeable con resaltado para último item */}
                <div 
                  className={`px-4 py-4 transition-colors cursor-pointer ${
                    isLastItem 
                      ? 'bg-indigo-900/30 border-l-4 border-indigo-500 hover:bg-indigo-800/40' 
                      : 'hover:bg-slate-700/20'
                  }`}
                  onClick={() => {
                    if (product) {
                      openQuantityDialog(index, product, quantity);
                    }
                  }}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header: Nombre + Eliminar */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-base truncate">
                          {product?.name || 'Producto'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Stock: {product?.stock || 0} • Código: {product?.code || 'N/A'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProduct(index, field.product_id);
                        }}
                        disabled={isCreating}
                        className="ml-3 w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info row: Precio, Cantidad, Subtotal */}
                    <div className="flex items-center justify-between">
                      <div className="text-slate-300 font-medium">
                        ${product?.price?.toFixed(2) || '0.00'}
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded-lg">
                        <span className="text-sm text-slate-300">Cant:</span>
                        <span className="text-sm font-medium text-white min-w-[2ch] text-center">
                          {quantity}
                        </span>
                        <Edit3 className="w-3 h-3 text-slate-400" />
                      </div>

                      <div className="text-emerald-400 font-semibold">
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicador visual mejorado */}
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <div className={`w-1 h-8 rounded-full transition-opacity ${
                    isLastItem 
                      ? 'bg-indigo-500 opacity-100' 
                      : 'bg-slate-600 opacity-0 group-hover:opacity-100'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP - Tabla real */}
        <div className="hidden lg:block">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-700/30">
                <tr className="text-xs font-medium text-slate-300">
                  <th className="text-left px-4 py-3 w-[40%]">PRODUCTO</th>
                  <th className="text-center px-2 py-3 w-[25%]">PRECIO × CANT</th>
                  <th className="text-right px-4 py-3 w-[25%]">SUBTOTAL</th>
                  <th className="w-[10%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {fields.map((field, index) => {
                  const product = selectedProducts.get(field.product_id);
                  const quantity = watchedItems[index]?.quantity || 0;
                  const subtotal = (product?.price || 0) * quantity;
                  const isLastItem = index === fields.length - 1;

                  return (
                    <tr 
                      key={field.id}
                      className={`transition-colors cursor-pointer group ${
                        isLastItem 
                          ? 'bg-indigo-900/20 hover:bg-indigo-800/30 border-l-4 border-indigo-500' 
                          : 'hover:bg-slate-700/20'
                      }`}
                      onClick={() => {
                        if (product) {
                          openQuantityDialog(index, product, quantity);
                        }
                      }}
                    >
                      {/* Input oculto para React Hook Form */}
                      <td className="hidden">
                        <input
                          type="hidden"
                          {...register(`items.${index}.quantity`, { 
                            valueAsNumber: true,
                            min: 1,
                            max: product?.stock || 999,
                          })}
                        />
                      </td>

                      {/* Producto */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-white text-sm truncate mb-0.5">
                          {product?.name || 'Producto no encontrado'}
                        </div>
                        <div className="text-xs text-slate-400">
                          Stock: {product?.stock || 0} • Código: {product?.code || 'N/A'}
                        </div>
                      </td>

                      {/* Precio × Cantidad */}
                      <td className="px-2 py-3 text-center">
                        <div className="text-slate-300 text-sm">
                          ${product?.price?.toFixed(2) || '0.00'} × {quantity}
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-emerald-400 font-semibold text-sm">
                          ${subtotal.toFixed(2)}
                        </div>
                      </td>

                      {/* Eliminar */}
                      <td className="px-2 py-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProduct(index, field.product_id);
                          }}
                          disabled={isCreating}
                          className="w-6 h-6 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center disabled:opacity-50 mx-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal separado - usando QuantityEditModal */}
      <QuantityEditModal
        selectedItem={selectedItem}
        onClose={closeDialog}
        onConfirm={handleQuantityConfirm}
      />
    </>
  );
}