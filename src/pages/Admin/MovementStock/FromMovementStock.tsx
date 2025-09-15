import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";
import { useGetProductById } from "@/hooks/admin/Product/useGetProductById";
import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import { Package } from "lucide-react";

interface FormMovementStockProps {
  productId: number;
}

interface MovementStockPayload {
  amount: number;
  from_id: number;
  from_type: "deposit" | "point_sale";
  ignore_stock: boolean;
  product_id: number;
  to_id: number;
  to_type: "deposit" | "point_sale";
}

const FormMovementStock: React.FC<FormMovementStockProps> = ({ productId }) => {
  const invalidateQueries = useInvalidateQueries();
  const { pointSales, isLoading: isLoadingPoints } = usePointSaleGetAll();

  const {
    product,
    isLoading: isLoadingProduct,
    isError,
  } = useGetProductById(productId);

  const moveStockMutation = useMutation({
    mutationFn: async (data: MovementStockPayload) => {
      const response = await apiClubNorte.post("/api/v1/movement_stock/move", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: async () => {
      await invalidateQueries(["getAllProducts", "ProductGetById","searchProductsByName","searchProductsByCode"]);
      alert("Movimiento realizado con éxito ✅");

      // Resetear todos los estados
      setSelectedPoints([]);
      setIgnoreStockDeposit(false);
      setFromPointId("");
      setToPointId("");
      setMoveAmount(0);
      setIgnoreStockPoints(false);
    },
    onError: () => {
      alert("Ocurrió un error. Contacte al administrador.");
    },
  });

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
    if (!product) return;

    const total = selectedPoints.reduce((sum, p) => sum + p.amount, 0);

    if (total === 0) {
      alert("Debes asignar al menos una cantidad mayor a 0.");
      return;
    }

    if (total > (product?.stock_deposit?.stock ?? 0) && !ignoreStockDeposit) {
      alert("No puedes mover más stock del disponible en depósito.");
      return;
    }

    selectedPoints.forEach((p) => {
      moveStockMutation.mutate({
        amount: p.amount,
        from_id: 1,
        from_type: "deposit",
        ignore_stock: ignoreStockDeposit,
        product_id: product.id,
        to_id: p.id,
        to_type: "point_sale",
      });
    });
  };

  const [fromPointId, setFromPointId] = useState<number | "">("");
  const [toPointId, setToPointId] = useState<number | "">("");
  const [moveAmount, setMoveAmount] = useState<number>(0);
  const [ignoreStockPoints, setIgnoreStockPoints] = useState(false);

  const handleMoveBetweenPoints = () => {
    if (!product) return;

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

    const payload: MovementStockPayload = {
      amount: moveAmount,
      from_id: fromPointId,
      from_type: "point_sale",
      ignore_stock: ignoreStockPoints,
      product_id: product.id,
      to_id: toPointId === 0 ? 1 : toPointId,
      to_type: toPointId === 0 ? "deposit" : "point_sale",
    };

    moveStockMutation.mutate(payload);
  };

  // Mostrar stock por punto
  const getStockForPointSale = (pointSaleId: number): number => {
    return product?.stock_point_sales?.find((ps) => ps.id === pointSaleId)?.stock ?? 0;
  };

  // Estados de carga o error
  if (isLoadingPoints || isLoadingProduct) {
    return <div className="text-slate-300 text-center">Cargando información...</div>;
  }

  if (isError || !product) {
    return (
      <div className="text-red-500 text-center">
        Ocurrió un error. Contacte al administrador.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Mover Stock</h2>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {/* Zona 1: Depósito → Puntos de Venta */}
        <AccordionItem
          value="deposit-to-points"
          className="border border-slate-700 rounded-lg overflow-hidden shadow-lg"
        >
          <AccordionTrigger className="px-4 py-2 text-white bg-slate-800 hover:bg-slate-700">
            Depósito → Puntos de Venta
          </AccordionTrigger>
          <AccordionContent className="bg-slate-700 px-4 py-4 space-y-4 border-t border-slate-600">
            <p className="text-slate-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              Stock disponible en depósito:{" "}
              <span className="font-bold text-emerald-400">
                {product?.stock_deposit?.stock ?? 0}
              </span>
            </p>

            <div className="space-y-2">
              {pointSales.map((point) => (
                <div
                  key={point.id}
                  className="flex items-center gap-4 border border-slate-600 rounded-lg p-2"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedPoints.find((p) => p.id === point.id)}
                    onChange={() => handleCheckboxChange(point.id)}
                  />
                  <span className="flex-1 text-slate-300 flex items-center gap-2">
                    {point.name}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      Stock: {getStockForPointSale(point.id)}
                    </span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="w-20 px-2 py-1 rounded bg-slate-800 text-white border border-slate-600"
                    disabled={!selectedPoints.find((p) => p.id === point.id)}
                    value={selectedPoints.find((p) => p.id === point.id)?.amount || ""}
                    onChange={(e) => handleAmountChange(point.id, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={ignoreStockDeposit}
                onChange={(e) => setIgnoreStockDeposit(e.target.checked)}
              />
              <label className="text-slate-300 text-sm">Ignorar validación de stock</label>
            </div>

            <button
              onClick={handleMoveFromDeposit}
              disabled={moveStockMutation.isPending}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg border border-slate-600 disabled:opacity-50"
            >
              {moveStockMutation.isPending ? "Procesando..." : "Mover desde Depósito"}
            </button>
          </AccordionContent>
        </AccordionItem>

        {/* Zona 2: Punto de Venta → Depósito / Otro Punto */}
        <AccordionItem
          value="point-to-point"
          className="border border-slate-700 rounded-lg overflow-hidden shadow-lg"
        >
          <AccordionTrigger className="px-4 py-2 text-white bg-slate-800 hover:bg-slate-700">
            Punto de Venta → Depósito / Otro Punto
          </AccordionTrigger>
          <AccordionContent className="bg-slate-700 px-4 py-4 space-y-4 border-t border-slate-600">
            <div className="space-y-4">
              {/* Origen */}
              <div>
                <label className="block text-slate-300 text-sm mb-1">Origen</label>
                <select
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-600"
                  value={fromPointId}
                  onChange={(e) => setFromPointId(Number(e.target.value))}
                >
                  <option value="">Seleccione punto de venta</option>
                  {product?.stock_point_sales?.map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.name} (Stock: {ps.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destino */}
              <div>
                <label className="block text-slate-300 text-sm mb-1">Destino</label>
                <select
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-600"
                  value={toPointId}
                  onChange={(e) => setToPointId(Number(e.target.value))}
                >
                  <option value="">Seleccione destino</option>
                  {/* ✅ Stock seguro del depósito */}
                  <option value={0}>
                    Depósito (Stock: {product?.stock_deposit?.stock ?? 0})
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
                <label className="block text-slate-300 text-sm mb-1">Cantidad</label>
                <input
                  type="number"
                  min={0}
                  value={moveAmount}
                  onChange={(e) => setMoveAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={ignoreStockPoints}
                onChange={(e) => setIgnoreStockPoints(e.target.checked)}
              />
              <label className="text-slate-300 text-sm">Ignorar validación de stock</label>
            </div>

            <button
              onClick={handleMoveBetweenPoints}
              disabled={moveStockMutation.isPending}
              className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg border border-slate-600 disabled:opacity-50"
            >
              {moveStockMutation.isPending
                ? "Procesando..."
                : "Mover entre Puntos de Venta / Depósito"}
            </button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FormMovementStock;
