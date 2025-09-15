import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";

// Íconos
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useGetAllMovements, type Movement } from "@/hooks/admin/MovementStock/useGetAllMovements";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";

const TableMovements = () => {
  // Paginación
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  /**
   * Hooks para datos
   */
  const { movementsData, isLoading, isError, error } = useGetAllMovements(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  const { pointSales, isLoading: isLoadingPoints } = usePointSaleGetAll();

  const columnHelper = createColumnHelper<Movement>();

  /**
   * Función para obtener el nombre del punto de venta
   */
  const getPointSaleName = (id: number) => {
    const point = pointSales.find((ps) => ps.id === id);
    return point ? point.name : `ID: ${id}`;
  };

  /**
   * Columnas esenciales
   */
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
        id: "user_name",
        header: "Usuario",
        cell: (info) => (
          <span className="font-medium text-slate-300">{info.getValue()}</span>
        ),
      }
    ),
    columnHelper.accessor((row) => row.product.name, {
      id: "product_name",
      header: "Producto",
      cell: (info) => (
        <span className="font-semibold text-white">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("amount", {
      header: "Cantidad",
      cell: (info) => (
        <span className="text-emerald-500 font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor((row) => {
      return row.from_type === "deposit"
        ? "Depósito"
        : `Punto de Venta: ${getPointSaleName(row.from_id)}`;
    }, {
      id: "from_location",
      header: "Desde",
      cell: (info) => (
        <span className="text-slate-400">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor((row) => {
      return row.to_type === "deposit"
        ? "Depósito"
        : `Punto de Venta: ${getPointSaleName(row.to_id)}`;
    }, {
      id: "to_location",
      header: "Hacia",
      cell: (info) => (
        <span className="text-slate-400">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha",
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <span className="text-slate-300">
            {date.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            {date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    }),
  ];

  /**
   * Configuración de la tabla
   */
  const table = useReactTable({
    data: movementsData.movements,
    columns,
    pageCount: movementsData.total_pages,
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
        <h2 className="text-2xl font-bold text-white">Movimientos de Stock</h2>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading || isLoadingPoints ? (
            <div className="p-6 text-slate-400 text-center">
              Cargando movimientos...
            </div>
          ) : isError ? (
            <div className="p-6 text-red-400 text-center">
              Error: {error?.message || "No se pudo cargar la información."}
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
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-white/10">
                {movementsData.movements.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 align-top"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                      No se encontraron movimientos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-6">
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
                {pagination.pageIndex + 1} de {movementsData.total_pages}
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
              onClick={() => table.setPageIndex(movementsData.total_pages - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>

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
    </div>
  );
};

export default TableMovements;
