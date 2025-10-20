import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

//import MKMonth from "@/mockup/Report1Moth.json";


// ============================================
// TYPES
// ============================================
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

export interface MonthMovement {
  balance: number;
  fecha: string;
  point_sale_id: number;
  point_sale_name: string;
  total_canchas: number;
  total_egresos: number;
  total_ingresos: number;
}

export interface MonthData {
  fecha: string; // Formato: "YYYY-MM"
  movimiento: MonthMovement[];
}

export type MonthReportBody = MonthData[];

export interface GetMonthReportParams {
  from_date: string; // Formato: "YYYY-MM-DD" (el día es ignorado por el backend)
  to_date: string; // Formato: "YYYY-MM-DD" (el día es ignorado por el backend)
}

// ============================================
// VALIDATION
// ============================================
const isValidDateFormat = (date: string): boolean => 
  /^\d{4}-\d{2}-\d{2}$/.test(date);

// ============================================
// API CALL
// ============================================
const getMonthReport = async (
  params: GetMonthReportParams
): Promise<ApiSuccessResponse<MonthReportBody>> => {
  const response = await apiClubNorte.post<ApiSuccessResponse<MonthReportBody>>(
    `/api/v1/report/get_by_date?form=month`,
    params,
    { withCredentials: true }
  );
  return response.data;
};

// ============================================
// CUSTOM HOOK
// ============================================
export const useGetMonthReport = (params: GetMonthReportParams) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getMonthReport", params.from_date, params.to_date],
    queryFn: () => getMonthReport(params),
    enabled: 
      !!params.from_date && 
      !!params.to_date &&
      isValidDateFormat(params.from_date) &&
      isValidDateFormat(params.to_date),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const apiError = getApiError(error);

  return {
    monthReportData: data?.body ?? ([] as MonthReportBody),
    //monthReportData: MKMonth ?? ([] as MonthReportBody),
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};