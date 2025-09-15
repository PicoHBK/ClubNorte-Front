import { useState, useEffect } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  Barcode,
  Store,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useSearchProductsByCode } from "@/hooks/admin/Product/useSearchProductsByCode";
import { useGetProductsByCategory } from "@/hooks/admin/Product/useGetProductsByCategory";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import type { Product } from "@/hooks/admin/Product/useGetAllProducts";

import FormMovementStock from "./FormMovementStock";

const TableReponerStock = () => {
  // Estados para búsqueda
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  const [searchCode, setSearchCode] = useState("");
  const [debouncedSearchCode, setDebouncedSearchCode] = useState("");

  // Estado para categoría
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Estado para modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Paginación
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // Debounce búsqueda por nombre
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchName(searchName);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchName]);

  // Debounce búsqueda por código
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchCode(searchCode);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchCode]);

  /**
   * Hooks para datos
   */
  const { categories, isLoading: isLoadingCategories } = useGetAllCategories();

  const { productsData, isLoading: isLoadingAll } = useGetAllProducts(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  const { products: searchedByName, isLoading: isLoadingName } =
    useSearchProductsByName(debouncedSearchName);

  const { products: searchedByCode, isLoading: isLoadingCode } =
    useSearchProductsByCode(debouncedSearchCode);

  const { products: productsByCategory, isLoading: isLoadingCategory } =
    useGetProductsByCategory(selectedCategoryId);

  /**
   * Determinar estado de búsqueda y datos a mostrar
   */
  const isSearchingByName = debouncedSearchName.trim().length > 0;
  const isSearchingByCode = debouncedSearchCode.trim().length > 0;
  const isFilteringByCategory = !!selectedCategoryId;
  const isSearching = isSearchingByName || isSearchingByCode || isFilteringByCategory;

  const tableData = isFilteringByCategory
    ? productsByCategory
    : isSearchingByName
    ? searchedByName
    : isSearchingByCode
    ? searchedByCode
    : productsData?.products || [];

  const isLoading = isFilteringByCategory
    ? isLoadingCategory
    : isSearchingByName
    ? isLoadingName
    : isSearchingByCode
    ? isLoadingCode
    : isLoadingAll;

  /**
   * Modal
   */
  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  /**
   * Columnas de la tabla
   */
  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor("code", {
      header: "Código",
      cell: (info) => <span className="text-slate-300">{info.getValue()}</span>,
    }),
    columnHelper.accessor("name", {
      header: "Nombre",
      cell: (info) => (
        <span className="font-semibold text-white">{info.getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "stock_deposit",
      header: "Stock Depósito",
      cell: (info) => (
        <span className="text-emerald-500 font-semibold">
          {info.row.original.stock_deposit?.stock ?? 0}
        </span>
      ),
    }),
    columnHelper.display({
      id: "stock_point_sales",
      header: "Stock Puntos de Venta",
      cell: (info) => {
        const { stock_point_sales } = info.row.original;

        if (!stock_point_sales || stock_point_sales.length === 0) {
          return (
            <span className="text-slate-500 italic text-sm">
              Sin stock asignado
            </span>
          );
        }

        return (
          <div className="space-y-1">
            {stock_point_sales.map((point) => (
              <div
                key={point.id}
                className="flex items-center gap-2 text-slate-300 text-sm"
              >
                <Store className="w-4 h-4 text-slate-400" />
                <span>{point.name}:</span>
                <span className="text-emerald-500 font-medium">
                  {point.stock}
                </span>
              </div>
            ))}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => (
        <button
          onClick={() => handleOpenModal(info.row.original)}
          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
        >
          Mover
        </button>
      ),
    }),
  ];

  /**
   * Configuración de la tabla
   */
  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: productsData?.total_pages || 0,
    state: {
      pagination,
      sorting,
    },
    manualPagination: !isSearching,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-6xl space-y-4">
        {/* Inputs de búsqueda y categoría */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buscar por nombre */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                if (e.target.value.trim()) {
                  setSearchCode("");
                  setSelectedCategoryId(null);
                }
              }}
              disabled={searchCode.trim().length > 0 || isFilteringByCategory}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchCode.trim().length > 0 || isFilteringByCategory
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>

          {/* Buscar por código */}
          <div className="relative">
            <Barcode className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código..."
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                if (e.target.value.trim()) {
                  setSearchName("");
                  setSelectedCategoryId(null);
                }
              }}
              disabled={searchName.trim().length > 0 || isFilteringByCategory}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchName.trim().length > 0 || isFilteringByCategory
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <select
              value={selectedCategoryId ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCategoryId(value ? Number(value) : null);
                setSearchName("");
                setSearchCode("");
              }}
              disabled={searchName.trim().length > 0 || searchCode.trim().length > 0}
              className={`w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                searchName.trim().length > 0 || searchCode.trim().length > 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">Filtrar por categoría</option>
              {isLoadingCategories ? (
                <option disabled>Cargando categorías...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-6 text-slate-400 text-center">
              {isFilteringByCategory
                ? "Cargando productos por categoría..."
                : isSearchingByName
                ? "Buscando productos por nombre..."
                : isSearchingByCode
                ? "Buscando productos por código..."
                : "Cargando productos..."}
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
                {tableData.length > 0 ? (
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
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación solo si NO estamos buscando */}
        {!isSearching && (
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
                  {pagination.pageIndex + 1} de {productsData?.total_pages || 1}
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
                onClick={() => table.setPageIndex((productsData?.total_pages || 1) - 1)}
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
        )}
      </div>

      {/* Modal con el formulario */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <FormMovementStock productId={selectedProduct.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TableReponerStock;
