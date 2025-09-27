import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { IncomeSportCourtCreateData } from "./IncomeSportCourtTypes";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllIncomeSportsCourt",
  "IncomeSportCourtGetById", 
  // Agrega aquí otros query keys relacionados según sea necesario
];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para crear IncomeSportCourt
const createIncomeSportCourt = async (formData: IncomeSportCourtCreateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/income_sport_court/create",
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar IncomeSportCourt
const deleteIncomeSportCourt = async (id: number): Promise<void> => {
  await apiClubNorte.delete(
    `/api/v1/income-sport-court/delete/${id}`,
    { withCredentials: true }
  );
};

export const useIncomeSportCourtMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: createIncomeSportCourt,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("IncomeSportCourt creado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear IncomeSportCourt:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteIncomeSportCourt,
    onSuccess: async () => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("IncomeSportCourt eliminado");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar IncomeSportCourt:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  return {
    // Funciones de mutación
    createIncomeSportCourt: createMutation.mutate,
    deleteIncomeSportCourt: deleteMutation.mutate,
    
    // Estados de loading
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Estados de éxito
    isCreated: createMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,
    
    // Errores
    createError: createMutation.error,
    deleteError: deleteMutation.error,
    
    // Funciones de reset (para limpiar estados)
    resetCreateState: createMutation.reset,
    resetDeleteState: deleteMutation.reset,
    
    // Mutaciones completas (por si necesitas más control)
    createMutation,
    deleteMutation,
  };
};