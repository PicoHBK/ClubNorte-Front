import React, { useState } from "react";
import { Loader2, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NumericFormat } from "react-number-format";
import { useGetIncomeSportCourtById } from "@/hooks/pointSale/IncomeSportCourt/useGetIncomeSportCourtById";
import { useIncomeSportCourtMutations } from "@/hooks/pointSale/IncomeSportCourt/useIncomeSportCourtMutations";
import SuccessMessage from "@/components/generic/SuccessMessage";

type IncomeSportCourtConfirmPaymentProps = {
  id: number;
  onClose?: () => void; // Función para cerrar el modal/componente
};

const IncomeSportCourtConfirmPayment: React.FC<
  IncomeSportCourtConfirmPaymentProps
> = ({ id, onClose }) => {
  const { incomeSportCourt, isLoading, isError, error } =
    useGetIncomeSportCourtById(id);
  const { 
    updateIncomeSportCourtPayment, 
    isUpdatingPayment, 
    isPaymentUpdated,
    updatePaymentMutation // Acceso a la mutación completa
  } = useIncomeSportCourtMutations();

  const [paymentMethod, setPaymentMethod] = useState<string>("efectivo");

  // Debug: ver el estado
  console.log("isPaymentUpdated:", isPaymentUpdated);
  console.log("updatePaymentMutation.isSuccess:", updatePaymentMutation?.isSuccess);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (isError || !incomeSportCourt) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400 text-sm text-center">
          {error?.message || "Error al cargar los detalles"}
        </p>
      </div>
    );
  }

  const remainingAmount = incomeSportCourt.price - incomeSportCourt.partial_pay;
  const isRestPending =
    !incomeSportCourt.date_rest_pay || incomeSportCourt.date_rest_pay === null;

  // Si ya está pagado
  if (!isRestPending) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
          <div>
            <h3 className="text-emerald-400 font-semibold text-lg">
              Pago Completado
            </h3>
            <p className="text-emerald-300 text-sm">
              El pago restante ya fue abonado
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si el pago fue actualizado exitosamente - USAR SuccessMessage
  if (isPaymentUpdated) {
    return (
      <SuccessMessage
        title="¡Pago Confirmado!"
        description="El pago restante fue registrado correctamente"
        primaryButton={{
          text: "Cerrar",
          onClick: () => onClose?.(),
          variant: "indigo"
        }}
      />
    );
  }

  const handleConfirmPayment = () => {
    // Validar que paymentMethod sea un valor válido
    if (
      paymentMethod !== "efectivo" &&
      paymentMethod !== "tarjeta" &&
      paymentMethod !== "transferencia"
    ) {
      console.error("Método de pago inválido");
      return;
    }

    updateIncomeSportCourtPayment({
      id: incomeSportCourt.id,
      rest_pay: remainingAmount,
      rest_payment_method: paymentMethod,
    });
  };

  return (
    <div className="space-y-6">
      {/* Información del monto a pagar */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h3 className="text-white font-semibold">Confirmar Pago Restante</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Precio Total:</span>
            <span className="text-white">
              <NumericFormat
                value={incomeSportCourt.price}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={0}
              />
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pago Parcial:</span>
            <span className="text-white">
              <NumericFormat
                value={incomeSportCourt.partial_pay}
                displayType="text"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                decimalScale={0}
              />
            </span>
          </div>

          <div className="border-t border-slate-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-semibold">
                Monto a Pagar:
              </span>
              <span className="text-emerald-400 text-2xl font-bold">
                <NumericFormat
                  value={remainingAmount}
                  displayType="text"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="$"
                  decimalScale={0}
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selección de método de pago */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <Label className="text-slate-200 mb-3 block">Método de Pago</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem
              value="efectivo"
              id="efectivo"
              className="border-slate-400"
            />
            <Label htmlFor="efectivo" className="text-slate-300 cursor-pointer">
              💵 Efectivo
            </Label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem
              value="tarjeta"
              id="tarjeta"
              className="border-slate-400"
            />
            <Label htmlFor="tarjeta" className="text-slate-300 cursor-pointer">
              💳 Tarjeta
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="transferencia"
              id="transferencia"
              className="border-slate-400"
            />
            <Label
              htmlFor="transferencia"
              className="text-slate-300 cursor-pointer"
            >
              🏦 Transferencia
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Advertencia */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-amber-400 text-sm font-medium">Importante</p>
            <p className="text-amber-300 text-xs mt-1">
              Al confirmar, se registrará el pago restante con el método
              seleccionado. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </div>

      {/* Botón de confirmación */}
      <Button
        onClick={handleConfirmPayment}
        disabled={isUpdatingPayment}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
      >
        {isUpdatingPayment ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Confirmando...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmar Pago de{" "}
            <NumericFormat
              value={remainingAmount}
              displayType="text"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              decimalScale={0}
            />
          </>
        )}
      </Button>
    </div>
  );
};

export default IncomeSportCourtConfirmPayment;