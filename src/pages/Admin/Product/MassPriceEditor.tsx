import { useState, useEffect, useRef } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useSearchProductsByCode } from "@/hooks/admin/Product/useSearchProductsByCode";
import { useGetProductsByCategory } from "@/hooks/admin/Product/useGetProductsByCategory";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import { getApiError } from "@/utils/apiError";
import type { Product } from "@/hooks/admin/Product/productType";
import {
  Search,
  Barcode,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useProductMutations } from "@/hooks/admin/Product/useProductMutations";

const MassPriceEditor = () => {
  // Estados de búsqueda
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [debouncedSearchCode, setDebouncedSearchCode] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Estado para cambios de precios (Map<productId, newPrice>)
  const [priceChanges, setPriceChanges] = useState<Map<number, number>>(new Map());

  // Hook de mutación
  const {
    bulkUpdatePrices,
    isBulkUpdatingPrices,
    isBulkPricesUpdated,
    bulkUpdatePricesError,
    resetBulkUpdatePricesState,
  } = useProductMutations();

  // Paginación
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  // Debounce para búsquedas
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchName(searchName);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchName]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchCode(searchCode);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchCode]);

  // Resetear cambios cuando se guarda exitosamente
  useEffect(() => {
    if (isBulkPricesUpdated) {
      setPriceChanges(new Map());
      setTimeout(() => {
        resetBulkUpdatePricesState();
      }, 3000);
    }
  }, [isBulkPricesUpdated, resetBulkUpdatePricesState]);

  // Mostrar errores
  useEffect(() => {
    if (bulkUpdatePricesError) {
      const apiError = getApiError(bulkUpdatePricesError);
      const errorMessage = apiError?.message || "Error desconocido al actualizar precios";
      alert(`❌ ${errorMessage}`);
      resetBulkUpdatePricesState();
    }
  }, [bulkUpdatePricesError, resetBulkUpdatePricesState]);

  // Hooks para obtener datos
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

  // Lógica para determinar qué datos mostrar
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
    : productsData.products;

  const isLoading = isFilteringByCategory
    ? isLoadingCategory
    : isSearchingByName
    ? isLoadingName
    : isSearchingByCode
    ? isLoadingCode
    : isLoadingAll;

  // Función para manejar cambio de precio individual
  const handlePriceChange = (productId: number, newPrice: number) => {
    const newChanges = new Map(priceChanges);
    
    // Redondear a número entero
    const roundedPrice = Math.round(newPrice);
    
    // Si el precio es igual al original, lo removemos del map
    const originalProduct = tableData.find((p) => p.id === productId);
    if (originalProduct && Math.round(originalProduct.price) === roundedPrice) {
      newChanges.delete(productId);
    } else {
      newChanges.set(productId, roundedPrice);
    }
    
    setPriceChanges(newChanges);
  };

  // Función para guardar cambios
  const savePriceChanges = () => {
    const changesToSave = Array.from(priceChanges.entries()).map(
      ([id, price]) => ({
        id,
        price,
      })
    );

    if (changesToSave.length === 0) {
      alert("⚠️ No hay cambios para guardar");
      return;
    }

    console.log("📦 Productos a actualizar:", changesToSave);
    console.log("📊 Total de productos editados:", changesToSave.length);
    
    // Llamar a la mutación
    bulkUpdatePrices({
      list: changesToSave,
    });
  };

  // Función para resetear cambios
  const resetChanges = () => {
    setPriceChanges(new Map());
  };

  // Obtener precio actual (modificado o original)
  const getCurrentPrice = (product: Product) => {
    return priceChanges.get(product.id) ?? Math.round(product.price);
  };

  // Verificar si un producto tiene cambios
  const hasChanges = (productId: number) => {
    return priceChanges.has(productId);
  };

  // Componente de input de precio con ref y estado local
  const PriceInput = ({ product }: { product: Product }) => {
    const currentPrice = getCurrentPrice(product);
    const isModified = hasChanges(product.id);
    const [localValue, setLocalValue] = useState(currentPrice.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincronizar con cambios externos
    useEffect(() => {
      setLocalValue(currentPrice.toString());
    }, [currentPrice]);

    const handleBlur = () => {
      const numValue = parseInt(localValue) || 0;
      handlePriceChange(product.id, numValue);
    };

    const handleClick = () => {
      inputRef.current?.select();
    };

    return (
      <div className="flex items-center gap-2 min-w-[280px]">
        <span className="text-slate-400 text-xs">$</span>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            setLocalValue(value);
          }}
          onBlur={handleBlur}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleBlur();
              inputRef.current?.blur();
            }
          }}
          disabled={isBulkUpdatingPrices}
          className={`w-28 px-3 py-2 rounded-lg border-2 text-sm font-medium focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isModified
              ? "bg-emerald-950/50 border-emerald-500 text-emerald-400 focus:ring-emerald-500"
              : "bg-slate-900 border-slate-700 text-slate-300 focus:ring-indigo-500"
          }`}
        />
        <span className="text-xs text-emerald-400 font-medium w-32">
          {isModified && `(Original: ${Math.round(product.price)})`}
        </span>
      </div>
    );
  };

  // Columnas
  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="text-slate-400 font-mono">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("code", {
      header: "Código",
      cell: (info) => (
        <span className="font-medium text-slate-300">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Nombre",
      cell: (info) => (
        <span className="font-semibold text-white">{info.getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "price",
      header: "Precio",
      cell: (info) => <PriceInput product={info.row.original} />,
    }),
  ];

  // Configuración de la tabla
  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: productsData.total_pages,
    state: {
      pagination,
    },
    manualPagination: !isSearching,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  const hasAnyChanges = priceChanges.size > 0;

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-6xl space-y-4">
        {/* Header con título */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Editor Masivo de Precios</h1>
          {hasAnyChanges && (
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500 rounded-lg text-emerald-400 font-medium">
                {priceChanges.size} producto{priceChanges.size !== 1 ? "s" : ""} modificado{priceChanges.size !== 1 ? "s" : ""}
              </span>
              <button
                onClick={resetChanges}
                disabled={isBulkUpdatingPrices}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Resetear
              </button>
              <button
                onClick={savePriceChanges}
                disabled={isBulkUpdatingPrices}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkUpdatingPrices ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mensaje de éxito */}
        {isBulkPricesUpdated && (
          <div className="bg-emerald-500/20 border border-emerald-500 rounded-lg px-4 py-3 text-emerald-400 font-medium">
            ✅ Precios actualizados correctamente
          </div>
        )}

        {/* Filtros de búsqueda */}
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
              disabled={searchCode.trim().length > 0 || isFilteringByCategory || isBulkUpdatingPrices}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchCode.trim().length > 0 || isFilteringByCategory || isBulkUpdatingPrices
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
              disabled={searchName.trim().length > 0 || isFilteringByCategory || isBulkUpdatingPrices}
              className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                searchName.trim().length > 0 || isFilteringByCategory || isBulkUpdatingPrices
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
              disabled={searchName.trim().length > 0 || searchCode.trim().length > 0 || isBulkUpdatingPrices}
              className={`w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                searchName.trim().length > 0 || searchCode.trim().length > 0 || isBulkUpdatingPrices
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
            <div className="p-6 text-slate-400 text-center">Cargando productos...</div>
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
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        hasChanges(row.original.id)
                          ? "bg-emerald-950/20 hover:bg-emerald-950/30"
                          : "hover:bg-white/5"
                      }`}
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
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación solo si NO hay búsqueda */}
        {!isSearching && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isBulkUpdatingPrices}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 rounded-lg transition"
              >
                Anterior
              </button>
              <span className="text-slate-400 text-sm">
                Página{" "}
                <strong className="text-white">
                  {pagination.pageIndex + 1} de {productsData.total_pages}
                </strong>
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isBulkUpdatingPrices}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40 rounded-lg transition"
              >
                Siguiente
              </button>
            </div>

            <select
              value={pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              disabled={isBulkUpdatingPrices}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default MassPriceEditor;