// Interface para un movimiento individual de punto de venta
export interface MonthMovement {
  balance: number;
  fecha: string;
  point_sale_id: number;
  point_sale_name: string;
  total_canchas: number;
  total_egresos: number;
  total_ingresos: number;
}

// Interface para el agrupamiento por fecha
export interface MonthData {
  fecha: string;
  movimiento: MonthMovement[];
}

// Type para el body completo del reporte mensual
export type MonthReportBody = MonthData[];

// ============================================
// DAY REPORT INTERFACES
// ============================================

// Interface para un movimiento individual de punto de venta (día)
export interface DayMovement {
  balance: number;
  fecha: string; // ISO 8601 con timezone: "2025-10-08T00:00:00-03:00"
  point_sale_id: number;
  point_sale_name: string;
  total_canchas: number;
  total_egresos: number;
  total_ingresos: number;
}

// Interface para el agrupamiento por fecha (día)
export interface DayData {
  fecha: string; // Formato: "YYYY-MM-DD"
  movimiento: DayMovement[];
}

// Type para el body completo del reporte diario
export type DayReportBody = DayData[];


export interface ProductSummary {
  id: number;
  code: string;
  name: string;
  total_cost: number;
  total_profit: number;
  total_quantity: number;
  total_sales: number;
}