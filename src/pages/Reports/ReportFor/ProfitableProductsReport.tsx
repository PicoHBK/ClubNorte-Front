import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGetReportProfitableProducts } from "@/hooks/admin/Reports/useGetReportProfitableProducts";
import {
  PRESET_BUTTONS,
  formatDateStringSafe,
  type DateRange,
} from "@/utils/timeFilter/dateRangeUtils";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { ProductSummary } from "@/hooks/admin/Reports/ReportsType";
import DateRangePicker from "@/utils/timeFilter/DateRangePicker";

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
];

const columnHelper = createColumnHelper<ProductSummary>();

const ProfitableProductsReport: React.FC = () => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);

  // Estado de fechas usando el utility
  const [dateRange, setDateRange] = useState<DateRange>(
    PRESET_BUTTONS.currentMonth.getRange()
  );

  const queryParams = {
    from_date: dateRange.from,
    to_date: dateRange.to,
  };

  // Hook para obtener datos
  const { productsData, isLoading, isError } =
    useGetReportProfitableProducts(queryParams);

  // Transformar datos para el chart de ventas (Top 10)
  const salesChartData = useMemo(() => {
    if (!productsData?.products || productsData.products.length === 0)
      return [];

    return productsData.products
      .slice(0, 10)
      .sort((a, b) => b.total_sales - a.total_sales)
      .map((product) => ({
        name:
          product.name.length > 20
            ? product.name.substring(0, 20) + "..."
            : product.name,
        fullName: product.name,
        ventas: product.total_sales,
        code: product.code,
      }));
  }, [productsData]);

  const salesChartConfig = {
    ventas: {
      label: "Ventas Totales",
      color: "#3b82f6",
    },
  };

  // Transformar datos para el chart comparativo (Top 10)
  const comparisonChartData = useMemo(() => {
    if (!productsData?.products || productsData.products.length === 0)
      return [];

    return productsData.products
      .slice(0, 10)
      .sort((a, b) => b.total_profit - a.total_profit)
      .map((product) => ({
        name:
          product.name.length > 15
            ? product.name.substring(0, 15) + "..."
            : product.name,
        fullName: product.name,
        ventas: product.total_sales,
        costos: product.total_cost,
        ganancias: product.total_profit,
        code: product.code,
      }));
  }, [productsData]);

  const comparisonChartConfig = {
    ventas: {
      label: "Ventas",
      color: "#10b981",
    },
    costos: {
      label: "Costos",
      color: "#ef4444",
    },
    ganancias: {
      label: "Ganancias",
      color: "#3b82f6",
    },
  };

  // Calcular totales
  const totals = useMemo(() => {
    if (!productsData?.products || productsData.products.length === 0) {
      return { totalSales: 0, totalCost: 0, totalProfit: 0, totalQuantity: 0 };
    }

    return productsData.products.reduce(
      (acc, product) => ({
        totalSales: acc.totalSales + product.total_sales,
        totalCost: acc.totalCost + product.total_cost,
        totalProfit: acc.totalProfit + product.total_profit,
        totalQuantity: acc.totalQuantity + product.total_quantity,
      }),
      { totalSales: 0, totalCost: 0, totalProfit: 0, totalQuantity: 0 }
    );
  }, [productsData]);

  // Definir columnas de la tabla
  const columns = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Código",
        cell: (info) => (
          <span className="font-mono text-sm text-slate-400">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Producto",
        cell: (info) => <span className="text-white">{info.getValue()}</span>,
      }),
      columnHelper.accessor("total_quantity", {
        header: "Cantidad",
        cell: (info) => (
          <span className="text-slate-300">
            {info.getValue().toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("total_sales", {
        header: "Ventas",
        cell: (info) => (
          <span className="text-green-400">
            ${info.getValue().toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("total_cost", {
        header: "Costos",
        cell: (info) => (
          <span className="text-red-400">
            ${info.getValue().toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("total_profit", {
        header: "Ganancia",
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={`font-medium ${
                value >= 0 ? "text-blue-400" : "text-red-400"
              }`}
            >
              ${value.toLocaleString()}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "margin",
        header: "Margen %",
        cell: ({ row }) => {
          const sales = row.original.total_sales;
          const profit = row.original.total_profit;
          const margin =
            sales > 0 ? ((profit / sales) * 100).toFixed(1) : "0.0";
          return (
            <span
              className={`font-medium ${
                parseFloat(margin) >= 0 ? "text-blue-400" : "text-red-400"
              }`}
            >
              {margin}%
            </span>
          );
        },
      }),
    ],
    []
  );

  // Configurar la tabla
  const table = useReactTable({
    data: productsData?.products ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const volverAlDashboard = (): void => {
    navigate("/reports");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={volverAlDashboard}
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm sm:text-base">Volver al dashboard</span>
        </button>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                  <Package className="w-8 h-8" />
                  Productos Más Rentables
                </h1>
                <p className="text-slate-300 mt-2">
                  Análisis de ventas, costos y rentabilidad por producto
                </p>
              </div>
            </div>

            {/* DateRangePicker */}
            <DateRangePicker
              dateRange={dateRange}
              onChange={setDateRange}
              presets={["last7days", "last30days", "currentMonth", "lastMonth"]}
              defaultPreset="currentMonth"
            />
          </div>

          {/* Cards de resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-200">
                  Ventas Totales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${totals.totalSales.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-red-200">
                  Costos Totales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${totals.totalCost.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-200">
                  Ganancia Total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  ${totals.totalProfit.toLocaleString()}
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-purple-200">
                  Unidades Vendidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {totals.totalQuantity.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico Top 10 Productos por Ventas */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                Top 10 Productos por Ventas
              </CardTitle>
              <CardDescription className="text-slate-400">
                Productos con mayores ingresos • Período:{" "}
                {formatDateStringSafe(dateRange.from)} -{" "}
                {formatDateStringSafe(dateRange.to)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-slate-300">Cargando datos...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <p className="text-red-400">Error al cargar datos</p>
                </div>
              ) : salesChartData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-300">
                    No hay datos disponibles para el período seleccionado
                  </p>
                </div>
              ) : (
                <ChartContainer
                  config={salesChartConfig}
                  className="h-[400px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        type="number"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af" }}
                        width={150}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                      />
                      <Bar dataKey="ventas" radius={[0, 8, 8, 0]}>
                        {salesChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico Comparativo: Ventas vs Costos vs Ganancias */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                Análisis Comparativo: Ventas, Costos y Ganancias
              </CardTitle>
              <CardDescription className="text-slate-400">
                Top 10 productos por rentabilidad • Comparación de métricas
                clave
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-slate-300">Cargando datos...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <p className="text-red-400">Error al cargar datos</p>
                </div>
              ) : comparisonChartData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-300">
                    No hay datos disponibles para el período seleccionado
                  </p>
                </div>
              ) : (
                <ChartContainer
                  config={comparisonChartConfig}
                  className="h-[500px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        tick={{ fill: "#9ca3af" }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ color: "#9ca3af" }} />
                      <Bar
                        dataKey="ventas"
                        fill={comparisonChartConfig.ventas.color}
                        name="Ventas"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="costos"
                        fill={comparisonChartConfig.costos.color}
                        name="Costos"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="ganancias"
                        fill={comparisonChartConfig.ganancias.color}
                        name="Ganancias"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Tabla de Todos los Productos */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Detalle de Todos los Productos
              </CardTitle>
              <CardDescription className="text-slate-400">
                Información completa de productos del período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsData?.products && productsData.products.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-300">No hay datos disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                          key={headerGroup.id}
                          className="border-b border-slate-700"
                        >
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className={`py-3 px-4 text-slate-300 font-medium ${
                                header.column.id === "code" ||
                                header.column.id === "name"
                                  ? "text-left"
                                  : "text-right"
                              }`}
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  className={`flex items-center gap-2 ${
                                    header.column.getCanSort()
                                      ? "cursor-pointer select-none hover:text-white"
                                      : ""
                                  } ${
                                    header.column.id === "code" ||
                                    header.column.id === "name"
                                      ? "justify-start"
                                      : "justify-end"
                                  }`}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getCanSort() && (
                                    <span className="inline-block">
                                      {header.column.getIsSorted() === "asc" ? (
                                        <ArrowUp className="w-4 h-4" />
                                      ) : header.column.getIsSorted() ===
                                        "desc" ? (
                                        <ArrowDown className="w-4 h-4" />
                                      ) : (
                                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-slate-700/50 hover:bg-slate-700/30"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`py-3 px-4 ${
                                cell.column.id === "code" ||
                                cell.column.id === "name"
                                  ? "text-left"
                                  : "text-right"
                              }`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfitableProductsReport;
