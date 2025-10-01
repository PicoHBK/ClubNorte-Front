// src/components/admin/Expense/DeleteExpenseComponent.tsx
import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useExpenseMutations } from '@/hooks/pointSale/Expense/useExpenseMutations';
import { useGetExpenseById } from '@/hooks/pointSale/Expense/useGetExpenseById';

interface DeleteExpenseComponentProps {
  expenseId: number;
  expenseName?: string;
  onDeleteSuccess?: () => void;
}

const DeleteExpenseComponent: React.FC<DeleteExpenseComponentProps> = ({
  expenseId,
  expenseName,
  onDeleteSuccess
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { deleteExpense, isDeleting, deleteError, isDeleted } = useExpenseMutations();
  const { expense, isLoading } = useGetExpenseById(expenseId);

  // Construir nombre descriptivo del egreso
  const getExpenseDisplayName = () => {
    if (expenseName) return expenseName;
    
    if (!expense) return "este egreso";
    
    const date = new Date(expense.created_at).toLocaleDateString('es-AR');
    const total = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(expense.total);
    
    return `Egreso del ${date} (${total})`;
  };

  React.useEffect(() => {
    if (isDeleted) {
      // Opcional: mostrar mensaje de éxito por unos segundos antes de ejecutar callback
      const timer = setTimeout(() => {
        onDeleteSuccess?.();
      }, 1500); // Da tiempo para mostrar el mensaje de éxito

      return () => clearTimeout(timer);
    }
  }, [isDeleted, onDeleteSuccess]);

  const handleDelete = () => {
    deleteExpense(expenseId.toString());
  };

  // Si ya se eliminó exitosamente, mostrar mensaje de confirmación
  if (isDeleted) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">
                Egreso eliminado exitosamente
              </h3>
              <p className="text-slate-200 text-sm">
                {getExpenseDisplayName()} ha sido eliminado correctamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showConfirmation) {
    return (
      <button
        onClick={() => setShowConfirmation(true)}
        className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        disabled={isDeleting || isLoading}
      >
        <Trash2 className="w-4 h-4" />
        Eliminar Egreso
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Section */}
      <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-1">
              ¿Confirmar eliminación?
            </h3>
            <p className="text-slate-200 text-sm mb-2">
              Estás a punto de eliminar{' '}
              <span className="font-medium text-white">
                {isLoading ? "cargando..." : getExpenseDisplayName()}
              </span>.
            </p>
            <p className="text-slate-300 text-xs">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </div>

      {/* Expense Details Preview */}
      {expense && !isLoading && (
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="text-slate-300 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Usuario:</span>
              <span className="text-white">{expense.user.first_name} {expense.user.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Método de pago:</span>
              <span className="text-white capitalize">{expense.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span>Registro ID:</span>
              <span className="text-white">{expense.register_id}</span>
            </div>
            {expense.description && (
              <div className="flex justify-between">
                <span>Descripción:</span>
                <span className="text-white truncate max-w-32" title={expense.description}>
                  {expense.description}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {deleteError && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">
            {deleteError.message || "Error al eliminar el egreso"}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowConfirmation(false)}
          disabled={isDeleting}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isLoading}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Eliminando...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Confirmar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DeleteExpenseComponent;