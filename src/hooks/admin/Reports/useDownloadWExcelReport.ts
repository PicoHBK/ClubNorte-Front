import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { format } from "date-fns";

interface DownloadExcelParams {
  startDate: string; // formato: "YYYY-MM-DD"
  endDate: string;   // formato: "YYYY-MM-DD"
}

const downloadExcelReport = async ({ startDate, endDate }: DownloadExcelParams): Promise<Blob> => {
  // Formatear las fechas al formato requerido por la API (2006-01-02)
  const formattedStart = format(new Date(startDate), "yyyy-MM-dd");
  const formattedEnd = format(new Date(endDate), "yyyy-MM-dd");

  const response = await apiClubNorte.get("/api/v1/report/get_excel", {
    params: {
      start: formattedStart,
      end: formattedEnd,
    },
    responseType: "blob", // Importante para descargar archivos
    withCredentials: true, // Enviar cookies
  });

  return response.data;
};

export const useDownloadExcelReport = () => {
  return useMutation({
    mutationFn: downloadExcelReport,
    onSuccess: (blob, variables) => {
      try {
        // Crear un URL temporal para el blob
        const url = window.URL.createObjectURL(blob);
        
        // Crear un elemento <a> temporal para iniciar la descarga
        const link = document.createElement("a");
        link.href = url;
        
        // Nombre del archivo con las fechas
        const fileName = `reporte_${variables.startDate}_${variables.endDate}.xlsx`;
        link.setAttribute("download", fileName);
        
        // Agregar al DOM temporalmente (necesario para algunos navegadores)
        link.style.display = "none";
        document.body.appendChild(link);
        
        // Simular el click
        link.click();
        
        // Limpiar después de un pequeño delay para asegurar que la descarga inicie
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error("Error al descargar el archivo:", error);
        
        // Fallback: abrir en nueva pestaña si la descarga falla
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    },
    onError: (error) => {
      console.error("Error en la petición:", error);
    },
  });
};