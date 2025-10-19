import React, { useState } from "react";
import { Package, Store, ArrowRight, ArrowLeftRight, ChevronLeft } from "lucide-react";
import type { MovementStockCreateData } from "@/hooks/admin/MovementStock/movementStockType";

// Tipos locales para este componente
interface StockPointSale {
  id: number;
  name: string;
  stock: number;
}

interface StockDeposit {
  stock: number;
}

interface Product {
  id: number;
  stock_deposit?: StockDeposit | null;
  stock_point_sales?: StockPointSale[] | null;
}

interface PointSale {
  id: number;
  name: string;
}

interface MovementStockOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface PointSaleToPointSaleProps {
  product: Product;
  pointSales: PointSale[];
  isCreating: boolean;
  createMovementStock: (data: MovementStockCreateData, options?: MovementStockOptions) => void;
  onBack: () => void;
  onSuccess: () => void;
}

const PointSaleToPointSale: React.FC<PointSaleToPointSaleProps> = ({
  product,
  pointSales,
  isCreating,
  createMovementStock,
  onBack,
  onSuccess
}) => {
  const [fromPointId, setFromPointId] = useState<number | "">("");
  const [toPointId, setToPointId] = useState<number | "">("");
  const [moveAmount, setMoveAmount] = useState<number>(0);
  const [ignoreStockPoints, setIgnoreStockPoints] = useState(false);

  const handleMoveBetweenPoints = () => {
    if (!fromPointId || toPointId === "") {
      alert("Debes seleccionar un punto de venta de origen y destino.");
      return;
    }

    if (fromPointId === toPointId) {
      alert("El origen y destino no pueden ser el mismo.");
      return;
    }

    const fromStock =
      product?.stock_point_sales?.find((p) => p.id === fromPointId)?.stock ?? 0;

    if (moveAmount <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    if (moveAmount > fromStock && !ignoreStockPoints) {
      alert("No puedes mover más stock del disponible en el punto de venta de origen.");
      return;
    }

    createMovementStock({
      amount: moveAmount,
      from_id: fromPointId,
      from_type: "point_sale",
      ignore_stock: ignoreStockPoints,
      product_id: product.id,
      to_id: toPointId === 0 ? 1 : toPointId,
      to_type: toPointId === 0 ? "deposit" : "point_sale",
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  const getStockForPointSale = (pointSaleId: number): number => {
    return product?.stock_point_sales?.find((ps) => ps.id === pointSaleId)?.stock ?? 0;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 rounded-lg p-3">
            <ArrowLeftRight className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Entre Puntos de Venta</h3>
            <p className="text-slate-400 text-sm">Transferir stock entre ubicaciones</p>
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

      <div className="space-y-4">
        {/* Origen */}
        <div>
          <label className="block text-slate-300 font-medium mb-2 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            Punto de Origen
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 disabled:opacity-50 font-medium"
            value={fromPointId}
            onChange={(e) => setFromPointId(Number(e.target.value))}
            disabled={isCreating}
          >
            <option value="">Seleccione punto de venta de origen</option>
            {product?.stock_point_sales?.map((ps) => (
              <option key={ps.id} value={ps.id}>
                {ps.name} (Stock: {ps.stock})
              </option>
            ))}
          </select>
        </div>

        {/* Destino */}
        <div>
          <label className="block text-slate-300 font-medium mb-2 flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-400" />
            Punto de Destino
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 disabled:opacity-50 font-medium"
            value={toPointId}
            onChange={(e) => setToPointId(Number(e.target.value))}
            disabled={isCreating}
          >
            <option value="">Seleccione punto de destino</option>
            <option value={0}>
              🏢 Depósito (Stock: {product?.stock_deposit?.stock ?? 0})
            </option>
            {pointSales.map((ps) => (
              <option
                key={ps.id}
                value={ps.id}
                disabled={ps.id === fromPointId}
              >
                {ps.name} (Stock: {getStockForPointSale(ps.id)})
              </option>
            ))}
          </select>
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-slate-300 font-medium mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400" />
            Cantidad a Transferir
          </label>
          <input
            type="number"
            min={0}
            value={moveAmount}
            onChange={(e) => setMoveAmount(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 disabled:opacity-50 font-medium text-lg"
            disabled={isCreating}
            placeholder="0"
          />
        </div>

        {/* Checkbox ignorar stock */}
        <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-4">
          <input
            type="checkbox"
            checked={ignoreStockPoints}
            onChange={(e) => setIgnoreStockPoints(e.target.checked)}
            disabled={isCreating}
            className="w-5 h-5 rounded"
          />
          <label className="text-slate-300 text-sm">
            Ignorar validación de stock (permitir stock negativo en origen)
          </label>
        </div>
      </div>

      <button
        onClick={handleMoveBetweenPoints}
        disabled={isCreating}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/30 transition-all"
      >
        <ArrowLeftRight className="w-6 h-6" />
        {isCreating ? "Procesando..." : "Realizar Transferencia"}
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PointSaleToPointSale;