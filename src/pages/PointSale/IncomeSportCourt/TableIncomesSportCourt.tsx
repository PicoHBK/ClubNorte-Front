import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { format, isToday, isYesterday } from "date-fns";

// Íconos de Lucide React
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  CheckCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

import Modal from "@/components/generic/Modal";
import { useGetIncomesSportCourtByDate } from "@/hooks/pointSale/IncomeSportCourt/useGetIncomesSportCourtByDate";
import type { IncomeSportCourt } from "@/hooks/pointSale/IncomeSportCourt/IncomeSportCourtTypes";

const TableIncomesSportCourt = () => {
  /**
   * Paginación
   */
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  /**
   * Ordenamiento
   */
  const [sorting, setSorting] = useState<SortingState>([]);

  /**
   * Estado para modal
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<number | null>(null);

  /**
   * Estado para filtros de fecha
   */
  const today = format(new Date(), 'yyyy-MM-dd');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  /**
   * Params dinámicos con el rango de fechas
   */
  const params = {
    from_date: fromDate,
    to_date: toDate,
  };

  /**
   * Llamada al hook para traer datos
   */
  const { incomesData, isLoading } = useGetIncomesSportCourtByDate(
    params,
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  /**
   * Función para formatear fechas amigables (corregida)
   */
  const formatFriendlyDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    if (isToday(date)) {
      return `Hoy ${format(date, 'HH:mm')}`;
    }
    
    if (isYesterday(date)) {
      return `Ayer ${format(date, 'HH:mm')}`;
    }
    
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  /**
   * Función para obtener el ícono del método de pago (mejorada con Lucide React)
   */
  const getPaymentIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'tarjeta':
      case 'card':
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      case 'transferencia':
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4 text-purple-400" />;
      case 'efectivo':
      case 'cash':
        return <Banknote className="w-4 h-4 text-green-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  /**
   * Columnas de la tabla
   */
  const columnHelper = createColumnHelper<IncomeSportCourt>();

  const columns = [
    columnHelper.accessor("id", {
      header: () => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          ID
        </div>
      ),
      cell: (info) => (
        <span className="text-slate-400 font-mono text-sm bg-slate-800/50 px-2 py-1 rounded">
          #{info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("price", {
      header: () => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Precio Total
        </div>
      ),
      cell: (info) => (
        <span className="text-emerald-400 font-semibold text-lg flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {info.getValue()?.toLocaleString('es-AR') || '0'}
        </span>
      ),
    }),
    columnHelper.accessor("partial_pay", {
      header: () => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Pago Parcial
        </div>
      ),
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            {getPaymentIcon(row.partial_payment_method)}
            <div>
              <div className="text-blue-400 font-medium">
                ${info.getValue()?.toLocaleString('es-AR') || '0'}
              </div>
              <div className="text-xs text-slate-500 capitalize bg-slate-800/30 px-2 py-0.5 rounded">
                {row.partial_payment_method || 'No especificado'}
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("rest_pay", {
      header: () => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Pago Restante
        </div>
      ),
      cell: (info) => {
        const row = info.row.original;
        const restPay = info.getValue();
        
        if (restPay === null || restPay === 0) {
          return (
            <div className="flex items-center gap-1 text-yellow-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Pendiente
            </div>
          );
        }
        
        return (
          <div className="flex items-center gap-2">
            {getPaymentIcon(row.rest_payment_method)}
            <div>
              <div className="text-orange-400 font-medium">
                ${restPay?.toLocaleString('es-AR') || '0'}
              </div>
              <div className="text-xs text-slate-500 capitalize bg-slate-800/30 px-2 py-0.5 rounded">
                {row.rest_payment_method || 'Pendiente'}
              </div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("date_partial_pay", {
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Fecha Pago
        </div>
      ),
      cell: (info) => {
        const dateValue = info.getValue();
        return (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-300 text-sm">
              {dateValue ? formatFriendlyDate(dateValue) : 'Sin fecha'}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => (
        <button
          onClick={() => {
            setSelectedIncomeId(info.row.original.id);
            setIsModalOpen(true);
          }}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 hover:scale-105 flex items-center gap-1"
          title="Ver detalles"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    }),
  ];

  /**
   * Configuración de la tabla
   */
  const table = useReactTable({
    data: incomesData.incomes || [],
    columns,
    pageCount: incomesData.total_pages || 0,
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Calcular totales
  const totalPartialPay = incomesData.incomes?.reduce((acc, income) => acc + (income.partial_pay || 0), 0) || 0;
  const totalRestPay = incomesData.incomes?.reduce((acc, income) => acc + (income.rest_pay || 0), 0) || 0;
  const totalGeneral = incomesData.incomes?.reduce((acc, income) => acc + (income.price || 0), 0) || 0;

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">
              Ingresos de Canchas Deportivas
            </h2>
            <p className="text-slate-400">Gestiona y visualiza los ingresos de las canchas</p>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Filtro por Fechas</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Desde:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-800/50 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Hasta:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-800/50 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFromDate(today);
                  setToDate(today);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Hoy
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                Cargando ingresos de canchas...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-white/10">
                  {incomesData.incomes && incomesData.incomes.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-white/5 transition-all duration-200 hover:shadow-lg"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-slate-600" />
                          <div className="text-slate-400">
                            No se encontraron ingresos de canchas
                          </div>
                          <div className="text-xs text-slate-500">
                            Intenta ajustar los filtros de fecha
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación mejorada */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Primera página"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-slate-400 text-sm px-3 py-1 bg-slate-800/50 rounded">
              Página{" "}
              <strong className="text-white">
                {pagination.pageIndex + 1}
              </strong>
              {" "}de{" "}
              <strong className="text-white">
                {incomesData.total_pages || 1}
              </strong>
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Página siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.setPageIndex((incomesData.total_pages || 1) - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Última página"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>

          <select
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-slate-800/50 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Mostrar {size}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
    <div className="flex items-center gap-2 mb-2">
      <Users className="w-5 h-5 text-emerald-400" />
      <span className="text-sm text-slate-400">Total Ingresos</span>
    </div>
    <div className="text-2xl font-bold text-emerald-400">
      {incomesData.total || 0}
    </div>
  </div>

  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="w-5 h-5 text-blue-400" />
      <span className="text-sm text-slate-400">Pagos Parciales</span>
    </div>
    <div className="text-2xl font-bold text-blue-400">
      ${totalPartialPay.toLocaleString('es-AR')}
    </div>
  </div>

  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="w-5 h-5 text-orange-400" />
      <span className="text-sm text-slate-400">Pagos Restantes</span>
    </div>
    <div className="text-2xl font-bold text-orange-400">
      ${totalRestPay.toLocaleString('es-AR')}
    </div>
  </div>

  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp className="w-5 h-5 text-purple-400" />
      <span className="text-sm text-slate-400">Total General</span>
    </div>
    <div className="text-2xl font-bold text-purple-400">
      ${totalGeneral.toLocaleString('es-AR')}
    </div>
  </div>
</div>

      </div>

      {/* Modal mejorado */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIncomeId(null);
        }}
        title="Detalle del Ingreso de Cancha"
        size="md"
      >
        {selectedIncomeId && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-indigo-400" />
              <h4 className="text-lg font-semibold text-white">
                Ingreso ID: #{selectedIncomeId}
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300">
                  Aquí puedes mostrar información detallada del ingreso seleccionado.
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Puedes agregar más componentes o datos específicos según tus necesidades.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TableIncomesSportCourt;