// Para crear un registro de apertura
export interface RegisterOpenData {
  open_amount: number;
}

// Para crear un registro de cierre
export interface RegisterCloseData {
  close_amount: number;
}

// Para generar informe
export interface RegisterInformData {
  from_date: string;
  to_date: string;
}

export interface RegisterType {
  id: number;
  user_open: {
    id: number;
    first_name: string;
    last_name: string;
    address: string;
    cellphone: string;
    email: string;
    username: string;
  };
  open_amount: number;
  hour_open: string; // ISO date string
  user_close: {
    id: number;
    first_name: string;
    last_name: string;
    address: string;
    cellphone: string;
    email: string;
    username: string;
  } | null;
  close_amount: number | null;
  hour_close: string | null; // ISO date string
  total_income_cash: number;
  total_income_others: number;
  total_expense_cash: number;
  total_expense_others: number;
  is_close: boolean;
  created_at: string; // ISO date string
}
