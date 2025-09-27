// Tipo para crear un IncomeSportCourt
export interface IncomeSportCourtCreateData {
  date_play: string;
  partial_pay: number;
  partial_payment_method: "efectivo" | "tarjeta" | "transferencia";
  price: number;
  shift: "mañana" | "tarde" | "noche";
  sports_court_id: number;
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
  price: number;
  created_at: string;
}