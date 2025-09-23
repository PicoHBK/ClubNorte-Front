import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useIncomeMutations } from '@/hooks/pointSale/Income/useIncomeMutations';
import { useGetIncomeById } from '@/hooks/pointSale/Income/useGetIncomeById';

interface DeleteIncomeComponentProps {
  incomeId: number;
  incomeName?: string;
  onDeleteSuccess?: () => void;
}

const DeleteIncomeComponent: React.FC<DeleteIncomeComponentProps> = ({
  incomeId,
  incomeName,
  onDeleteSuccess
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { deleteIncome, isDeleting, deleteError, isDeleted } = useIncomeMutations();
  const { income, isLoading } = useGetIncomeById(incomeId);

  // Construir nombre descriptivo del ingreso
  const getIncomeDisplayName = () => {
    if (incomeName) return incomeName;
    
    if (!income) return "este ingreso";
    
    const date = new Date(income.created_at).toLocaleDateString('es-AR');
    const total = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(income.total);
    
    return `Ingreso del ${date} (${total})`;
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
    deleteIncome(incomeId.toString());
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
                Ingreso eliminado exitosamente
              </h3>
              <p className="text-slate-200 text-sm">
                {getIncomeDisplayName()} ha sido eliminado correctamente.
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
        Eliminar Ingreso
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
                {isLoading ? "cargando..." : getIncomeDisplayName()}
              </span>.
            </p>
            <p className="text-slate-300 text-xs">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </div>

      {/* Income Details Preview */}
      {income && !isLoading && (
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="text-slate-300 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Usuario:</span>
              <span className="text-white">{income.user.first_name} {income.user.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Método de pago:</span>
              <span className="text-white capitalize">{income.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span>Productos:</span>
              <span className="text-white">{income.items.length} item(s)</span>
            </div>
            {income.description && (
              <div className="flex justify-between">
                <span>Descripción:</span>
                <span className="text-white truncate max-w-32" title={income.description}>
                  {income.description}
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
            {deleteError.message || "Error al eliminar el ingreso"}
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

export default DeleteIncomeComponent;