/**
 * ============================================
 * DATERANGEPICKER - PROPS Y OPCIONES
 * ============================================
 */

/**
 * PROPS DEL COMPONENTE
 * ------------------------------------
 * 
 * @param {DateRange} dateRange - REQUERIDO
 *   Estado actual del rango de fechas { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 * 
 * @param {function} onChange - REQUERIDO
 *   Callback que recibe el nuevo DateRange cuando cambia
 * 
 * @param {DateRangePreset[]} presets - OPCIONAL (default: ['last7days', 'last30days', 'currentMonth', 'lastMonth'])
 *   Array con los botones que quieres mostrar
 * 
 * @param {DateRangePreset} defaultPreset - OPCIONAL
 *   Define cuál botón inicia activo/resaltado
 * 
 * @param {boolean} showManualInputs - OPCIONAL (default: true)
 *   Mostrar/ocultar los inputs de fecha manual
 * 
 * @param {boolean} showTitle - OPCIONAL (default: true)
 *   Mostrar/ocultar el título "Rango de Fechas"
 * 
 * @param {string} className - OPCIONAL
 *   Clases CSS adicionales para el contenedor
 * 
 * @param {'default' | 'compact'} buttonStyle - OPCIONAL (default: 'default')
 *   Tamaño de los botones: 'default' (normal) o 'compact' (pequeño)
 */

/**
 * BOTONES DISPONIBLES (presets)
 * ------------------------------------
 * 'today'          → Hoy
 * 'yesterday'      → Ayer
 * 'last7days'      → Últimos 7 días
 * 'last30days'     → Últimos 30 días
 * 'last90days'     → Últimos 90 días
 * 'currentMonth'   → Mes actual
 * 'lastMonth'      → Mes anterior
 * 'last3Months'    → Últimos 3 meses
 * 'last6Months'    → Últimos 6 meses
 * 'currentYear'    → Año actual
 */

/**
 * EJEMPLOS DE USO
 * ------------------------------------
 */

// Ejemplo básico
<DateRangePicker 
  dateRange={dateRange}
  onChange={setDateRange}
  defaultPreset="lastMonth"
/>

// Solo últimos días
<DateRangePicker 
  dateRange={dateRange}
  onChange={setDateRange}
  presets={['last7days', 'last30days', 'last90days']}
  defaultPreset="last30days"
/>

// Meses completos
<DateRangePicker 
  dateRange={dateRange}
  onChange={setDateRange}
  presets={['currentMonth', 'lastMonth', 'last3Months', 'last6Months']}
  defaultPreset="currentMonth"
/>

// Vista compacta sin título
<DateRangePicker 
  dateRange={dateRange}
  onChange={setDateRange}
  presets={['last7days', 'last30days']}
  defaultPreset="last7days"
  showTitle={false}
  buttonStyle="compact"
/>

// Solo botones, sin inputs manuales
<DateRangePicker 
  dateRange={dateRange}
  onChange={setDateRange}
  presets={['today', 'yesterday', 'last7days', 'currentMonth']}
  defaultPreset="today"
  showManualInputs={false}
/>

/**
 * ESTADO INICIAL (siempre va junto con defaultPreset)
 * ------------------------------------
 */
const [dateRange, setDateRange] = useState<DateRange>(
  PRESET_BUTTONS.lastMonth.getRange() // ← Debe coincidir con defaultPreset
);

/**
 * IMPORTS NECESARIOS
 * ------------------------------------
 */
import DateRangePicker from '@/components/DateRangePicker';
import { PRESET_BUTTONS, type DateRange } from '@/utils/timeFilter/dateRangeUtils';