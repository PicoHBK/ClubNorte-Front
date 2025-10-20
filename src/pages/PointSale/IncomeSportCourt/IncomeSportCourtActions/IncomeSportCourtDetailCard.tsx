import React from "react"
import { Loader2, User, DollarSign, Calendar, FileText, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NumericFormat } from "react-number-format"
import { useGetIncomeSportCourtById } from "@/hooks/pointSale/IncomeSportCourt/useGetIncomeSportCourtById"

type IncomeSportCourtDetailCardProps = {
  id: number
}

const IncomeSportCourtDetailCard: React.FC<IncomeSportCourtDetailCardProps> = ({ id }) => {
  const { incomeSportCourt, isLoading, isError, error } = useGetIncomeSportCourtById(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (isError || !incomeSportCourt) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400 text-sm text-center">
          {error?.message || "Error al cargar los detalles"}
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const isRestPending = !incomeSportCourt.date_rest_pay || incomeSportCourt.date_rest_pay === null
  const remainingAmount = incomeSportCourt.price - incomeSportCourt.partial_pay

  return (
    <div className="space-y-4">
      {/* Usuario */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-indigo-600" />
          <h3 className="text-white font-semibold text-sm">Usuario</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-400">Nombre: </span>
            <span className="text-white">
              {incomeSportCourt.user?.first_name} {incomeSportCourt.user?.last_name}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Email: </span>
            <span className="text-white">{incomeSportCourt.user?.email}</span>
          </div>
          <div>
            <span className="text-slate-400">Teléfono: </span>
            <span className="text-white">{incomeSportCourt.user?.cellphone}</span>
          </div>
        </div>
      </div>

      {/* Pagos */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <h3 className="text-white font-semibold text-sm">Pagos</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total:</span>
            <span className="text-white font-bold">
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

          <div className="border-t border-slate-700 pt-2 space-y-2">
            {/* Pago Parcial */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-slate-400">Pago Parcial</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(incomeSportCourt.date_partial_pay)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  <NumericFormat
                    value={incomeSportCourt.partial_pay}
                    displayType="text"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$"
                    decimalScale={0}
                  />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  {incomeSportCourt.partial_payment_method}
                </Badge>
              </div>
            </div>

            {/* Pago Restante */}
            {isRestPending ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-amber-400 font-semibold">Pago Pendiente</div>
                    <div className="text-amber-300 text-xs">
                      Resta abonar: <NumericFormat
                        value={remainingAmount}
                        displayType="text"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        decimalScale={0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-slate-400">Restante</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {incomeSportCourt.date_rest_pay && formatDate(incomeSportCourt.date_rest_pay)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    <NumericFormat
                      value={incomeSportCourt.rest_pay}
                      displayType="text"
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="$"
                      decimalScale={0}
                    />
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    {incomeSportCourt.rest_payment_method}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      {incomeSportCourt.description && (
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-white font-semibold text-sm">Descripción</h3>
          </div>
          <p className="text-slate-300 text-sm">{incomeSportCourt.description}</p>
        </div>
      )}
    </div>
  )
}

export default IncomeSportCourtDetailCard