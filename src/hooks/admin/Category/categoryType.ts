// tipo base de category
export interface Category {
  id: number;
  name: string;
}

// para crear una categoría
export interface CategoryCreateData {
  name: string;
}

// para actualizar una categoría
export interface CategoryUpdateData {
  name: string;
}
