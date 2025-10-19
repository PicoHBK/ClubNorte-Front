// Tipo para crear un IncomeSportCourt
export interface IncomeSportCourtCreateData {
  partial_pay: number;
  partial_payment_method: "efectivo" | "tarjeta" | "transferencia";
  price: number;
  sports_court_id: number;
  description?: string | null;
  date_play: string; // NUEVO - Fecha de juego
  shift?: string;    // NUEVO - Turno
}

// Tipo para la cancha deportiva
export interface SportsCourt {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Tipo para un IncomeSportCourt completo (respuesta de la API)
export interface IncomeSportCourt {
  id: number;
  description: string | null;
  partial_pay: number;
  partial_payment_method: "efectivo" | "tarjeta" | "transferencia";
  date_partial_pay: string;
  rest_pay: number | null;
  rest_payment_method: "efectivo" | "tarjeta" | "transferencia";
  date_rest_pay: string | null;
  date_play: string;        // NUEVO
  shift?: string;           // NUEVO
  sports_court: SportsCourt;
  price: number;
  created_at: string;
}

// Tipo para detalles extendidos (incluye usuario y es REQUERIDO)
export interface IncomeSportCourtDetails extends IncomeSportCourt {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    address: string;
    cellphone: string;
    email: string;
    username: string;
  };
}