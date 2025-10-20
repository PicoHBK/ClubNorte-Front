import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

// Íconos
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  DollarSign,
  CreditCard,
  ArrowRightLeft,
  TrendingUp,
  Calendar,
} from "lucide-react";

import Modal from "@/components/generic/Modal";
import { useGetIncomesByDate } from "@/hooks/pointSale/Income/useGetIncomesByDate";
import type { Income } from "@/hooks/pointSale/Income/incomeTypes";
import IncomeActions from "./IncomeActions/IncomeActions";
import { PRESET_BUTTONS, type DateRange } from "@/utils/timeFilter/dateRangeUtils";
import DateRangePicker from "@/utils/timeFilter/DateRangePicker";

const TableIncomes = () => {
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
  const [dateRange, setDateRange] = useState<DateRange>(
    PRESET_BUTTONS.today.getRange()
  );

  /**
   * Params dinámicos con el rango de fechas
   */
  const params = {
    from_date: dateRange.from,
    to_date: dateRange.to,
  };

  /**
   * Llamada al hook para traer datos
   */
  const { incomesData, isLoading } = useGetIncomesByDate(
    params,
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  /**
   * Columnas de la tabla
   */
  const columnHelper = createColumnHelper<Income>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="text-slate-400 font-mono">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor(
      (row) => `${row.user.first_name} ${row.user.last_name}`,
      {
        id: "user",
        header: "Usuario",
        cell: (info) => (
          <span className="font-semibold text-white">{info.getValue()}</span>
        ),
      }
    ),
    columnHelper.accessor("payment_method", {
      header: "Método de Pago",
      cell: (info) => (
        <span className="text-slate-300 capitalize">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => (
        <span className="text-emerald-500 font-medium">
          ${info.getValue().toFixed(2)}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha de Creación",
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <span className="text-slate-400">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </span>
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
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
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

  // Calcular métricas para el resumen
  const totalGeneral = incomesData.incomes?.reduce((acc, income) => acc + (income.total || 0), 0) || 0;
  const totalEfectivo = incomesData.incomes?.filter(income => income.payment_method === 'efectivo').reduce((acc, income) => acc + (income.total || 0), 0) || 0;
  const totalTarjeta = incomesData.incomes?.filter(income => income.payment_method === 'tarjeta').reduce((acc, income) => acc + (income.total || 0), 0) || 0;
  const totalTransferencia = incomesData.incomes?.filter(income => income.payment_method === 'transferencia').reduce((acc, income) => acc + (income.total || 0), 0) || 0;
  const usuariosUnicos = incomesData.incomes ? new Set(incomesData.incomes.map(income => `${income.user.first_name}-${income.user.last_name}`)).size : 0;
  const promedioIngreso = incomesData.incomes && incomesData.incomes.length > 0 ? totalGeneral / incomesData.incomes.length : 0;

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">
              Listado de Ingresos
            </h2>
            <p className="text-slate-400">Gestiona y visualiza todos los ingresos del sistema</p>
          </div>
        </div>

        {/* Filtros con DateRangePicker */}
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
          presets={['today', 'last7days', 'last30days']}
          defaultPreset="today"
          showTitle={true}
          buttonStyle="default"
        />

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                Cargando ingresos...
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
                          <DollarSign className="w-12 h-12 text-slate-600" />
                          <div className="text-slate-400">
                            No se encontraron ingresos
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

        {/* Resumen de Métricas - Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">Ingresos Totales</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              ${totalGeneral.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-400">Ingresos Efectivo</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              ${totalEfectivo.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-slate-400">Ingresos Tarjeta</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              ${totalTarjeta.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-slate-400">Transferencias</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              ${totalTransferencia.toLocaleString('es-AR')}
            </div>
          </div>
        </div>

        {/* Resumen adicional - Segunda fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-slate-400">Promedio por Ingreso</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              ${promedioIngreso.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-slate-400">Usuarios Únicos</span>
            </div>
            <div className="text-2xl font-bold text-indigo-400">
              {usuariosUnicos}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-slate-400">Período Seleccionado</span>
            </div>
            <div className="text-sm font-bold text-pink-400">
              {dateRange.from === dateRange.to 
                ? new Date(dateRange.from).toLocaleDateString('es-AR')
                : `${new Date(dateRange.from).toLocaleDateString('es-AR')} - ${new Date(dateRange.to).toLocaleDateString('es-AR')}`
              }
            </div>
          </div>
        </div>

      </div>

      {/* Modal para ver detalles del ingreso */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIncomeId(null);
        }}
        title="Detalle del Ingreso"
        size="md"
      >
        {selectedIncomeId && <IncomeActions id={selectedIncomeId} />}
      </Modal>
    </div>
  );
};

export default TableIncomes;