// components/DateRangePicker.tsx

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import {
  getPresetButtons,
  PRESET_BUTTONS,
  type DateRange,
  type DateRangePreset
} from '@/utils/timeFilter/dateRangeUtils';

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  defaultPreset?: DateRangePreset;
  showManualInputs?: boolean;
  showTitle?: boolean;
  className?: string;
  buttonStyle?: 'default' | 'compact';
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onChange,
  presets = ['last7days', 'last30days', 'currentMonth', 'lastMonth'],
  defaultPreset,
  showManualInputs = true,
  showTitle = true,
  className = '',
  buttonStyle = 'default'
}) => {
  const buttons = getPresetButtons(presets);
  const [activePreset, setActivePreset] = useState<DateRangePreset | null>(defaultPreset || null);

  // Detectar si el rango actual coincide con algún preset
  useEffect(() => {
    const matchingPreset = presets.find(preset => {
      const presetRange = PRESET_BUTTONS[preset].getRange();
      return presetRange.from === dateRange.from && presetRange.to === dateRange.to;
    });
    setActivePreset(matchingPreset || null);
  }, [dateRange, presets]);

  const handlePresetClick = (preset: DateRangePreset) => {
    const newRange = PRESET_BUTTONS[preset].getRange();
    setActivePreset(preset);
    onChange(newRange);
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setActivePreset(null); // Desactivar preset cuando se edita manualmente
    onChange({
      ...dateRange,
      [field]: value
    });
  };

  const buttonClasses = buttonStyle === 'compact'
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-1.5 text-sm';

  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-medium">Rango de Fechas</h3>
        </div>
      )}

      {buttons.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {buttons.map(button => (
            <button
              key={button.id}
              onClick={() => handlePresetClick(button.id)}
              className={`${buttonClasses} rounded-md transition-colors ${
                activePreset === button.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      )}

      {showManualInputs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Fecha desde
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Fecha hasta
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;