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