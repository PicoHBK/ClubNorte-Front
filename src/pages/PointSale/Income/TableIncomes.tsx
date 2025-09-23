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
} from "lucide-react";

import Modal from "@/components/generic/Modal";
import { useGetIncomesByDate } from "@/hooks/pointSale/Income/useGetIncomesByDate";
import type { Income } from "@/hooks/pointSale/Income/incomeTypes";
import IncomeActions from "./IncomeActions/IncomeActions";

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
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

const today = formatDate(new Date());

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
    data: incomesData.incomes,
    columns,
    pageCount: incomesData.total_pages,
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

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-6xl space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">
          Listado de Ingresos
        </h2>

        {/* Filtro por fechas */}
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="text-slate-400 text-sm">Desde:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="ml-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 text-sm">Hasta:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="ml-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-6 text-slate-400 text-center">
              Cargando ingresos...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
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
                      className="hover:bg-white/5 transition-colors"
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
                      className="px-6 py-4 text-center text-sm text-slate-400"
                    >
                      No se encontraron ingresos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-6">
          {/* botones izquierda */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-slate-400 text-sm">
              Página{" "}
              <strong className="text-white">
                {pagination.pageIndex + 1} de {incomesData.total_pages}
              </strong>
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.setPageIndex(incomesData.total_pages - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>

          {/* page size */}
          <select
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="ml-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Mostrar {size}
              </option>
            ))}
          </select>
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
