import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { RegisterOpenData, RegisterCloseData } from "./registerType";

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllRegisters",
  "RegisterGetById",
  "RegisterInfoByDate",
  "existOpenRegister"
];

// ---- Funciones que llaman al backend ---- //
const openRegister = async (formData: RegisterOpenData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post("/api/v1/register/open", formData, {
    withCredentials: true,
  });

  // ⚠️ Si el backend responde con status: false, forzamos que se trate como error
  if (!data.status) {
    throw {
      response: {
        data, // estructura que getApiError espera
      },
    };
  }

  return data;
};

const closeRegister = async (formData: RegisterCloseData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post("/api/v1/register/close", formData, {
    withCredentials: true,
  });

  if (!data.status) {
    throw {
      response: {
        data,
      },
    };
  }

  return data;
};

// ---- Hook personalizado ---- //
export const useRegisterMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para abrir registro
  const openMutation = useMutation({
    mutationFn: openRegister,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Registro abierto:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      console.error("Error al abrir registro:", apiError?.message);
    },
  });

  // Mutación para cerrar registro
  const closeMutation = useMutation({
    mutationFn: closeRegister,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Registro cerrado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      console.error("Error al cerrar registro:", apiError?.message);
    },
  });

  return {
    // Funciones de mutación
    openRegister: openMutation.mutate,
    closeRegister: closeMutation.mutate,

    // Estados de loading
    isOpening: openMutation.isPending,
    isClosing: closeMutation.isPending,

    // Estados de éxito
    isOpened: openMutation.isSuccess,
    isClosed: closeMutation.isSuccess,

    // Errores crudos de React Query
    openError: openMutation.error,
    closeError: closeMutation.error,

    // Funciones para resetear estados
    resetOpenState: openMutation.reset,
    resetCloseState: closeMutation.reset,

    // Acceso directo a las mutaciones completas
    openMutation,
    closeMutation,
  };
};
