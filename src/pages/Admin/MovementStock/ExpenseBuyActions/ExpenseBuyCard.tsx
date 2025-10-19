// src/components/admin/ExpenseBuy/ExpenseBuyCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetExpenseBuyById } from "@/hooks/admin/MovementStock/useGetExpenseBuyById";
import { Loader2, AlertCircle, CreditCard, Calendar, User, FileText, ShoppingCart, Package } from "lucide-react";

interface ExpenseBuyCardProps {
  id: number;
}

export const ExpenseBuyCard = ({ id }: ExpenseBuyCardProps) => {
  const { expenseBuy, isLoading, isError, error } = useGetExpenseBuyById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-slate-300">
        <Loader2 className="animate-spin mr-2 text-indigo-500" />
        <span className="text-sm">Cargando compra...</span>
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="flex items-center gap-2 p-6 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 shadow-lg">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{error.message}</span>
      </div>
    );
  }

  if (!expenseBuy) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-300 bg-slate-900/80 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
        <AlertCircle className="w-6 h-6 mb-2 text-slate-400" />
        <span className="text-sm">No se encontró la compra</span>
      </div>
    );
  }

  return (
    <Card className="relative bg-slate-900/80 border border-white/10 shadow-2xl rounded-2xl text-white backdrop-blur-xl overflow-hidden divide-y divide-white/10">
      {/* Header */}
      <CardHeader className="">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="font-semibold tracking-wide flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            Compra #{expenseBuy.id}
          </span>
          <span className="text-emerald-500 font-bold text-2xl drop-shadow">
            ${expenseBuy.total.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>

      {/* Info principal */}
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {expenseBuy.user.first_name} {expenseBuy.user.last_name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="capitalize text-sm">{expenseBuy.payment_method}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {new Date(expenseBuy.created_at).toLocaleString("es-AR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </CardContent>

      {/* Descripción */}
      {expenseBuy.description && (
        <CardContent className="py-4">
          <h4 className="text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Descripción
          </h4>
          <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-white/5">
            {expenseBuy.description}
          </p>
        </CardContent>
      )}

      {/* Items de compra */}
      <CardContent className="py-4">
        <h4 className="text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400" />
          Productos ({expenseBuy.item_expense_buys.length})
        </h4>
        <div className="space-y-2">
          {expenseBuy.item_expense_buys.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">
                  {item.product.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Código: {item.product.code}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-300">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-emerald-400">
                  ${item.subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};