import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  User,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
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
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useGetAllMovements } from "@/hooks/admin/MovementStock/useGetAllMovements";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";
import type { Movement} from "@/hooks/admin/MovementStock/movementStockType";

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

const columnHelper = createColumnHelper<Movement>();

const StockMovementsReport: React.FC = () => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Hooks
  const { movementsData, isLoading, isError } = useGetAllMovements(1, 1000);
  const { pointSales, isLoading: isLoadingPoints } = usePointSaleGetAll();

  // Función para obtener el nombre del punto de venta
  const getPointSaleName = (id: number) => {
    if (!pointSales || pointSales.length === 0) return `ID: ${id}`;
    const point = pointSales.find((ps) => ps.id === id);
    return point ? point.name : `ID: ${id}`;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtrar datos según el tipo seleccionado (PRIMERO FILTRAR)
  const filteredMovements = useMemo(() => {
    const movements = movementsData.movements;
    
    if (!movements || movements.length === 0) return [];
    if (typeFilter === "all") return movements;

    return movements.filter((m) => {
      switch (typeFilter) {
        case "deposit_to_point":
          return m.from_type === "deposit" && m.to_type === "point_sale";
        case "point_to_point":
          return m.from_type === "point_sale" && m.to_type === "point_sale";
        case "point_to_deposit":
          return m.from_type === "point_sale" && m.to_type === "deposit";
        default:
          return true;
      }
    });
  }, [movementsData.movements, typeFilter]);

  // Calcular estadísticas generales (USAR DATOS FILTRADOS)
  const stats = useMemo(() => {
    if (!filteredMovements || filteredMovements.length === 0) {
      return {
        totalMovements: 0,
        toDeposit: 0,
        toPointSale: 0,
        uniqueProducts: 0,
        uniqueUsers: 0,
        totalAmount: 0,
      };
    }

    const uniqueProductIds = new Set(filteredMovements.map((m) => m.product.id));
    const uniqueUserIds = new Set(filteredMovements.map((m) => m.user.id));

    return {
      totalMovements: filteredMovements.length,
      toDeposit: filteredMovements.filter((m) => m.to_type === "deposit").length,
      toPointSale: filteredMovements.filter((m) => m.to_type === "point_sale").length,
      uniqueProducts: uniqueProductIds.size,
      uniqueUsers: uniqueUserIds.size,
      totalAmount: filteredMovements.reduce((acc, m) => acc + (Number(m.amount) || 0), 0),
    };
  }, [filteredMovements]);

  // Datos para gráfico de tipos de movimiento (USAR DATOS FILTRADOS)
  const movementTypesData = useMemo(() => {
    if (!filteredMovements || filteredMovements.length === 0) return [];

    const types: Record<string, number> = {};
    filteredMovements.forEach((m) => {
      const key = `${m.from_type === "deposit" ? "Depósito" : "Punto Venta"} → ${
        m.to_type === "deposit" ? "Depósito" : "Punto Venta"
      }`;
      types[key] = (types[key] || 0) + 1;
    });

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [filteredMovements]);

  // Top 10 productos más movidos (USAR DATOS FILTRADOS)
  const topProductsData = useMemo(() => {
    if (!filteredMovements || filteredMovements.length === 0) return [];

    const productStats: Record<
      number,
      { name: string; code: string; total: number }
    > = {};

    filteredMovements.forEach((m) => {
      if (!productStats[m.product.id]) {
        productStats[m.product.id] = {
          name: m.product.name,
          code: m.product.code,
          total: 0,
        };
      }
      productStats[m.product.id].total += Number(m.amount) || 0;
    });

    return Object.values(productStats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
        fullName: p.name,
        code: p.code,
        cantidad: p.total,
      }));
  }, [filteredMovements]);

  // Top usuarios que más mueven (USAR DATOS FILTRADOS)
  const topUsersData = useMemo(() => {
    if (!filteredMovements || filteredMovements.length === 0) return [];

    const userStats: Record<number, { name: string; count: number }> = {};

    filteredMovements.forEach((m) => {
      if (!userStats[m.user.id]) {
        userStats[m.user.id] = {
          name: `${m.user.first_name} ${m.user.last_name}`,
          count: 0,
        };
      }
      userStats[m.user.id].count += 1;
    });

    return Object.values(userStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((u) => ({
        name: u.name.length > 25 ? u.name.substring(0, 25) + "..." : u.name,
        fullName: u.name,
        movimientos: u.count,
      }));
  }, [filteredMovements]);

  const chartConfig = {
    cantidad: {
      label: "Cantidad Movida",
      color: "#3b82f6",
    },
    movimientos: {
      label: "Movimientos",
      color: "#10b981",
    },
  };

  // Definir columnas de la tabla (CON NOMBRES DE POINT SALE)
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-sm text-slate-400">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("product.code", {
        header: "Código",
        cell: (info) => (
          <span className="font-mono text-sm text-slate-300">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("product.name", {
        header: "Producto",
        cell: (info) => <span className="text-white">{info.getValue()}</span>,
      }),
      columnHelper.accessor("amount", {
        header: "Cantidad",
        cell: (info) => (
          <span className="text-blue-400 font-semibold">
            {Number(info.getValue()).toLocaleString()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "from",
        header: "Origen",
        cell: ({ row }) => {
          const fromType = row.original.from_type;
          const fromId = row.original.from_id;
          return (
            <span className="text-slate-300">
              {fromType === "deposit" 
                ? `Depósito #${fromId}` 
                : getPointSaleName(fromId)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "to",
        header: "Destino",
        cell: ({ row }) => {
          const toType = row.original.to_type;
          const toId = row.original.to_id;
          return (
            <span className="text-slate-300">
              {toType === "deposit" 
                ? `Depósito #${toId}` 
                : getPointSaleName(toId)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "user",
        header: "Usuario",
        cell: ({ row }) => (
          <span className="text-slate-300">
            {row.original.user.first_name} {row.original.user.last_name}
          </span>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Fecha",
        cell: (info) => (
          <span className="text-slate-400 text-sm">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("ignore_stock", {
        header: "Ignora Stock",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded text-xs ${
              info.getValue()
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {info.getValue() ? "Sí" : "No"}
          </span>
        ),
      }),
    ],
    [pointSales]
  );

  // Configurar la tabla
  const table = useReactTable({
    data: filteredMovements,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
                  <ArrowRightLeft className="w-8 h-8" />
                  Movimientos de Stock
                </h1>
                <p className="text-slate-300 mt-2">
                  Análisis completo de transferencias entre depósitos y puntos
                  de venta
                </p>
              </div>
            </div>

            {/* Filtro por tipo de movimiento */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  typeFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter("deposit_to_point")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  typeFilter === "deposit_to_point"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Depósito → Punto Venta
              </button>
              <button
                onClick={() => setTypeFilter("point_to_point")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  typeFilter === "point_to_point"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Punto Venta → Punto Venta
              </button>
              <button
                onClick={() => setTypeFilter("point_to_deposit")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  typeFilter === "point_to_deposit"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Punto Venta → Depósito
              </button>
            </div>
          </div>

          {/* Cards de resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-blue-200">
                  Total Movimientos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  {stats.totalMovements.toLocaleString()}
                  <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-green-200">
                  Cantidad Total Movida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-purple-200">
                  Productos Diferentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  {stats.uniqueProducts}
                  <Package className="w-5 h-5 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-orange-200">
                  Usuarios Activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  {stats.uniqueUsers}
                  <User className="w-5 h-5 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Movimientos - AHORA PRIMERO */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                Detalle de Movimientos
              </CardTitle>
              <CardDescription className="text-slate-400">
                {filteredMovements.length} movimiento(s) mostrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || isLoadingPoints ? (
                <div className="text-center py-6">
                  <p className="text-slate-300">Cargando datos...</p>
                </div>
              ) : filteredMovements.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-300">No hay datos disponibles para este filtro</p>
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
                              className="py-3 px-4 text-slate-300 font-medium text-left"
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  className={`flex items-center gap-2 ${
                                    header.column.getCanSort()
                                      ? "cursor-pointer select-none hover:text-white"
                                      : ""
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
                          className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="py-3 px-4">
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

          {/* Grid de gráficos - AHORA AL FINAL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de tipos de movimiento */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Distribución por Tipo de Movimiento
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Clasificación de transferencias
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
                ) : movementTypesData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-300">No hay datos disponibles para este filtro</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={movementTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {movementTypesData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top 10 Productos */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Top 10 Productos Más Movidos
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Por cantidad total transferida
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
                ) : topProductsData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-300">No hay datos disponibles para este filtro</p>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsData} layout="vertical">
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
                          width={120}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="cantidad" radius={[0, 8, 8, 0]}>
                          {topProductsData.map((_, index) => (
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
          </div>

          {/* Top Usuarios */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Top 10 Usuarios Más Activos
              </CardTitle>
              <CardDescription className="text-slate-400">
                Por cantidad de movimientos realizados
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
              ) : topUsersData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-300">No hay datos disponibles para este filtro</p>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topUsersData}>
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
                      <Bar
                        dataKey="movimientos"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                      >
                        {topUsersData.map((_, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default StockMovementsReport;