import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { CategoryUpdateData } from "./categoryType";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = ["getAllCategories", "CategoryGetById"];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para actualizar categoría
const updateCategory = async (
  id: number,
  formData: CategoryUpdateData
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    `/api/v1/category/update`,
    { id: id, name: formData.name },
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar categoría
const deleteCategory = async (id: number): Promise<void> => {
  await apiClubNorte.delete(`/api/v1/category/delete/${id}`, {
    withCredentials: true,
  });
};

export const useCategoryMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdateData }) =>
      updateCategory(id, data),
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Categoría actualizada:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar categoría:", errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Categoría eliminada");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar categoría:", errorMessage);
    },
  });

  return {
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdated: updateMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    resetUpdateState: updateMutation.reset,
    resetDeleteState: deleteMutation.reset,
    updateMutation,
    deleteMutation,
  };
};
