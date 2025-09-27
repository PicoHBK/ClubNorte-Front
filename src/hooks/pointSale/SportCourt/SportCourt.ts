interface PointSale {
  id: number;
  name: string;
  description: string;
}

export interface SportCourt {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SportCourtDetails {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  point_sales: PointSale[];
}

// para crear una cancha deportiva
export interface SportCourtCreateData {
  code: string;
  description: string;
  name: string;
}

// para actualizar una cancha deportiva
export interface SportCourtUpdateData {
  id: number;
  code: string;
  description: string;
  name: string;
}