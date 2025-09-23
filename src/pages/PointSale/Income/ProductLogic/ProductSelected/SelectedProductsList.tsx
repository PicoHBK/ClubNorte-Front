import { Search, X, Edit3 } from 'lucide-react';
import { type UseFormRegister, type FieldArrayWithId } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export default function SelectedProductsList({
  fields,
  selectedProducts,
  watchedItems,
  updateQuantity,
  removeProduct,
  register,
  isCreating
}: SelectedProductsListProps) {
  const [selectedItem, setSelectedItem] = useState<{
    index: number;
    product: Product;
    currentQuantity: number;
  } | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const openQuantityDialog = (index: number, product: Product, currentQuantity: number) => {
    setSelectedItem({ index, product, currentQuantity });
    setTempQuantity(currentQuantity.toString());
  };

  const closeDialog = () => {
    setSelectedItem(null);
    setTempQuantity('');
  };

  const handleQuantityChange = () => {
    if (!selectedItem) return;
    
    const newQuantity = parseInt(tempQuantity) || 1;
    const maxStock = selectedItem.product.stock || 999;
    
    // Validar stock antes de continuar
    if (newQuantity > maxStock) {
      // Mostrar advertencia pero no cerrar el modal
      return;
    }
    
    const finalQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    const delta = finalQuantity - selectedItem.currentQuantity;
    updateQuantity(selectedItem.index, delta);
    
    closeDialog();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentValue = parseInt(tempQuantity) || 0;
      const maxStock = selectedItem?.product.stock || 999;
      const hasError = currentValue > maxStock || currentValue < 1;
      
      if (!hasError) {
        handleQuantityChange();
      }
      // Si hay error, no hace nada (se mantiene el modal abierto)
    }
  };

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (selectedItem && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [selectedItem]);

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
                
                {/* Card clickeable */}
                <div 
                  className="px-4 py-4 hover:bg-slate-700/20 transition-colors cursor-pointer"
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

                {/* Indicador visual */}
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <div className="w-1 h-8 bg-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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

                  return (
                    <tr 
                      key={field.id}
                      className="hover:bg-slate-700/20 transition-colors cursor-pointer group"
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

      {/* Dialog para cambiar cantidad */}
      <Dialog open={!!selectedItem} onOpenChange={() => closeDialog()}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Cambiar cantidad
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (() => {
            const currentValue = parseInt(tempQuantity) || 0;
            const maxStock = selectedItem.product.stock || 999;
            const isOverStock = currentValue > maxStock;
            const isUnderMin = currentValue < 1;
            const hasError = isOverStock || isUnderMin;

            return (
              <div className="space-y-4">
                {/* Info del producto */}
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm truncate">
                    {selectedItem.product.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Stock disponible: {selectedItem.product.stock || 0}
                  </p>
                  <p className="text-xs text-slate-400">
                    Precio: ${selectedItem.product.price?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* Input cantidad */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 block">
                    Nueva cantidad:
                  </label>
                  <input
                    ref={inputRef}
                    type="number"
                    min="1"
                    max={selectedItem.product.stock || 999}
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`w-full px-3 py-2 text-white border rounded-lg focus:ring-2 text-center text-lg font-medium transition-colors ${
                      hasError 
                        ? 'bg-red-900/30 border-red-500 focus:ring-red-500' 
                        : 'bg-slate-700 border-slate-600 focus:ring-indigo-500'
                    }`}
                    placeholder="Cantidad"
                  />
                  
                  {/* Mensajes de error/advertencia */}
                  {isOverStock && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Stock insuficiente. Máximo: {maxStock}</span>
                    </div>
                  )}
                  
                  {isUnderMin && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-lg p-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>La cantidad mínima es 1</span>
                    </div>
                  )}
                </div>

                {/* Controles */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleQuantityChange}
                    disabled={hasError}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasError
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Confirmar
                  </button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  {hasError ? 'Corrige el error para continuar' : 'Presiona Enter para confirmar'}
                </p>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}