// src/components/admin/Income/IncomeCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetIncomeById } from "@/hooks/pointSale/Income/useGetIncomeById";
import { Loader2, AlertCircle, CreditCard, Calendar, User } from "lucide-react";

interface IncomeCardProps {
  id: number;
}

export const IncomeCard = ({ id }: IncomeCardProps) => {
  const { income, isLoading, isError, error } = useGetIncomeById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-slate-300">
        <Loader2 className="animate-spin mr-2 text-indigo-500" />
        <span className="text-sm">Cargando ingreso...</span>
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

  if (!income) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-300 bg-slate-900/80 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
        <AlertCircle className="w-6 h-6 mb-2 text-slate-400" />
        <span className="text-sm">No se encontró el ingreso</span>
      </div>
    );
  }

  return (
    <Card className="relative bg-slate-900/80 border border-white/10 shadow-2xl rounded-2xl text-white backdrop-blur-xl overflow-hidden divide-y divide-white/10">
      {/* Header */}
      <CardHeader className="">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="font-semibold tracking-wide">
            Ingreso #{income.id}
          </span>
          <span className="text-emerald-500 font-bold text-2xl drop-shadow">
            ${income.total}
          </span>
        </CardTitle>
      </CardHeader>

      {/* Info principal */}
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {income.user.first_name} {income.user.last_name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="capitalize text-sm">{income.payment_method}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {new Date(income.created_at).toLocaleString("es-AR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </CardContent>

      {/* Items */}
      <CardContent className="py-4">
        <h4 className="text-slate-200 text-sm font-semibold mb-3">
          Items
        </h4>
        <ul className="space-y-2">
          {income.items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0"
            >
              <span className="text-slate-300 text-sm">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-semibold text-white text-sm">
                ${item.subtotal}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
