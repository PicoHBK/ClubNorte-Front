// src/components/admin/Expense/ExpenseCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetExpenseById } from "@/hooks/pointSale/Expense/useGetExpenseById";
import { Loader2, AlertCircle, CreditCard, Calendar, User, FileText, Hash } from "lucide-react";

interface ExpenseCardProps {
  id: number;
}

export const ExpenseCard = ({ id }: ExpenseCardProps) => {
  const { expense, isLoading, isError, error } = useGetExpenseById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-slate-300">
        <Loader2 className="animate-spin mr-2 text-indigo-500" />
        <span className="text-sm">Cargando egreso...</span>
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

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-300 bg-slate-900/80 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
        <AlertCircle className="w-6 h-6 mb-2 text-slate-400" />
        <span className="text-sm">No se encontró el egreso</span>
      </div>
    );
  }

  return (
    <Card className="relative bg-slate-900/80 border border-white/10 shadow-2xl rounded-2xl text-white backdrop-blur-xl overflow-hidden divide-y divide-white/10">
      {/* Header */}
      <CardHeader className="">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="font-semibold tracking-wide">
            Egreso #{expense.id}
          </span>
          <span className="text-emerald-500 font-bold text-2xl drop-shadow">
            ${expense.total}
          </span>
        </CardTitle>
      </CardHeader>

      {/* Info principal */}
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {expense.user.first_name} {expense.user.last_name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="capitalize text-sm">{expense.payment_method}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {new Date(expense.created_at).toLocaleString("es-AR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Hash className="w-4 h-4 text-slate-400" />
          <span className="text-sm">Registro: {expense.register_id}</span>
        </div>
      </CardContent>

      {/* Descripción */}
      {expense.description && (
        <CardContent className="py-4">
          <h4 className="text-slate-200 text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Descripción
          </h4>
          <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg border border-white/5">
            {expense.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
};