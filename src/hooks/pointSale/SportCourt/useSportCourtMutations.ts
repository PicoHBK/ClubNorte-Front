import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { SportCourtCreateData, SportCourtUpdateData } from "./SportCourt";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "SportCourtGetByPointSale",
  "SportCourtGetById", 
  "searchSportCourtsByName",
  "searchSportCourtsByCode",
];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para crear cancha deportiva
const createSportCourt = async (formData: SportCourtCreateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/sport_court/create",
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para actualizar cancha deportiva
const updateSportCourt = async (id: number, formData: SportCourtUpdateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    `/api/v1/sport_court/update`,
    {
      id: id,
      code: formData.code,
      description: formData.description,
      name: formData.name
    },
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar cancha deportiva
const deleteSportCourt = async (id: number): Promise<void> => {
  await apiClubNorte.delete(
    `/api/v1/sport_court/delete/${id}`,
    { withCredentials: true }
  );
};

export const useSportCourtMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: createSportCourt,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Cancha deportiva creada:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear cancha deportiva:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SportCourtUpdateData }) =>
      updateSportCourt(id, data),
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Cancha deportiva actualizada:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar cancha deportiva:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteSportCourt,
    onSuccess: async () => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Cancha deportiva eliminada");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar cancha deportiva:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  return {
    // Funciones de mutación
    createSportCourt: createMutation.mutate,
    updateSportCourt: updateMutation.mutate,
    deleteSportCourt: deleteMutation.mutate,
    
    // Estados de loading
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Estados de éxito
    isCreated: createMutation.isSuccess,
    isUpdated: updateMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,
    
    // Errores
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Funciones de reset (para limpiar estados)
    resetCreateState: createMutation.reset,
    resetUpdateState: updateMutation.reset,
    resetDeleteState: deleteMutation.reset,
    
    // Mutaciones completas (por si necesitas más control)
    createMutation,
    updateMutation,
    deleteMutation,
  };
};