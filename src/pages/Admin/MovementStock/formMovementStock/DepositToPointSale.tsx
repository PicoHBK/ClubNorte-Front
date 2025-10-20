import React, { useState } from "react";
import { Package, Warehouse, ArrowRight, ChevronLeft } from "lucide-react";
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

interface DepositToPointSaleProps {
  product: Product;
  pointSales: PointSale[];
  isCreating: boolean;
  createMovementStock: (data: MovementStockCreateData, options?: MovementStockOptions) => void;
  onBack: () => void;
  onSuccess: () => void;
}

const DepositToPointSale: React.FC<DepositToPointSaleProps> = ({
  product,
  pointSales,
  isCreating,
  createMovementStock,
  onBack,
  onSuccess
}) => {
  const [selectedPoints, setSelectedPoints] = useState<{ id: number; amount: number }[]>([]);
  const [ignoreStockDeposit, setIgnoreStockDeposit] = useState(false);

  const handleCheckboxChange = (pointId: number) => {
    setSelectedPoints((prev) => {
      const exists = prev.find((p) => p.id === pointId);
      if (exists) return prev.filter((p) => p.id !== pointId);
      return [...prev, { id: pointId, amount: 0 }];
    });
  };

  const handleAmountChange = (pointId: number, amount: number) => {
    setSelectedPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, amount: amount >= 0 ? amount : 0 } : p))
    );
  };

  const handleMoveFromDeposit = async () => {
    const total = selectedPoints.reduce((sum, p) => sum + p.amount, 0);

    if (total === 0) {
      alert("Debes asignar al menos una cantidad mayor a 0.");
      return;
    }

    if (!ignoreStockDeposit && total > (product?.stock_deposit?.stock ?? 0)) {
      alert("No puedes mover más stock del disponible en depósito.");
      return;
    }

    for (const point of selectedPoints) {
      if (point.amount > 0) {
        createMovementStock({
          amount: point.amount,
          from_id: 1,
          from_type: "deposit",
          ignore_stock: ignoreStockDeposit,
          product_id: product.id,
          to_id: point.id,
          to_type: "point_sale",
        }, {
          onSuccess: () => {
            onSuccess();
          }
        });
      }
    }
  };

  const getStockForPointSale = (pointSaleId: number): number => {
    return product?.stock_point_sales?.find((ps) => ps.id === pointSaleId)?.stock ?? 0;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 rounded-lg p-3">
            <Warehouse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Depósito → Puntos de Venta</h3>
            <p className="text-slate-400 text-sm">Distribuir stock desde el depósito</p>
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

      <div className="bg-slate-700/50 rounded-lg p-4">
        <p className="text-slate-300 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          Stock disponible en depósito:{" "}
          <span className="font-bold text-emerald-400 text-lg">
            {product?.stock_deposit?.stock ?? 0}
          </span>
        </p>
      </div>

      <div className="space-y-3">
        {pointSales.map((point) => (
          <div
            key={point.id}
            className="flex items-center gap-4 border border-slate-600 rounded-lg p-4 bg-slate-700/30 hover:bg-slate-700/50 transition"
          >
            <input
              type="checkbox"
              checked={!!selectedPoints.find((p) => p.id === point.id)}
              onChange={() => handleCheckboxChange(point.id)}
              disabled={isCreating}
              className="w-5 h-5 rounded"
            />
            <div className="flex-1">
              <span className="text-slate-200 font-medium">{point.name}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Package className="w-3 h-3" />
                Stock actual: {getStockForPointSale(point.id)}
              </span>
            </div>
            <input
              type="number"
              min={0}
              className="w-28 px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 disabled:opacity-50 font-medium"
              disabled={!selectedPoints.find((p) => p.id === point.id) || isCreating}
              value={selectedPoints.find((p) => p.id === point.id)?.amount || ""}
              onChange={(e) => handleAmountChange(point.id, Number(e.target.value))}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-4">
        <input
          type="checkbox"
          checked={ignoreStockDeposit}
          onChange={(e) => setIgnoreStockDeposit(e.target.checked)}
          disabled={isCreating}
          className="w-5 h-5 rounded"
        />
        <label className="text-slate-300 text-sm">
          Ignorar validación de stock (permitir stock negativo en depósito)
        </label>
      </div>

      <button
        onClick={handleMoveFromDeposit}
        disabled={isCreating}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-500/30 transition-all"
      >
        <Warehouse className="w-6 h-6" />
        {isCreating ? "Procesando..." : "Mover desde Depósito"}
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default DepositToPointSale;