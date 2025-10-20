import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, Package, DollarSign, Hash } from 'lucide-react';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import { useSearchProductsPointSaleByCode } from '@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByCode';

interface ProductSearchByCodeManualProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts?: Product[];
  placeholder?: string;
  className?: string;
  debounceDelay?: number;
}

export default function ProductSearchByCodeManual({
  value,
  onChange,
  onProductSelect,
  selectedProducts = [],
  placeholder = "Buscar por código...",
  className = "",
  debounceDelay = 500
}: ProductSearchByCodeManualProps) {
  const [showResults, setShowResults] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setDebouncedValue('');
      setShowResults(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedValue(value.trim());
      setShowResults(true);
    }, debounceDelay);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, debounceDelay]);

  // Hook de búsqueda
  const { 
    productsData, 
    isLoading, 
  } = useSearchProductsPointSaleByCode(debouncedValue);

  const searchResult = useMemo(() => {
    return productsData.products?.[0] || null;
  }, [productsData.products]);

  // Validar si ya está seleccionado
  const isProductAlreadySelected = useCallback((product: Product) => {
    return selectedProducts.some(selected => selected.id === product.id);
  }, [selectedProducts]);

  // Seleccionar producto
  const handleProductSelect = useCallback((product: Product) => {
    if (product.stock <= 0 || isProductAlreadySelected(product)) return;
    
    onProductSelect(product);
    onChange('');
    setShowResults(false);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [onProductSelect, onChange, isProductAlreadySelected]);

  // Manejar input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Manejar Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResult && searchResult.stock > 0 && !isProductAlreadySelected(searchResult)) {
      e.preventDefault();
      handleProductSelect(searchResult);
    }
    
    if (e.key === 'Escape') {
      setShowResults(false);
      onChange('');
    }
  }, [searchResult, handleProductSelect, onChange, isProductAlreadySelected]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const shouldShowResults = showResults && debouncedValue.length > 0;
  const isSearching = isLoading || (value.length > 0 && debouncedValue !== value);

  return (
    <div className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (debouncedValue.length > 0) {
              setShowResults(true);
            }
          }}
          className="w-full pl-11 pr-4 py-3 bg-slate-800 text-white placeholder-slate-400 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {/* Dropdown de resultado */}
      {shouldShowResults && !isSearching && (
        <div 
          ref={resultsRef}
          className="absolute z-20 w-full mt-2 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden"
        >
          {!searchResult ? (
            <div className="p-4 text-center">
              <div className="text-slate-400 font-medium">No se encontró el producto</div>
              <div className="text-slate-500 text-sm mt-1">Código: {debouncedValue}</div>
            </div>
          ) : (
            <div>
              {/* Producto encontrado */}
              <button
                type="button"
                onClick={() => handleProductSelect(searchResult)}
                disabled={searchResult.stock <= 0 || isProductAlreadySelected(searchResult)}
                className={`w-full p-4 text-left transition-colors ${
                  searchResult.stock <= 0 || isProductAlreadySelected(searchResult)
                    ? 'cursor-not-allowed opacity-50 bg-slate-800'
                    : 'hover:bg-slate-700 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icono */}
                  <div className={`rounded-lg p-2 ${
                    searchResult.stock <= 0 
                      ? 'bg-red-500/10' 
                      : isProductAlreadySelected(searchResult)
                      ? 'bg-orange-500/10'
                      : 'bg-indigo-500/10'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      searchResult.stock <= 0 
                        ? 'text-red-400' 
                        : isProductAlreadySelected(searchResult)
                        ? 'text-orange-400'
                        : 'text-indigo-400'
                    }`} />
                  </div>

                  {/* Info del producto */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-base">{searchResult.name}</div>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <Hash className="w-4 h-4" />
                        <span>{searchResult.code}</span>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 text-sm font-medium ${
                        searchResult.stock <= 0 ? 'text-red-400' : 'text-slate-300'
                      }`}>
                        <Package className="w-4 h-4" />
                        <span>Stock: {searchResult.stock}</span>
                      </div>
                    </div>

                    {/* Estados */}
                    {searchResult.stock <= 0 && (
                      <div className="mt-2 text-red-400 text-xs font-medium">
                        ⚠ Sin stock disponible
                      </div>
                    )}
                    {isProductAlreadySelected(searchResult) && searchResult.stock > 0 && (
                      <div className="mt-2 text-orange-400 text-xs font-medium">
                        ⚠ Ya está en la lista
                      </div>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-lg">
                    <DollarSign className="w-5 h-5" />
                    <span>{searchResult.price.toFixed(2)}</span>
                  </div>
                </div>
              </button>

              {/* Hint */}
              {searchResult.stock > 0 && !isProductAlreadySelected(searchResult) && (
                <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700">
                  <div className="text-slate-400 text-xs text-center">
                    Presiona <span className="text-white font-semibold">Enter</span> para agregar
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}