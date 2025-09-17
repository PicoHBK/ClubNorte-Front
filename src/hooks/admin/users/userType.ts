import type { Role } from "../Rol/roleType";


interface PointSale {
  id: number;
  name: string;
}
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  cellphone: string;
  address: string;
  is_admin: boolean;
  role: Role;
}

export interface UserDetail {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  cellphone: string;
  email: string;
  username: string;
  is_admin: boolean;
  role: Role;
  point_sales: PointSale[];
}

// para crear un usuario
export interface UserCreateData {
  address: string;
  cellphone: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  point_sales_ids: number[];
  role_id: number;
  username: string;
}

// para actualizar un usuario
export interface UserUpdateData {
  address: string;
  cellphone: string;
  email: string;
  first_name: string;
  last_name: string;
  point_sales_ids: number[];
  role_id: number;
  username: string;
}