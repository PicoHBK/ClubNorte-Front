import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useIncomeSportCourtMutations } from '@/hooks/pointSale/IncomeSportCourt/useIncomeSportCourtMutations';
import { useGetIncomeSportCourtById } from '@/hooks/pointSale/IncomeSportCourt/useGetIncomeSportCourtById';

interface DeleteIncomeSportCourtProps {
  incomeSportCourtId: number;
  incomeSportCourtName?: string;
  onDeleteSuccess?: () => void;
}

const DeleteIncomeSportCourt: React.FC<DeleteIncomeSportCourtProps> = ({
  incomeSportCourtId,
  incomeSportCourtName,
  onDeleteSuccess
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { deleteIncomeSportCourt, isDeleting, deleteError, isDeleted } = useIncomeSportCourtMutations();
  const { incomeSportCourt, isLoading } = useGetIncomeSportCourtById(incomeSportCourtId);

  // Construir nombre descriptivo del ingreso
  const getIncomeSportCourtDisplayName = () => {
    if (incomeSportCourtName) return incomeSportCourtName;
    
    if (!incomeSportCourt) return "este ingreso";
    
    return `Ingreso #${incomeSportCourt.id}`;
  };

  React.useEffect(() => {
    if (isDeleted) {
      const timer = setTimeout(() => {
        onDeleteSuccess?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isDeleted, onDeleteSuccess]);

  const handleDelete = () => {
    deleteIncomeSportCourt(incomeSportCourtId);
  };

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
                {getIncomeSportCourtDisplayName()} ha sido eliminado correctamente.
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
                {isLoading ? "cargando..." : getIncomeSportCourtDisplayName()}
              </span>.
            </p>
            <p className="text-slate-300 text-xs">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </div>

      {/* IncomeSportCourt Details Preview */}
      {incomeSportCourt && !isLoading && (
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="text-slate-300 text-sm space-y-1">
            <div className="flex justify-between">
              <span>ID:</span>
              <span className="text-white">{incomeSportCourt.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Monto Total:</span>
              <span className="text-white">${incomeSportCourt.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span className="text-white">{new Date(incomeSportCourt.created_at).toLocaleDateString()}</span>
            </div>
            {incomeSportCourt.description && (
              <div className="flex justify-between">
                <span>Descripción:</span>
                <span className="text-white truncate max-w-32" title={incomeSportCourt.description}>
                  {incomeSportCourt.description}
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

export default DeleteIncomeSportCourt;