import type { User } from "../users/userType";

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

interface MovementProduct {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
}

// Interfaz para crear una compra/gasto
export interface ExpenseBuyCreate {
  description: string;
  item_expense_buys: ItemExpenseBuy[];
  payment_method: PaymentMethod;
}

// Interfaz para los items de la compra
interface ItemExpenseBuy {
  price: number;
  product_id: number;
  quantity: number;
}

// Tipo para los métodos de pago
export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";