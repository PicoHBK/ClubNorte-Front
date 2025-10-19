import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useGetMonthReport } from '@/hooks/admin/Reports/useGetMonthReport';
import { useGetDayReport } from '@/hooks/admin/Reports/useGetDayReport';
import { 
  PRESET_BUTTONS, 
  parseDateSafe,
  type DateRange 
} from '@/utils/timeFilter/dateRangeUtils';
import DateRangePicker from '@/utils/timeFilter/DateRangePicker';

type ViewType = 'month' | 'day';

const APP_TIMEZONE = 'America/Argentina/Salta';

interface ChartDataPoint {
  name: string;
  fecha: string;
  [key: string]: string | number;
}

interface PointSaleTableData {
  name: string;
  ingresos: number;
  egresos: number;
  balance: number;
  total_canchas: number;
}

const POINT_SALE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

const parseDateOnly = (dateString: string): Date => {
  return parseDateSafe(dateString);
};

const RentabilityReport: React.FC = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<ViewType>('month');

  // Estado de fecha usando el utility - CONFIGURABLE
  const [dateRange, setDateRange] = useState<DateRange>(
    PRESET_BUTTONS.lastMonth.getRange() // Cambia aquí según necesites
  );

  const queryParams = {
    from_date: dateRange.from,
    to_date: dateRange.to
  };

  // Hooks
  const monthReport = useGetMonthReport(queryParams);
  const dayReport = useGetDayReport(queryParams);

  const currentReport = viewType === 'month' ? monthReport : dayReport;
  const { isLoading, isError } = currentReport;
  const reportData = viewType === 'month' ? monthReport.monthReportData : dayReport.dayReportData;

  // Obtener lista única de puntos de venta
  const uniquePointSales = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    const pointSalesSet = new Set<string>();
    reportData.forEach(dateGroup => {
      dateGroup.movimiento.forEach(mov => {
        pointSalesSet.add(mov.point_sale_name);
      });
    });
    
    return Array.from(pointSalesSet);
  }, [reportData]);

  // Crear configuración dinámica del chart
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    uniquePointSales.forEach((pointSale, index) => {
      config[pointSale] = {
        label: pointSale,
        color: POINT_SALE_COLORS[index % POINT_SALE_COLORS.length]
      };
    });
    return config;
  }, [uniquePointSales]);

  // Transformar datos para el chart
  const chartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    if (viewType === 'month') {
      return reportData.map(dateGroup => {
        const dateStr = `${dateGroup.fecha}-01`;
        const date = parseDateOnly(dateStr);
        const formattedDate = formatInTimeZone(date, APP_TIMEZONE, 'MMM yyyy');
        
        const dataPoint: ChartDataPoint = {
          name: formattedDate,
          fecha: dateGroup.fecha
        };
        
        dateGroup.movimiento.forEach(mov => {
          dataPoint[mov.point_sale_name] = mov.balance;
        });
        
        return dataPoint;
      });
    } else {
      return reportData.map(dateGroup => {
        const date = parseDateOnly(dateGroup.fecha);
        const formattedDate = formatInTimeZone(date, APP_TIMEZONE, 'dd MMM');
        
        const dataPoint: ChartDataPoint = {
          name: formattedDate,
          fecha: dateGroup.fecha
        };
        
        dateGroup.movimiento.forEach(mov => {
          dataPoint[mov.point_sale_name] = mov.balance;
        });
        
        return dataPoint;
      });
    }
  }, [reportData, viewType]);

  // Datos para tabla de detalle por punto de venta
  const pointSaleData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    const allMovements = reportData.flatMap(dateGroup => dateGroup.movimiento);
    
    const groupedByPointSale = allMovements.reduce((acc, mov) => {
      const key = mov.point_sale_name;
      if (!acc[key]) {
        acc[key] = {
          name: mov.point_sale_name,
          ingresos: 0,
          egresos: 0,
          balance: 0,
          total_canchas: 0
        };
      }
      acc[key].ingresos += mov.total_ingresos;
      acc[key].egresos += mov.total_egresos;
      acc[key].balance += mov.balance;
      acc[key].total_canchas += mov.total_canchas;
      return acc;
    }, {} as Record<string, PointSaleTableData>);

    return Object.values(groupedByPointSale);
  }, [reportData]);

  const volverAlDashboard = (): void => {
    navigate('/reports');
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Comparación de Rentabilidad
                </h1>
                <p className="text-slate-300 mt-2">
                  Comparación entre puntos de venta - {viewType === 'month' ? 'Vista mensual' : 'Vista diaria'}
                </p>
              </div>

              {/* Toggle Mensual/Diario */}
              <div className="flex rounded-lg bg-slate-800/50 p-1 border border-slate-700">
                <button
                  onClick={() => setViewType('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'month'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setViewType('day')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'day'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Diario
                </button>
              </div>
            </div>

            {/* DateRangePicker - REEMPLAZA TODO EL SELECTOR DE FECHAS */}
            <DateRangePicker 
              dateRange={dateRange}
              onChange={setDateRange}
              presets={['last7days', 'last30days', 'currentMonth', 'lastMonth']}
            />
          </div>

          {/* Gráfico de Comparación por Punto de Venta */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                Comparación de Balance por Punto de Venta
              </CardTitle>
              <CardDescription className="text-slate-400">
                Balance neto (Ingresos - Egresos) de cada punto de venta • Período: {
                  formatInTimeZone(parseDateOnly(dateRange.from), APP_TIMEZONE, 'dd/MM/yyyy')
                } - {
                  formatInTimeZone(parseDateOnly(dateRange.to), APP_TIMEZONE, 'dd/MM/yyyy')
                }
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
              ) : chartData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-300">No hay datos disponibles para el período seleccionado</p>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ color: '#9ca3af' }} />
                      {uniquePointSales.map((pointSale, index) => (
                        <Bar
                          key={pointSale}
                          dataKey={pointSale}
                          fill={POINT_SALE_COLORS[index % POINT_SALE_COLORS.length]}
                          name={pointSale}
                          radius={[8, 8, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Tabla de Resumen por Punto de Venta */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Resumen por Punto de Venta</CardTitle>
              <CardDescription className="text-slate-400">
                Totales acumulados del período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pointSaleData.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-slate-300">No hay datos disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Punto de Venta</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-medium">Ingresos</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-medium">Egresos</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-medium">Balance</th>
                        <th className="text-right py-3 px-4 text-slate-300 font-medium">Total Canchas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointSaleData.map((point, index) => (
                        <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4 text-white flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: POINT_SALE_COLORS[index % POINT_SALE_COLORS.length] }}
                            />
                            {point.name}
                          </td>
                          <td className="text-right py-3 px-4 text-green-400">
                            ${point.ingresos.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-red-400">
                            ${point.egresos.toLocaleString()}
                          </td>
                          <td className={`text-right py-3 px-4 font-medium ${
                            point.balance >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${point.balance.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-300">
                            {point.total_canchas.toLocaleString()}
                          </td>
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

export default RentabilityReport;