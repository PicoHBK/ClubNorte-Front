import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { IncomeSportCourtCreateData } from "./IncomeSportCourtTypes";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllIncomeSportsCourt",
  "IncomeSportCourtGetById",
  "getIncomesSportCourtByDate",
  // Agrega aquí otros query keys relacionados según sea necesario
];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Interface para la actualización de pago
interface UpdatePaymentData {
  id: number;
  rest_pay: number;
  rest_payment_method: "efectivo" | "tarjeta" | "transferencia";
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
    `/api/v1/income_sport_court/delete/${id}`,
    { withCredentials: true }
  );
};

// Función para actualizar el pago
const updateIncomeSportCourtPayment = async (paymentData: UpdatePaymentData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    "/api/v1/income_sport_court/update_pay",
    paymentData,
    { withCredentials: true }
  );
  return data;
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

  // Mutación para actualizar pago
  const updatePaymentMutation = useMutation({
    mutationFn: updateIncomeSportCourtPayment,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Pago actualizado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar pago:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  return {
    // Funciones de mutación
    createIncomeSportCourt: createMutation.mutate,
    deleteIncomeSportCourt: deleteMutation.mutate,
    updateIncomeSportCourtPayment: updatePaymentMutation.mutate,

    // Estados de loading
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingPayment: updatePaymentMutation.isPending,

    // Estados de éxito
    isCreated: createMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,
    isPaymentUpdated: updatePaymentMutation.isSuccess,

    // Errores
    createError: createMutation.error,
    deleteError: deleteMutation.error,
    updatePaymentError: updatePaymentMutation.error,

    // Funciones de reset (para limpiar estados)
    resetCreateState: createMutation.reset,
    resetDeleteState: deleteMutation.reset,
    resetUpdatePaymentState: updatePaymentMutation.reset,

    // Mutaciones completas (por si necesitas más control)
    createMutation,
    deleteMutation,
    updatePaymentMutation,
  };
};

// Exportar el tipo para usarlo en otros archivos
export type { UpdatePaymentData };