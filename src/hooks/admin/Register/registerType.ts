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