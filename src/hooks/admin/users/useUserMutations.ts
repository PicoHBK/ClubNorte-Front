import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllUsers",
  "UserGetById", 
  "searchUsersByName",
  "searchUsersByEmail",
  "searchUsersByUsername",
  "UsersGetByRole",
];

interface UserUpdateData {
  address: string;
  cellphone: string;
  email: string;
  first_name: string;
  last_name: string;
  point_sales_ids: number[];
  role_id: number;
  username: string;
}

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para actualizar usuario
const updateUser = async (id: number, formData: UserUpdateData): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    `/api/v1/user/update`,
    {
      id: id,
      address: formData.address,
      cellphone: formData.cellphone,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      point_sales_ids: formData.point_sales_ids,
      role_id: formData.role_id,
      username: formData.username
    },
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar usuario
const deleteUser = async (id: number): Promise<void> => {
  await apiClubNorte.delete(
    `/api/v1/user/delete/${id}`,
    { withCredentials: true }
  );
};

export const useUserMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateData }) =>
      updateUser(id, data),
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Usuario actualizado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar usuario:", errorMessage);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      alert("✅ Usuario eliminado con éxito");
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Usuario eliminado");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar usuario:", errorMessage);
    },
  });

  return {
    // Funciones de mutación
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
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