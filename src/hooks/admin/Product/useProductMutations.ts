import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllProducts",
  "ProductGetById",
  "searchProductsByName",
  "searchProductsByCode",
  "ProductsGetByCategory",
];

interface ProductUpdateData {
  category_id: number;
  code: string;
  description: string;
  name: string;
  price: number;
}

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para actualizar producto
const updateProduct = async (id: number, formData: ProductUpdateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    `/api/v1/product/update`,
    {
      id: id,
      category_id: formData.category_id,
      code: formData.code,
      description: formData.description,
      name: formData.name,
      price: formData.price
    },
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar producto
const deleteProduct = async (id: number): Promise<void> => {
  await apiClubNorte.delete(
    `/api/v1/product/delete/${id}`,
    { withCredentials: true }
  );
};

export const useProductMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdateData }) =>
      updateProduct(id, data),
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Producto actualizado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar producto:", errorMessage);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      alert("✅ Producto eliminado con éxito");
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Producto eliminado");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar producto:", errorMessage);
    },
  });

  return {
    // Funciones de mutación
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    
    // Estados de loading
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Estados de éxito
    isUpdated: updateMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,
    
    // Errores
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Funciones de reset (para limpiar estados)
    resetUpdateState: updateMutation.reset,
    resetDeleteState: deleteMutation.reset,
    
    // Mutaciones completas (por si necesitas más control)
    updateMutation,
    deleteMutation,
  };
};