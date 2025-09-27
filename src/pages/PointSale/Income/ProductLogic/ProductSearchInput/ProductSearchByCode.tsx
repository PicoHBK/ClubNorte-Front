import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import { useSearchProductsPointSaleByCode } from '@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByCode';

interface ProductSearchByCodeProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts?: Product[];
  placeholder?: string;
  className?: string;
  debounceDelay?: number;
}

export default function ProductSearchByCode({
  value,
  onChange,
  onProductSelect,
  selectedProducts = [],
  placeholder = "Escanear código de barras...",
  className = "",
  debounceDelay = 50
}: ProductSearchByCodeProps) {
  const [showResults, setShowResults] = useState(false);
  const [inputState, setInputState] = useState<'normal' | 'success' | 'error' | 'duplicate'>('normal');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Resetear solo input pero mantener estado visual
  const resetInputOnly = useCallback(() => {
    onChange('');
    setShowResults(false);
    setDebouncedValue('');
    setIsDebouncing(false);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  }, [onChange]);

  // Debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setDebouncedValue('');
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    debounceTimer.current = setTimeout(() => {
      setDebouncedValue(value.trim());
      setIsDebouncing(false);
    }, debounceDelay);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, debounceDelay]);

  // Hook de búsqueda
  const { 
    productsData: codeProductsData, 
    isLoading: isSearchingByCode, 
    isError: hasCodeSearchError
  } = useSearchProductsPointSaleByCode(debouncedValue);

  // Memoizar searchResults
  const searchResults = useMemo(() => {
    return codeProductsData.products || [];
  }, [codeProductsData.products]);

  // Validar si ya está seleccionado
  const isProductAlreadySelected = useCallback((product: Product) => {
    return selectedProducts.some(selected => selected.id === product.id);
  }, [selectedProducts]);

  // Seleccionar producto
  const handleProductSelect = useCallback((product: Product) => {
    if (product.stock <= 0) return;

    if (isProductAlreadySelected(product)) {
      // Duplicado: cambiar color y resetear input, mantener color
      setInputState('duplicate');
      resetInputOnly();
      return;
    }

    // Éxito: cambiar color, agregar producto y resetear input
    setInputState('success');
    onProductSelect(product);
    resetInputOnly();
  }, [onProductSelect, isProductAlreadySelected, resetInputOnly]);

  // Manejar input - resetear estado visual al escribir nuevo
  const handleScannerInput = useCallback((inputValue: string) => {
    onChange(inputValue);
    
    // Al empezar a escribir, volver a estado normal
    if (inputValue.length > 0) {
      setInputState('normal');
      setShowResults(true);
    } else {
      setShowResults(false);
      // NO resetear estado visual al vaciar, solo al escribir nuevo
    }
  }, [onChange]);

  // Manejar blur - resetear estado visual al perder focus
  const handleBlur = useCallback(() => {
    setInputState('normal');
  }, []);

  // Manejar focus - asegurar que el estado se mantiene
  const handleFocus = useCallback(() => {
    // Solo resetear si el input está vacío
    if (!value.length) {
      setInputState('normal');
    }
  }, [value]);

  // Manejar Enter de la pistola escáner
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      if (value.length > 0) {
        if (searchResults.length > 0) {
          handleProductSelect(searchResults[0]);
        } else if (!isSearchingByCode && !isDebouncing && debouncedValue) {
          // Error: no encontrado
          setInputState('error');
          resetInputOnly();
        }
      }
    }
  }, [value, searchResults, handleProductSelect, isSearchingByCode, isDebouncing, debouncedValue, resetInputOnly]);

  // Focus inteligente - solo si no hay otros inputs activos
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        // Solo hacer focus si:
        // 1. No hay ningún elemento con focus actualmente, O
        // 2. El elemento con focus es el body (sin focus específico), O  
        // 3. El elemento con focus ya es este input
        const activeElement = document.activeElement;
        const shouldFocus = !activeElement || 
                          activeElement === document.body || 
                          activeElement === inputRef.current;
        
        if (shouldFocus) {
          inputRef.current.focus();
        }
      }
    };
    
    // Focus inicial inmediato
    focusInput();
    
    // Focus periódico más inteligente
    const focusInterval = setInterval(() => {
      // Solo continuar el auto-focus si no hay modales/dialogs abiertos
      const hasOpenModal = document.querySelector('[role="dialog"]') !== null ||
                          document.querySelector('.modal') !== null ||
                          document.querySelector('[data-state="open"]') !== null;
      
      if (!hasOpenModal) {
        focusInput();
      }
    }, 200); // Aumentamos el intervalo para ser menos agresivo
    
    return () => clearInterval(focusInterval);
  }, []);

  // Error - cambiar estado y resetear
  useEffect(() => {
    if (hasCodeSearchError && debouncedValue.trim()) {
      setInputState('error');
      resetInputOnly();
    }
  }, [hasCodeSearchError, debouncedValue, resetInputOnly]);

  // Auto-selección inmediata
  useEffect(() => {
    if (searchResults.length === 1 && !isSearchingByCode && !isDebouncing && debouncedValue && !hasCodeSearchError) {
      const product = searchResults[0];
      if (product.stock > 0) {
        handleProductSelect(product);
      }
    }
  }, [searchResults, isSearchingByCode, isDebouncing, debouncedValue, handleProductSelect, hasCodeSearchError]);

  const shouldShowResults = showResults && value.length > 0 && debouncedValue.length > 0 && !isSearchingByCode && !isDebouncing;
  const isLoading = isSearchingByCode || isDebouncing;

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Placeholder dinámico basado en el estado
  const getDynamicPlaceholder = () => {
    switch (inputState) {
      case 'success':
        return '✅ Producto agregado - Escanear siguiente...';
      case 'error':
        return '❌ Error - Producto no encontrado';
      case 'duplicate':
        return '⚠️ Producto ya agregado - Escanear otro...';
      default:
        return placeholder;
    }
  };
  
  const getInputStyles = () => {
    switch (inputState) {
      case 'success':
        return 'bg-green-900 border-green-600 ring-2 ring-green-400';
      case 'error':
        return 'bg-red-900 border-red-600 ring-2 ring-red-400';
      case 'duplicate':
        return 'bg-orange-900 border-orange-600 ring-2 ring-orange-400';
      default:
        return 'bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {isLoading ? (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleScannerInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={`w-full pl-10 pr-4 py-2.5 text-white placeholder-slate-300 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all ${getInputStyles()}`}
          placeholder={getDynamicPlaceholder()}
          autoComplete="off"
          autoFocus
        />
      </div>

      {/* Dropdown simple */}
      {shouldShowResults && (
        <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-56 overflow-y-auto">
          {hasCodeSearchError ? (
            <div className="p-4 text-red-400 text-center text-sm">Error</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-slate-400 text-center text-sm">No encontrado</div>
          ) : (
            searchResults.map((product) => {
              const hasNoStock = product.stock <= 0;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductSelect(product)}
                  disabled={hasNoStock}
                  className={`w-full text-left px-4 py-2 border-b border-slate-700 last:border-b-0 transition-colors ${
                    hasNoStock
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-slate-700 text-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>#{product.code}</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="text-emerald-400 font-semibold">${product.price.toFixed(2)}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}