/**
 * Componente para ajustar el stock de un producto en el depósito
 * Trae automáticamente los datos del producto usando useGetProductById
 */import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { Plus, Minus, Target, ChevronLeft, Package } from 'lucide-react';
import type { UpdateStockDepositData } from '@/hooks/admin/MovementStock/movementStockType';
import { useMovementStockMutations } from '@/hooks/admin/MovementStock/useMovementStockMutations';
import { useGetProductById } from '@/hooks/admin/Product/useGetProductById';
import SuccessMessage from '@/components/generic/SuccessMessage';

interface AdjustDepositStockProps {
  productId: number;
  onBack: () => void;
  onSuccess?: () => void;
}

const AdjustDepositStock: React.FC<AdjustDepositStockProps> = ({
  productId,
  onBack,
  onSuccess
}) => {
  const { product, isLoading: isLoadingProduct, isError: isErrorProduct } = useGetProductById(productId);
  const productName = product?.name || 'Producto';
  const currentStock = product?.stock_deposit?.stock || 0;
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<UpdateStockDepositData>({
    defaultValues: {
      method: 'add',
      product_id: productId,
      stock: 0
    }
  });

  const { updateStockDeposit, isUpdatingStock, updateStockError, isStockUpdated, resetUpdateStockState } = useMovementStockMutations();
  const [showSuccess, setShowSuccess] = useState(false);

  const method = watch('method');
  const stockValue = watch('stock');

  const onSubmit = (data: UpdateStockDepositData) => {
    const stock = parseInt(String(data.stock).replace(/,/g, '')) || 0;
    
    updateStockDeposit({
      ...data,
      stock
    } as UpdateStockDepositData);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetUpdateStockState();
    reset();
    onSuccess?.();
  };

  React.useEffect(() => {
    if (isStockUpdated) {
      setShowSuccess(true);
    }
  }, [isStockUpdated]);

  if (isLoadingProduct) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 rounded-lg p-3">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ajustar Stock Depósito</h3>
              <p className="text-slate-400 text-sm">Actualizar inventario del depósito</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isErrorProduct) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 rounded-lg p-3">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ajustar Stock Depósito</h3>
              <p className="text-slate-400 text-sm">Actualizar inventario del depósito</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">Error al cargar el producto</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <SuccessMessage
        title="Stock Actualizado"
        description={`El stock del producto ${productName} se ha actualizado correctamente.`}
        primaryButton={{
          text: 'Aceptar',
          onClick: handleSuccessClose,
          variant: 'indigo'
        }}
      />
    );
  }

  const getMethodIcon = (m: string) => {
    switch (m) {
      case 'add':
        return <Plus className="w-5 h-5" />;
      case 'subtract':
        return <Minus className="w-5 h-5" />;
      case 'set':
        return <Target className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const calculateNewStock = () => {
    const value = typeof stockValue === 'string' ? parseInt(stockValue.replace(/,/g, '')) || 0 : stockValue || 0;
    switch (method) {
      case 'add':
        return currentStock + value;
      case 'subtract':
        return currentStock - value;
      case 'set':
        return value;
      default:
        return currentStock;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 rounded-lg p-3">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ajustar Stock Depósito</h3>
            <p className="text-slate-400 text-sm">Actualizar inventario del depósito</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Info del Stock Depósito - Destacada */}
        <div className="p-4 bg-emerald-600/20 border-2 border-emerald-500/50 rounded-lg">
          <p className="text-emerald-400 text-xs font-medium mb-1">Depósito</p>
          <p className="text-white text-lg font-bold">{productName}</p>
          <p className="text-emerald-300 text-2xl font-bold mt-2">{currentStock} unidades</p>
        </div>

        {/* Info de Puntos de Venta - Compacta */}
        {product?.stock_point_sales && product.stock_point_sales.length > 0 && (
          <div className="p-2 bg-slate-700/50 rounded-lg border border-slate-600 text-xs">
            <p className="text-slate-400 mb-1">Otros puntos</p>
            <div className="flex gap-2 flex-wrap">
              {product.stock_point_sales.map((point) => (
                <span key={point.id} className="text-blue-300">
                  {point.name}: {point.stock}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Selector de Método */}
        <div>
          <label className="text-slate-200 text-xs font-medium mb-2 block">
            Operación
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['add', 'subtract', 'set'].map((m) => (
              <label
                key={m}
                className="relative cursor-pointer"
              >
                <input
                  type="radio"
                  value={m}
                  {...register('method')}
                  className="hidden"
                />
                <div
                  className={`p-2 rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                    method === m
                      ? 'border-indigo-500 bg-indigo-600/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  {getMethodIcon(m)}
                  <span className="text-xs font-semibold text-white">
                    {m === 'add' ? 'Agregar' : m === 'subtract' ? 'Restar' : 'Fijar'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Campo de Cantidad */}
        <div>
          <label className="text-slate-200 text-sm font-medium mb-2 block">
            Cantidad
          </label>
          <Controller
            control={control}
            name="stock"
            rules={{
              required: 'La cantidad es requerida',
              min: { value: 0, message: 'La cantidad debe ser mayor a 0' }
            }}
            render={({ field }) => (
              <NumericFormat
                {...field}
                placeholder="0"
                allowNegative={false}
                thousandSeparator=","
                decimalSeparator="."
                valueIsNumericString
                className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-lg px-3 py-2 transition-all text-sm"
              />
            )}
          />
          {errors.stock && (
            <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>
          )}
          <p className="text-slate-400 text-xs mt-1">
            Total: {calculateNewStock().toLocaleString('es-ES')} unid.
          </p>
        </div>

        {/* Error */}
        {updateStockError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              {updateStockError instanceof Error ? updateStockError.message : 'Error al actualizar el stock'}
            </p>
          </div>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isUpdatingStock}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
        >
          {isUpdatingStock ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Actualizando...
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              Actualizar Stock
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdjustDepositStock;