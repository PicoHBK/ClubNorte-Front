// utils/dateRangeUtils.ts

import { startOfMonth, endOfMonth, subMonths, subDays} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// ========================================
// CONFIGURACIÓN GLOBAL
// ========================================

// Timezone de la aplicación - Cambiar según tu región
export const APP_TIMEZONE = 'America/Argentina/Salta';

// ========================================
// TIPOS
// ========================================

export type DateRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'currentMonth'
  | 'lastMonth'
  | 'last3Months'
  | 'last6Months'
  | 'currentYear';

export interface DateRange {
  from: string; // formato: 'YYYY-MM-DD'
  to: string;   // formato: 'YYYY-MM-DD'
}

export interface PresetButton {
  id: DateRangePreset;
  label: string;
  getRange: () => DateRange;
}

// ========================================
// FUNCIONES CORE PARA MANEJAR FECHAS
// ========================================

/**
 * Obtiene la fecha actual en el timezone de la app
 */
export const getAppToday = (): Date => {
  return toZonedTime(new Date(), APP_TIMEZONE);
};

/**
 * Parsea una fecha string (YYYY-MM-DD) al timezone de la app
 * Evita problemas de timezone que causan cambios de día
 */
export const parseDateSafe = (dateString: string): Date => {
  // Agregar 'T00:00:00' para forzar interpretación local
  return toZonedTime(`${dateString}T00:00:00`, APP_TIMEZONE);
};

/**
 * Formatea una fecha al formato YYYY-MM-DD en el timezone de la app
 */
export const formatDateSafe = (date: Date): string => {
  return formatInTimeZone(date, APP_TIMEZONE, 'yyyy-MM-dd');
};

/**
 * Formatea una fecha al formato deseado en el timezone de la app
 */
export const formatDateDisplay = (date: Date, formatStr: string = 'dd/MM/yyyy'): string => {
  return formatInTimeZone(date, APP_TIMEZONE, formatStr);
};

/**
 * Parsea y formatea una fecha string para display
 */
export const formatDateStringSafe = (dateString: string, formatStr: string = 'dd/MM/yyyy'): string => {
  const date = parseDateSafe(dateString);
  return formatDateDisplay(date, formatStr);
};

// ========================================
// FUNCIONES PARA RANGOS PREDEFINIDOS
// ========================================

/**
 * Obtiene el rango para "Hoy"
 */
export const getTodayRange = (): DateRange => {
  const today = getAppToday();
  const dateStr = formatDateSafe(today);
  return {
    from: dateStr,
    to: dateStr
  };
};

/**
 * Obtiene el rango para "Ayer"
 */
export const getYesterdayRange = (): DateRange => {
  const today = getAppToday();
  const yesterday = subDays(today, 1);
  const dateStr = formatDateSafe(yesterday);
  return {
    from: dateStr,
    to: dateStr
  };
};

/**
 * Obtiene el rango de los últimos N días (incluyendo hoy)
 */
export const getLastNDaysRange = (days: number): DateRange => {
  const today = getAppToday();
  const startDate = subDays(today, days - 1);
  return {
    from: formatDateSafe(startDate),
    to: formatDateSafe(today)
  };
};

/**
 * Obtiene el rango del mes actual (desde el día 1 hasta hoy)
 */
export const getCurrentMonthRange = (): DateRange => {
  const today = getAppToday();
  return {
    from: formatDateSafe(startOfMonth(today)),
    to: formatDateSafe(today)
  };
};

/**
 * Obtiene el rango del mes anterior completo
 */
export const getLastMonthRange = (): DateRange => {
  const today = getAppToday();
  const lastMonth = subMonths(today, 1);
  return {
    from: formatDateSafe(startOfMonth(lastMonth)),
    to: formatDateSafe(endOfMonth(lastMonth))
  };
};

/**
 * Obtiene el rango de los últimos N meses (hasta hoy)
 */
export const getLastNMonthsRange = (months: number): DateRange => {
  const today = getAppToday();
  const startDate = startOfMonth(subMonths(today, months - 1));
  return {
    from: formatDateSafe(startDate),
    to: formatDateSafe(today)
  };
};

/**
 * Obtiene el rango del año actual (desde enero 1 hasta hoy)
 */
export const getCurrentYearRange = (): DateRange => {
  const today = getAppToday();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  return {
    from: formatDateSafe(yearStart),
    to: formatDateSafe(today)
  };
};

// ========================================
// BOTONES PREDEFINIDOS
// ========================================

export const PRESET_BUTTONS: Record<DateRangePreset, PresetButton> = {
  today: {
    id: 'today',
    label: 'Hoy',
    getRange: getTodayRange
  },
  yesterday: {
    id: 'yesterday',
    label: 'Ayer',
    getRange: getYesterdayRange
  },
  last7days: {
    id: 'last7days',
    label: 'Últimos 7 días',
    getRange: () => getLastNDaysRange(7)
  },
  last30days: {
    id: 'last30days',
    label: 'Últimos 30 días',
    getRange: () => getLastNDaysRange(30)
  },
  last90days: {
    id: 'last90days',
    label: 'Últimos 90 días',
    getRange: () => getLastNDaysRange(90)
  },
  currentMonth: {
    id: 'currentMonth',
    label: 'Mes actual',
    getRange: getCurrentMonthRange
  },
  lastMonth: {
    id: 'lastMonth',
    label: 'Mes anterior',
    getRange: getLastMonthRange
  },
  last3Months: {
    id: 'last3Months',
    label: 'Últimos 3 meses',
    getRange: () => getLastNMonthsRange(3)
  },
  last6Months: {
    id: 'last6Months',
    label: 'Últimos 6 meses',
    getRange: () => getLastNMonthsRange(6)
  },
  currentYear: {
    id: 'currentYear',
    label: 'Año actual',
    getRange: getCurrentYearRange
  }
};

/**
 * Hook/Función helper para obtener botones según necesidad
 */
export const getPresetButtons = (presets: DateRangePreset[]): PresetButton[] => {
  return presets.map(preset => PRESET_BUTTONS[preset]);
};

// ========================================
// VALIDACIONES
// ========================================

/**
 * Valida que el rango de fechas sea correcto (from <= to)
 */
export const isValidDateRange = (range: DateRange): boolean => {
  const fromDate = parseDateSafe(range.from);
  const toDate = parseDateSafe(range.to);
  return fromDate <= toDate;
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const getDaysDifference = (range: DateRange): number => {
  const fromDate = parseDateSafe(range.from);
  const toDate = parseDateSafe(range.to);
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ========================================
// EJEMPLO DE USO
// ========================================

/*
// En tu componente:

import { 
  getPresetButtons, 
  formatDateStringSafe,
  parseDateSafe,
  getAppToday,
  formatDateSafe,
  type DateRange,
  type DateRangePreset 
} from '@/utils/dateRangeUtils';

const MyComponent = () => {
  // Estado inicial con mes anterior
  const [dateRange, setDateRange] = useState<DateRange>(() => 
    PRESET_BUTTONS.lastMonth.getRange()
  );

  // Botones que quieres mostrar
  const buttons = getPresetButtons([
    'last7days',
    'last30days',
    'currentMonth',
    'lastMonth'
  ]);

  // Manejar click en botón preset
  const handlePresetClick = (preset: DateRangePreset) => {
    const newRange = PRESET_BUTTONS[preset].getRange();
    setDateRange(newRange);
  };

  // Manejar cambio manual de fecha
  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      {buttons.map(button => (
        <button 
          key={button.id}
          onClick={() => handlePresetClick(button.id)}
        >
          {button.label}
        </button>
      ))}

      <input 
        type="date"
        value={dateRange.from}
        onChange={(e) => handleDateChange('from', e.target.value)}
      />
      <input 
        type="date"
        value={dateRange.to}
        onChange={(e) => handleDateChange('to', e.target.value)}
      />

      <p>
        Período: {formatDateStringSafe(dateRange.from)} - {formatDateStringSafe(dateRange.to)}
      </p>
    </div>
  );
};
*/