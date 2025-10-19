import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useGetAllProducts } from "@/hooks/admin/Product/useGetAllProducts";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Store,
  Warehouse,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowUpDown,
  Filter,
  ArrowLeft,
} from "lucide-react";
import type { Product } from "@/hooks/admin/Product/productType";

const StockControlReport = () => {
  const navigate = useNavigate();
  
  // Ordenamiento y filtros
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedPointSale, setSelectedPointSale] = useState<string>("all");
  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);

  // Hook para obtener datos - siempre con límite 999
  const { productsData, isLoading } = useGetAllProducts(1, 999);

  // Función para calcular stock total
  const getTotalStock = (product: Product) => {
    const pointSalesStock =
      product.stock_point_sales?.reduce((sum, point) => sum + point.stock, 0) || 0;
    const depositStock = product.stock_deposit?.stock || 0;
    return pointSalesStock + depositStock;
  };

  // Función para obtener solo stock de puntos de venta
  const getPointSalesStock = (product: Product) => {
    return product.stock_point_sales?.reduce((sum, point) => sum + point.stock, 0) || 0;
  };

  // Función para determinar estado del stock
  const getStockStatus = (product: Product) => {
    const totalStock = getTotalStock(product);
    if (totalStock === 0) return "sin-stock";
    if (totalStock <= product.min_amount) return "critico";
    if (totalStock <= product.min_amount * 1.5) return "bajo";
    return "normal";
  };

  // Obtener todos los puntos de venta únicos
  const allPointSales = useMemo(() => {
    const pointSalesSet = new Set<string>();
    productsData.products.forEach(product => {
      product.stock_point_sales?.forEach(point => {
        pointSalesSet.add(JSON.stringify({ id: point.id, name: point.name }));
      });
    });
    return Array.from(pointSalesSet).map(p => JSON.parse(p));
  }, [productsData.products]);

  // Filtrar productos según el punto de venta seleccionado y estado de stock
  const filteredProducts = useMemo(() => {
    let filtered = productsData.products;
    
    // Filtrar por punto de venta
    if (selectedPointSale !== "all") {
      filtered = filtered.filter(product => 
        product.stock_point_sales?.some(point => point.id.toString() === selectedPointSale)
      );
    }
    
    // Filtrar por estado de stock (bajo o crítico)
    if (showOnlyLowStock) {
      filtered = filtered.filter(product => {
        const status = getStockStatus(product);
        return status === "critico" || status === "bajo" || status === "sin-stock";
      });
    }
    
    return filtered;
  }, [productsData.products, selectedPointSale, showOnlyLowStock]);

  // Calcular estadísticas generales
  const stats = {
    totalProducts: filteredProducts.length,
    criticalStock: filteredProducts.filter((p) => getStockStatus(p) === "critico").length,
    lowStock: filteredProducts.filter((p) => getStockStatus(p) === "bajo").length,
    outOfStock: filteredProducts.filter((p) => getStockStatus(p) === "sin-stock").length,
    totalValue: filteredProducts.reduce(
      (sum, p) => sum + getTotalStock(p) * p.price,
      0
    ),
  };

  // Calcular estadísticas de stock por ubicación
  const locationStats = {
    totalStockPointSales: filteredProducts.reduce(
      (sum, p) => sum + getPointSalesStock(p),
      0
    ),
    totalStockDeposit: filteredProducts.reduce(
      (sum, p) => sum + (p.stock_deposit?.stock || 0),
      0
    ),
    totalStock: filteredProducts.reduce(
      (sum, p) => sum + getTotalStock(p),
      0
    ),
  };

  // Columnas
  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor("code", {
      header: "Código",
      cell: (info) => (
        <span className="font-medium text-slate-300">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Producto",
      cell: (info) => (
        <div>
          <span className="font-semibold text-white block">{info.getValue()}</span>
          <span className="text-slate-400 text-xs">
            {info.row.original.category.name}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "stock_status",
      header: "Estado",
      cell: (info) => {
        const status = getStockStatus(info.row.original);
        const totalStock = getTotalStock(info.row.original);
        const minAmount = info.row.original.min_amount;

        if (status === "sin-stock") {
          return (
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-semibold">Sin Stock</span>
            </div>
          );
        }
        if (status === "critico") {
          return (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <span className="text-orange-500 font-semibold block">Crítico</span>
                <span className="text-slate-400 text-xs">
                  {totalStock}/{minAmount} mín
                </span>
              </div>
            </div>
          );
        }
        if (status === "bajo") {
          return (
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-yellow-500" />
              <div>
                <span className="text-yellow-500 font-semibold block">Bajo</span>
                <span className="text-slate-400 text-xs">
                  {totalStock}/{minAmount} mín
                </span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">Normal</span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "point_sales_stock",
      header: "Stock en Sucursales",
      cell: (info) => {
        const { stock_point_sales } = info.row.original;
        const totalPointSales = getPointSalesStock(info.row.original);

        return (
          <div className="space-y-1">
            {stock_point_sales && stock_point_sales.length > 0 ? (
              <>
                {stock_point_sales.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center gap-2 text-slate-300 text-sm"
                  >
                    <Store className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{point.name}:</span>
                    <span className="text-indigo-400 font-medium">{point.stock}</span>
                  </div>
                ))}
                <div className="text-slate-400 text-xs mt-1 pt-1 border-t border-slate-700">
                  Total: <span className="text-indigo-400 font-semibold">{totalPointSales}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 italic text-sm">Sin sucursales</div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.stock_deposit?.stock ?? 0, {
      id: "stock_deposit",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          Stock Depósito
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-slate-400" />
          <span className="text-emerald-500 font-semibold text-lg">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "total_stock",
      header: "Stock Total",
      cell: (info) => {
        const total = getTotalStock(info.row.original);
        return (
          <div className="text-center">
            <span className="text-white font-bold text-xl">{total}</span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "stock_value",
      header: "Valor en Stock",
      cell: (info) => {
        const total = getTotalStock(info.row.original);
        const value = total * info.row.original.price;
        return (
          <span className="text-emerald-500 font-semibold">
            ${value.toFixed(2)}
          </span>
        );
      },
    }),
  ];

  // Configuración de la tabla
  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <div className="w-full max-w-7xl space-y-6">
        {/* Botón Volver al Dashboard */}
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-indigo-600 rounded-lg p-3">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Control de Stock</h1>
            <p className="text-slate-300 text-sm">
              Monitoreo y análisis del inventario
            </p>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-3">
            {/* Filtro por Punto de Venta */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-indigo-400" />
                <div>
                  <label className="text-slate-400 text-xs block mb-1">
                    Filtrar por Sucursal
                  </label>
                  <select
                    value={selectedPointSale}
                    onChange={(e) => setSelectedPointSale(e.target.value)}
                    className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Todas las sucursales</option>
                    {allPointSales.map((point) => (
                      <option key={point.id} value={point.id.toString()}>
                        {point.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filtro de Stock Bajo */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <div>
                  <label className="text-slate-400 text-xs block mb-1">
                    Filtrar Stock
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyLowStock}
                      onChange={(e) => setShowOnlyLowStock(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-white text-sm">Solo bajo/crítico</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Estado */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="text-slate-400 text-sm">Total Productos</p>
                <p className="text-white text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-slate-400 text-sm">Sin Stock</p>
                <p className="text-red-500 text-2xl font-bold">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-slate-400 text-sm">Stock Crítico</p>
                <p className="text-orange-500 text-2xl font-bold">{stats.criticalStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-slate-400 text-sm">Stock Bajo</p>
                <p className="text-yellow-500 text-2xl font-bold">{stats.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-slate-400 text-sm">Valor Total</p>
                <p className="text-emerald-500 text-xl font-bold">
                  ${stats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-7 h-7 text-indigo-400" />
              <h3 className="text-slate-200 font-semibold">Stock en Sucursales</h3>
            </div>
            <p className="text-indigo-400 text-3xl font-bold">
              {locationStats.totalStockPointSales}
            </p>
            <p className="text-slate-400 text-sm mt-1">Unidades en puntos de venta</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <Warehouse className="w-7 h-7 text-emerald-400" />
              <h3 className="text-slate-200 font-semibold">Stock en Depósito</h3>
            </div>
            <p className="text-emerald-400 text-3xl font-bold">
              {locationStats.totalStockDeposit}
            </p>
            <p className="text-slate-400 text-sm mt-1">Unidades en bodega</p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-7 h-7 text-white" />
              <h3 className="text-slate-200 font-semibold">Stock Total</h3>
            </div>
            <p className="text-white text-3xl font-bold">
              {locationStats.totalStock}
            </p>
            <p className="text-slate-400 text-sm mt-1">Unidades totales</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-lg">
          {isLoading ? (
            <div className="p-6 text-slate-400 text-center">
              Cargando productos...
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
                {filteredProducts.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
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
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockControlReport;