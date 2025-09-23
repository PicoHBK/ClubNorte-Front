import { useState, useCallback } from 'react';
import { Scan, Type } from 'lucide-react';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import ProductSearchByCode from './ProductSearchByCode';
import ProductSearchByName from './ProductSearchByName';

type SearchMode = 'code' | 'name';

interface ProductSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts?: Product[];
  placeholder?: string;
  className?: string;
  disabled?: boolean; // ✅ Nueva prop
}

export default function ProductSearchInput({
  value,
  onChange,
  onProductSelect,
  selectedProducts = [],
  placeholder,
  className = "",
  disabled = false // ✅ Nueva prop con default
}: ProductSearchInputProps) {
  const [mode, setMode] = useState<SearchMode>('code');

  // Placeholders dinámicos
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return mode === 'code' ? "Código..." : "Nombre...";
  };

  // Cambiar modo de búsqueda
  const handleModeChange = useCallback((newMode: SearchMode) => {
    if (disabled) return; // ✅ No permitir cambios si está disabled
    
    setMode(newMode);
    onChange('');
    // Auto-focus
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input && !disabled) input.focus(); // ✅ No hacer focus si está disabled
    }, 100);
  }, [onChange, disabled]);

  // Wrappear onChange y onProductSelect para deshabilitar funcionalidad
  const handleChange = useCallback((value: string) => {
    if (disabled) return;
    onChange(value);
  }, [onChange, disabled]);

  const handleProductSelect = useCallback((product: Product) => {
    if (disabled) return;
    onProductSelect(product);
  }, [onProductSelect, disabled]);

  return (
    <div className={`relative ${className} ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      {/* Tabs compactos */}
      <div className="flex mb-3 bg-slate-900 rounded-lg p-1">
        <button
          type="button"
          onClick={() => handleModeChange('code')}
          disabled={disabled} // ✅ Pasar disabled
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            mode === 'code'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800 disabled:hover:bg-slate-900 disabled:hover:text-slate-400'
          }`}
        >
          <Scan className="w-4 h-4" />
          Código
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('name')}
          disabled={disabled} // ✅ Pasar disabled
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            mode === 'name'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800 disabled:hover:bg-slate-900 disabled:hover:text-slate-400'
          }`}
        >
          <Type className="w-4 h-4" />
          Nombre
        </button>
      </div>

      {/* Componente activo */}
      {mode === 'code' ? (
        <ProductSearchByCode
          value={value}
          onChange={handleChange}
          onProductSelect={handleProductSelect}
          selectedProducts={selectedProducts}
          placeholder={getPlaceholder()}
          className=""
        />
      ) : (
        <ProductSearchByName
          value={value}
          onChange={handleChange}
          onProductSelect={handleProductSelect}
          selectedProducts={selectedProducts}
          placeholder={getPlaceholder()}
          className=""
        />
      )}
    </div>
  );
}