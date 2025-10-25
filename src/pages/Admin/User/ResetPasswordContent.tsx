import React, { useEffect, useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { useUserMutations } from '@/hooks/admin/users/useUserMutations';

interface ResetPasswordContentProps {
  userId: number;
}

const ResetPasswordContent: React.FC<ResetPasswordContentProps> = ({ userId }) => {
  const {
    updatePassword,
    isUpdatingPassword,
    isPasswordUpdated,
    newPassword,
    updatePasswordError,
    resetPasswordState,
  } = useUserMutations();

  const [copied, setCopied] = useState(false);

  // Ejecutar la mutación al montar el componente
  useEffect(() => {
    updatePassword(userId);
    
    // Cleanup al desmontar
    return () => {
      resetPasswordState();
    };
  }, [userId]);

  const handleCopy = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Estado de carga */}
      {isUpdatingPassword && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-slate-300">Generando nueva contraseña...</p>
        </div>
      )}

      {/* Error */}
      {updatePasswordError && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200 text-sm">
            Error al generar contraseña. Intenta nuevamente.
          </p>
        </div>
      )}

      {/* Éxito */}
      {isPasswordUpdated && newPassword && (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-200 text-sm mb-2 font-medium">
              ✓ Contraseña generada exitosamente
            </p>
            <p className="text-slate-300 text-xs">
              Comparte esta contraseña con el usuario de forma segura.
            </p>
          </div>

          {/* Contraseña con botón de copiar */}
          <div className="relative">
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
              <code className="flex-1 text-lg font-mono text-white tracking-wider">
                {newPassword}
              </code>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Asegúrate de guardar esta contraseña, no podrás verla nuevamente.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordContent;