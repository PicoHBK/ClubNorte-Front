// src/hooks/admin/Product/useSearchProductsByCode.ts
import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { Product } from "./productType";

// Nuevo tipo para respuesta de producto único
interface ApiSuccessResponseSingle<T> {
  status: boolean;
  body: T;
  message: string;
}

/**
 * Llamada a la API para buscar productos por código
 */
const searchProductsByCode = async (code: string): Promise<ApiSuccessResponseSingle<Product[]>> => {
  if (!code.trim()) {
    return {
      status: true,
      message: "Sin búsqueda",
      body: []
    };
  }

  // La API retorna un solo producto
  const response = await apiClubNorte.get<ApiSuccessResponseSingle<Product>>(
    `/api/v1/product/get_by_code?code=${encodeURIComponent(code)}`,
    { withCredentials: true }
  );

  // Convertir el producto único en array para mantener consistencia
  return {
    status: response.data.status,
    message: response.data.message,
    body: response.data.body ? [response.data.body] : []
  };
};

/**
 * Hook para buscar productos por código usando react-query
 * Configurado para pistola escáner - sin reintentos automáticos
 */
export const useSearchProductsByCode = (code: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["searchProductsByCode", code],
    queryFn: () => searchProductsByCode(code),
    enabled: !!code.trim(), // solo ejecuta si hay texto
    retry: false, // sin reintentos - para pistola escáner
    refetchOnWindowFocus: false, // evita refetch innecesarios
    refetchOnMount: false, // evita refetch al montar
  });

  const apiError = getApiError(error);

  return {
    products: data?.body ?? [],
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};