import { useForm } from "react-hook-form";
import { useState } from "react";
import { NumericFormat } from "react-number-format";
import { useSearchProductsByName } from "@/hooks/admin/Product/useSearchProductsByName";
import { useSearchProductsByCode } from "@/hooks/admin/Product/useSearchProductsByCode";
import { useDebounce } from "@/hooks/generic/useDebounce";

interface ItemExpenseBuy {
  product_id: number;
  quantity: number;
  price: number;
}

interface ExpenseBuyCreate {
  description: string;
  payment_method: string;
  item_expense_buys: ItemExpenseBuy[];
}

type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

const FormCreateExpenseBuy = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseBuyCreate>();

  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [items, setItems] = useState<ItemExpenseBuy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchMode, setSearchMode] = useState<"name" | "code">("name");
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);

  // Aplicar debounce a ambos campos de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedSearchCode = useDebounce(searchCode, 500);

  // Hook para buscar productos por nombre
  const { products: productsByName, isLoading: isSearchingByName } = useSearchProductsByName(
    searchMode === "name" ? debouncedSearchTerm : ""
  );

  // Hook para buscar productos por código
  const { products: productsByCode, isLoading: isSearchingByCode } = useSearchProductsByCode(
    searchMode === "code" ? debouncedSearchCode : ""
  );

  // Productos actuales según modo de búsqueda
  const products = searchMode === "name" ? productsByName : productsByCode;
  const isSearching = searchMode === "name" ? isSearchingByName : isSearchingByCode;

  // Métodos de pago disponibles
  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: "efectivo", label: "Efectivo" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "transferencia", label: "Transferencia" },
  ];

  const handleAddProduct = (productId: number) => {
    // Verificar si ya está agregado
    const existingProduct = items.find(item => item.product_id === productId);
    if (existingProduct) {
      const product = products.find(p => p.id === productId);
      setDuplicateAlert(product?.name || "Este producto");
      setTimeout(() => setDuplicateAlert(null), 3000);
      return;
    }

    setItems([...items, {
      product_id: productId,
      quantity: 1,
      price: 0
    }]);
    setSearchTerm("");
    setSearchCode("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity || 0;
    setItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].price = price || 0;
    setItems(newItems);
  };

  const handleSearchModeChange = (mode: "name" | "code") => {
    setSearchMode(mode);
    setSearchTerm("");
    setSearchCode("");
  };

  const onSubmit = (data: ExpenseBuyCreate) => {
    const validItems = items.filter(item => item.quantity > 0 && item.price > 0);
    
    if (validItems.length === 0) {
      alert("Debes agregar al menos un producto con cantidad y precio");
      return;
    }

    const expenseBuyData: ExpenseBuyCreate = {
      ...data,
      item_expense_buys: validItems,
    };

    setIsCreating(true);
    // Simular creación
    setTimeout(() => {
      setIsCreating(false);
      setIsCreated(true);
      console.log("Compra registrada:", expenseBuyData);
    }, 1000);
  };

  const inputClass =
    "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isCreated) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-8 text-center">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Compra Registrada!</h2>
          <p className="text-slate-300 mb-6">La compra ha sido registrada exitosamente en el sistema.</p>
          <button
            onClick={() => {
              setIsCreated(false);
              reset();
              setItems([]);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-md transition"
          >
            Registrar Otra Compra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          Registrar Compra
        </h2>

        <div className="space-y-4">
          {/* Descripción y Método de Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-200 mb-1">
                Descripción
              </label>
              <textarea
                {...register("description", {
                  required: "La descripción es obligatoria",
                })}
                rows={3}
                className={inputClass}
                placeholder="Ej: Compra de mercadería para stock"
                disabled={isCreating}
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-200 mb-1">
                Método de Pago
              </label>
              <select
                {...register("payment_method", {
                  required: "El método de pago es obligatorio",
                })}
                className={inputClass}
                disabled={isCreating}
              >
                <option value="">Selecciona un método</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              {errors.payment_method && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.payment_method.message}
                </p>
              )}
            </div>
          </div>

          {/* Alerta de producto duplicado */}
          {duplicateAlert && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-center gap-3">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-yellow-200 text-sm font-medium">
                  Producto ya agregado
                </p>
                <p className="text-yellow-300/80 text-xs">
                  "{duplicateAlert}" ya está en la lista de compra
                </p>
              </div>
            </div>
          )}

          {/* Buscador de Productos */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-3">
              Buscar y Agregar Productos
            </h3>
            
            {/* Selector de modo de búsqueda */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleSearchModeChange("name")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  searchMode === "name"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                disabled={isCreating}
              >
                Buscar por Nombre
              </button>
              <button
                type="button"
                onClick={() => handleSearchModeChange("code")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  searchMode === "code"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                disabled={isCreating}
              >
                Buscar por Código
              </button>
            </div>

            <div>
              {searchMode === "name" ? (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={inputClass}
                  placeholder="Buscar por nombre..."
                  disabled={isCreating}
                />
              ) : (
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className={inputClass}
                  placeholder="Buscar por código..."
                  disabled={isCreating}
                />
              )}
              
              {/* Estado de carga */}
              {((searchMode === "name" && searchTerm) || (searchMode === "code" && searchCode)) && isSearching && (
                <div className="mt-2 bg-slate-700 rounded-md px-3 py-2">
                  <p className="text-slate-300 text-sm">Buscando...</p>
                </div>
              )}

              {/* Resultados de búsqueda */}
              {((searchMode === "name" && searchTerm) || (searchMode === "code" && searchCode)) && !isSearching && products.length > 0 && (
                <div className="mt-2 bg-slate-700 rounded-md max-h-48 overflow-y-auto">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProduct(product.id)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white text-sm border-b border-slate-600 last:border-b-0 transition"
                      disabled={isCreating}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-slate-400">
                        Código: {product.code} | Stock Depósito: {product.stock_deposit?.stock ?? 0} unidades
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {((searchMode === "name" && searchTerm) || (searchMode === "code" && searchCode)) && !isSearching && products.length === 0 && (
                <p className="text-slate-400 text-xs mt-2">
                  No se encontraron productos
                </p>
              )}
            </div>
          </div>

          {/* Tabla de Items Agregados */}
          {items.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-white mb-3">
                Productos Agregados ({items.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-300 border-b border-slate-600">
                      <th className="text-left py-2 px-2">Producto</th>
                      <th className="text-center py-2 px-2 w-32">Cantidad</th>
                      <th className="text-center py-2 px-2 w-40">Precio Unit.</th>
                      <th className="text-right py-2 px-2 w-32">Subtotal</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const product = products.find(p => p.id === item.product_id);
                      const subtotal = item.quantity * item.price;
                      
                      return (
                        <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="py-2 px-2 text-slate-200 text-sm">
                            <div className="font-medium">{product?.name || 'Producto no encontrado'}</div>
                            <div className="text-xs text-slate-400">
                              Stock: {product?.stock_deposit?.stock ?? 0}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <NumericFormat
                              value={item.quantity || ''}
                              onValueChange={(values) => {
                                updateItemQuantity(index, values.floatValue || 0);
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              allowNegative={false}
                              decimalScale={0}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="0"
                              disabled={isCreating}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <NumericFormat
                              value={item.price || ''}
                              onValueChange={(values) => {
                                updateItemPrice(index, values.floatValue || 0);
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix="$ "
                              allowNegative={false}
                              decimalScale={0}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="$ 0"
                              disabled={isCreating}
                            />
                          </td>
                          <td className="py-2 px-2 text-right text-slate-200 text-sm font-medium">
                            {subtotal > 0 ? `$${subtotal.toLocaleString('es-AR')}` : '-'}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-400 hover:text-red-300 font-bold text-lg"
                              disabled={isCreating}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-600">
                      <td colSpan={3} className="py-3 px-2 text-right text-slate-200 font-semibold">
                        Total:
                      </td>
                      <td colSpan={2} className="py-3 px-2 text-right text-indigo-400 font-bold text-lg">
                        ${total.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Botón de Envío */}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-md text-sm transition disabled:opacity-50"
            disabled={isCreating || items.length === 0}
          >
            {isCreating ? "Registrando..." : "Registrar Compra"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormCreateExpenseBuy;