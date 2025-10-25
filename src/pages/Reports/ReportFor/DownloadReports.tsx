import { useState } from "react";
import { Download, Calendar, FileText, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth } from "date-fns";
import { useDownloadExcelReport } from "@/hooks/admin/Reports/useDownloadWExcelReport";

const DownloadReports = () => {
  const navigate = useNavigate();
  
  // Establecer rango por defecto: del 1ro del mes actual hasta hoy
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  
  const [startDate, setStartDate] = useState(format(firstDayOfMonth, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  const { mutate: downloadExcel, isPending, isSuccess, isError } = useDownloadExcelReport();

  const handleDownload = () => {
    if (!startDate || !endDate) return;

    // Validar que la fecha de inicio sea menor o igual a la fecha de fin
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("La fecha de inicio debe ser anterior o igual a la fecha de fin");
      return;
    }

    downloadExcel({
      startDate,
      endDate,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Botón Volver */}
        <button
          onClick={() => navigate("/reports")}
          className="mb-4 flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-300 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al Dashboard</span>
        </button>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/20 via-emerald-500/20 to-indigo-600/20 p-6 border-b border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-600/20 rounded-xl">
                <FileText className="h-8 w-8 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Descargar Informes
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Genera reportes completos en el rango de fechas seleccionado
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Rango de fechas */}
            <div className="space-y-4">
              <label className="block">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-200">
                    Fecha de Inicio
                  </span>
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  disabled={isPending}
                />
              </label>

              <label className="block">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-200">
                    Fecha de Fin
                  </span>
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  disabled={isPending}
                />
              </label>
            </div>

            {/* Descripción */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-slate-200 text-sm leading-relaxed">
                Descarga el informe completo desde los rangos de fechas seleccionados.
                El reporte incluirá toda la información de ventas, ingresos y transacciones
                realizadas en el período especificado.
              </p>
            </div>

            {/* Mensajes de estado */}
            {isSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-green-200 text-sm">
                  ¡Descarga completada exitosamente!
                </p>
              </div>
            )}

            {isError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-200 text-sm">
                  Error al descargar el reporte. Por favor intenta nuevamente.
                </p>
              </div>
            )}

            {/* Botón de descarga */}
            <button
              onClick={handleDownload}
              disabled={!startDate || !endDate || isPending}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-lg shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3 group"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Generando reporte...</span>
                </>
              ) : (
                <>
                  <Download className="h-6 w-6 group-hover:animate-bounce" />
                  <span>Descargar Informe</span>
                </>
              )}
            </button>

            {/* Mensaje de validación */}
            {(!startDate || !endDate) && !isPending && (
              <p className="text-slate-400 text-sm text-center">
                Por favor selecciona ambas fechas para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadReports;