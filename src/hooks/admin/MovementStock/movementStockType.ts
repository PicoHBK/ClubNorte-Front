import type { User } from "../users/userType";

// Interfaz para el producto dentro de un movimiento
export interface MovementProduct {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
}

export interface Movement {
  id: number;
  user: User;
  product: MovementProduct;
  amount: number;
  from_id: number;
  from_type: "deposit" | "point_sale";
  to_id: number;
  to_type: "deposit" | "point_sale";
  ignore_stock: boolean;
  created_at: string;
}

// Para crear un movimiento de stock
export interface MovementStockCreateData {
  amount: number;
  from_id: number;
  from_type: "deposit" | "point_sale";
  to_id: number;
  to_type: "deposit" | "point_sale";
  product_id: number;
  ignore_stock: boolean;
}

// Para actualizar stock en deposito
export interface UpdateStockDepositData {
  method: "add" | "subtract" | "set";
  product_id: number;
  stock: number | string;
}

// Interfaz para crear una compra/gasto
export interface ExpenseBuyCreate {
  description: string;
  item_expense_buys: ItemExpenseBuy[];
  payment_method: PaymentMethod;
}

// Interfaz para los items de la compra
export interface ItemExpenseBuy {
  price: number;
  product_id: number;
  quantity: number;
}

// Tipo para los métodos de pago
export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

export interface ExpenseBuyType {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    address: string;
    cellphone: string;
    email: string;
    username: string;
  };
  payment_method: string;
  total: number;
  created_at: string;
}

export interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  cellphone: string;
  email: string;
  username: string;
}

export interface ProductType {
  id: number;
  code: string;
  name: string;
  price: number;
}

export interface ItemExpenseBuyType {
  id: number;
  product: ProductType;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
}

export interface ExpenseBuyDetailType {
  id: number;
  user: UserType;
  description: string | null;
  item_expense_buys: ItemExpenseBuyType[];
  payment_method: string;
  created_at: string;
  total: number;
}