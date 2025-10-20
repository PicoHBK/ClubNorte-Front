// Para crear un expense (POST request)
export interface ExpenseCreateData {
  description: string;
  payment_method: "efectivo" | "tarjeta" | "transferencia";
  total: number;
}

// Usuario asociado al expense
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  cellphone: string;
  email: string;
  username: string;
}

// Para el expense completo (GET response)
export interface Expense {
  id: number;
  user: User;
  total: number;
  payment_method: "efectivo" | "tarjeta" | "transferencia";
  created_at: string;
}

// Para el detalle completo del expense (GET response detallada)
export interface ExpenseDetails {
  id: number;
  user: User;
  register_id: number;
  description: string | null;
  total: number;
  payment_method: "efectivo" | "tarjeta" | "transferencia";
  created_at: string;
}