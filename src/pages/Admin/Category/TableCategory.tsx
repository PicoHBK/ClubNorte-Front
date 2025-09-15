import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type FilterFn,
  type SortingFn,
  type SortingState,
} from "@tanstack/react-table";

// Íconos Lucide
import {
  Eye,
  Search,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import {
  useGetAllCategories,
  type Category,
} from "@/hooks/admin/Category/useGetAllCategories";
import Modal from "@/components/generic/Modal";
import EditDeleteCategory from "./EditDeleteCategory";

const TableCategories = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Para el Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // Llamada a la API
  const { categories, isLoading } = useGetAllCategories();

  const columnHelper = createColumnHelper<Category>();

  // � Filtro personalizado para búsqueda por nombre
  const customGlobalFilter: FilterFn<Category> = (
    row,
    filterValue
  ) => {
    const search = filterValue.toLowerCase();
    const categoryName = row.original.name.toLowerCase();
    return categoryName.includes(search);
  };

  // � Sorting personalizado (por nombre, alfabéticamente)
  const sortByName: SortingFn<Category> = (rowA, rowB) => {
    return rowA.original.name.localeCompare(rowB.original.name);
  };

  // � Definición de columnas
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="text-slate-400 font-mono">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("name", {
      header: () => (
        <button className="flex items-center gap-1 text-slate-300 hover:text-white transition">
          Nombre
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      sortingFn: sortByName,
      cell: (info) => (
        <span className="font-semibold text-white">{info.getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => (
        <button
          onClick={() => {
            setSelectedCategoryId(info.row.original.id);
            setIsEditModalOpen(true);
          }}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    }),
  ];

  // ⚙️ Configuración de la tabla
  const table = useReactTable({
    data: categories,
    columns,
    pageCount: Math.ceil(categories.length / pagination.pageSize),
    state: {
      pagination,
      globalFilter,
      sorting,
    },
    manualPagination: false, // Paginación CLIENTE
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: customGlobalFilter,
  });

  // Loader
  if (isLoading) {
    return (
      <div className="p-6 text-slate-400 text-center">
        Cargando categorías...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-4xl space-y-4">
        {/* � Buscador por nombre */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar categoría por nombre..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                      onClick={header.column.getToggleSortingHandler?.()}
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
              {table.getFilteredRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 align-top"
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
                    No se encontraron categorías
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación (CLIENTE) */}
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
                {pagination.pageIndex + 1} de {table.getPageCount()}
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
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de tamaño de página */}
          <select
            value={pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategoryId(null);
        }}
        title="Editar Categoría"
        size="md"
      >
        {selectedCategoryId && (
          <EditDeleteCategory
            id={selectedCategoryId}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default TableCategories;
