import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import { useSearchProductsPointSaleByCode } from '@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByCode';

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface ProductSearchByCodeProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts?: Product[];
  placeholder?: string;
  className?: string;
}

export default function ProductSearchByCode({
  value,
  onChange,
  onProductSelect,
  selectedProducts = [],
  placeholder = "Buscar por código...",
  className = ""
}: ProductSearchByCodeProps) {
  const [showResults, setShowResults] = useState(false);
  const [isBarcodeScan, setIsBarcodeScan] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(false);
  
  // Referencias para detectar pistola de código de barras
  const inputRef = useRef<HTMLInputElement>(null);
  const scanStartTime = useRef<number>(0);
  const scanBuffer = useRef<string>('');
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce para la búsqueda
  const debouncedSearchTerm = useDebounce(value, 300);

  // Hook de búsqueda por código
  const { 
    productsData: codeProductsData, 
    isLoading: isSearchingByCode, 
    isError: hasCodeSearchError,
    error: codeSearchError 
  } = useSearchProductsPointSaleByCode(debouncedSearchTerm);

  // Memoizar searchResults para evitar recreación en cada render
  const searchResults = useMemo(() => {
    return codeProductsData.products || [];
  }, [codeProductsData.products]);

  const isSearching = isSearchingByCode;
  const hasSearchError = hasCodeSearchError;
  const searchError = codeSearchError;

  // Validar si el producto ya está seleccionado
  const isProductAlreadySelected = useCallback((product: Product) => {
    return selectedProducts.some(selected => selected.id === product.id);
  }, [selectedProducts]);

  // Seleccionar producto
  const handleProductSelect = useCallback((product: Product) => {
    // Validación de duplicados
    if (isProductAlreadySelected(product)) {
      return;
    }

    // Validación de stock
    if (product.stock <= 0) {
      return;
    }

    onProductSelect(product);
    onChange(''); // Limpiar el input
    setShowResults(false);
    
    // Restaurar focus después de seleccionar producto
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [onProductSelect, onChange, isProductAlreadySelected]);

  // Detectar pistola de código de barras
  const detectBarcodeScanner = useCallback((inputValue: string, isEnterPressed: boolean = false) => {
    const currentTime = Date.now();
    const typingSpeed = currentTime - scanStartTime.current;
    const isRapidTyping = typingSpeed < 100; // Menos de 100ms por carácter
    const isCompleteCode = inputValue.length >= 4; // Códigos mínimo 4 caracteres
    
    // Detectar si es pistola: tipeo rápido + Enter o tipeo muy rápido en general
    const isBarcodeInput = (isRapidTyping && isEnterPressed) || 
                          (inputValue.length > 6 && typingSpeed < 50);
    
    if (isBarcodeInput && isCompleteCode) {
      setIsBarcodeScan(true);
      setScanFeedback(true);
      
      // Resetear feedback después de un tiempo
      setTimeout(() => {
        setScanFeedback(false);
      }, 500);
      
      // Resetear después de un tiempo
      setTimeout(() => {
        setIsBarcodeScan(false);
      }, 2000);
    }
  }, []); // Sin dependencias porque solo maneja estados locales

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = useCallback((inputValue: string) => {
    const currentTime = Date.now();
    
    // Si es el primer carácter, registrar tiempo de inicio
    if (inputValue.length === 1) {
      scanStartTime.current = currentTime;
    }
    
    scanBuffer.current = inputValue;
    onChange(inputValue);
    setShowResults(inputValue.length > 0);
    setIsBarcodeScan(false); // Reset mientras tipea
    
    // Limpiar timeout previo
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
    }
    
    // Detectar pistola después de un breve delay
    scanTimeout.current = setTimeout(() => {
      detectBarcodeScanner(inputValue);
    }, 50);
  }, [onChange, detectBarcodeScanner]);

  // Manejar Enter (común en pistolas de código de barras)
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length > 0) {
      e.preventDefault();
      detectBarcodeScanner(value, true);
      
      // Si hay resultados, seleccionar el primero si es único
      if (searchResults.length === 1 && !isProductAlreadySelected(searchResults[0]) && searchResults[0].stock > 0) {
        handleProductSelect(searchResults[0]);
        
        // Mantener focus después de seleccionar producto
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } else {
        // Mantener focus si no se selecciona nada
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 50);
      }
    }
  }, [value, searchResults, detectBarcodeScanner, handleProductSelect, isProductAlreadySelected]);

  // Auto-focus cuando el componente se monta o cuando se cambia a este modo
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); // Solo se ejecuta cuando el componente se monta

  // Auto-selección cuando hay un único resultado válido después de búsqueda por pistola
  useEffect(() => {
    if (isBarcodeScan && searchResults.length === 1 && !isSearching && debouncedSearchTerm) {
      const product = searchResults[0];
      if (!isProductAlreadySelected(product) && product.stock > 0) {
        // Delay para feedback visual antes de auto-seleccionar
        const timer = setTimeout(() => {
          handleProductSelect(product);
          // Focus se mantendrá gracias al setTimeout en handleProductSelect
        }, 800);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isBarcodeScan, searchResults, isSearching, debouncedSearchTerm, handleProductSelect, isProductAlreadySelected]);

  const shouldShowResults = showResults && value.length > 0 && !isSearching;

  return (
    <div className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        {/* Indicador de escaneo con pistola */}
        {scanFeedback && (
          <div className="absolute -top-8 left-0 right-0 flex items-center justify-center">
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
              <Zap className="w-3 h-3" />
              Código escaneado
            </div>
          </div>
        )}
        
        {isSearching ? (
          <Loader2 className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
        ) : (
          <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2">
            {isBarcodeScan ? (
              <Zap className="text-green-400 w-4 h-4" />
            ) : (
              <Search className="text-slate-400 w-4 h-4" />
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2 text-white placeholder-slate-400 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all ${
            isBarcodeScan 
              ? 'bg-green-900 border-green-600 ring-2 ring-green-400' 
              : 'bg-slate-800 border-slate-700'
          }`}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {/* Dropdown de resultados */}
      {shouldShowResults && (
        <div className={`absolute z-20 w-full mt-1 border rounded-lg shadow-2xl max-h-48 sm:max-h-56 overflow-y-auto transition-all ${
          isBarcodeScan 
            ? 'bg-green-900 border-green-600' 
            : 'bg-slate-800 border-slate-700'
        }`}>
          {hasSearchError ? (
            <div className="p-3 sm:p-4 text-red-400 text-center text-sm">
              Error: {searchError?.message || 'Error al buscar productos'}
            </div>
          ) : searchResults.length === 0 && debouncedSearchTerm ? (
            <div className="p-3 sm:p-4 text-slate-400 text-center text-sm">
              No se encontró producto con código "{debouncedSearchTerm}"
              {isBarcodeScan && (
                <div className="mt-1 text-xs text-yellow-400">
                  Código escaneado - Verifique el código de barras
                </div>
              )}
            </div>
          ) : (
            searchResults.map((product) => {
              const isAlreadySelected = isProductAlreadySelected(product);
              const hasNoStock = product.stock <= 0;
              const isDisabled = isAlreadySelected || hasNoStock;
              const isUniqueResult = searchResults.length === 1 && isBarcodeScan;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductSelect(product)}
                  disabled={isDisabled}
                  className={`w-full text-left px-3 sm:px-4 py-3 sm:py-2 border-b last:border-b-0 transition-colors touch-manipulation ${
                    isBarcodeScan 
                      ? 'border-green-700' 
                      : 'border-slate-700'
                  } ${
                    isDisabled
                      ? 'cursor-not-allowed opacity-50' + (isBarcodeScan ? ' bg-green-950' : ' bg-slate-900')
                      : (isBarcodeScan 
                          ? 'hover:bg-green-800 active:bg-green-700 text-white' + (isUniqueResult ? ' bg-green-800' : '')
                          : 'hover:bg-slate-700 active:bg-slate-600 text-white')
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm sm:text-base truncate">{product.name}</div>
                        {isUniqueResult && !isDisabled && (
                          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full flex-shrink-0 animate-pulse">
                            Auto-seleccionar
                          </span>
                        )}
                        {isAlreadySelected && (
                          <span className="px-2 py-1 text-xs bg-yellow-900 text-yellow-300 rounded-full flex-shrink-0">
                            Ya agregado
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs text-slate-400 mt-1 sm:mt-0">
                        <span>Código: {product.code}</span>
                        <span>Categoría: {product.category.name}</span>
                        <span className={`${hasNoStock ? 'text-red-400' : 'text-slate-500'}`}>
                          Stock: {product.stock} {hasNoStock ? '(Sin stock)' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-start sm:self-center">
                      <span className="text-emerald-400 font-semibold text-base sm:text-sm">${product.price.toFixed(2)}</span>
                    </div>
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