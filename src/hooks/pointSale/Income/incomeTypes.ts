// Para crear un income (POST request)
export interface IncomeCreateData {
  description: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  payment_method: string;
}

// Para actualizar un income (PUT/PATCH request)
export interface IncomeUpdateData {
  id: number;
  description: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  payment_method: "efectivo" | "tarjeta" | "transferencia";
}

// Para crear items específicamente
export interface IncomeCreateItem {
  product_id: number;
  quantity: number;
}

////////////////////////

interface User {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  cellphone: string;
  email: string;
  username: string;
}

export interface Income {
  id: number;
  user: User;
  total: number;
  payment_method: "efectivo" | "tarjeta" | "transferencia";
  created_at: string; // Formato ISO con zona horaria
}

export interface IncomesResponse {
  incomes: Income[];
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface IncomeDetails {
  id: number;
  user: User;
  items: Array<{
    id: number;
    product: {
      id: number;
      code: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number; // precio unitario aplicado en este ingreso
    subtotal: number; // cantidad * precio
  }>;
  description: string;
  total: number;
  payment_method: "efectivo" | "tarjeta" | "transferencia";
  created_at: string; // ISO con zona horaria
}