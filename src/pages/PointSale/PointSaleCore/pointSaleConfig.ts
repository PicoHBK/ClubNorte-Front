import {
  DollarSign,
  ListOrdered,
  Package,
  Boxes,
  Wallet,
  DoorOpen,
  Grid,
  PlusSquare,
  PlusCircle,
  Volleyball,
  type LucideIcon,
  BarChart3,
} from "lucide-react";
import type { JSX } from "react";
import IncomeCreate from "../Income/IncomeCreate";
import TableIncomes from "../Income/TableIncomes";
import IncomeSportCourtCreate from "../IncomeSportCourt/IncomeSportCourtCreate";
import TableIncomesSportCourt from "../IncomeSportCourt/TableIncomesSportCourt";
import TableProductPointSale from "../ProductPoinSale/TableProductPointSale";
import RegisterPointSale from "../Register/RegisterPointSale";
import FormCreateSportCourt from "../SportCourt/FromCreateSportCourt";
import TableSportCourt from "../SportCourt/TableSportCourt";
import TableRegisters from "../Register/TableRegisters";
import ExpenseCreate from "../Expense/ExpenseCreate";
import TableExpenses from "../Expense/TableExpense";



// Definición de tipos
export interface Action {
  id: string;
  name: string;
  icon: LucideIcon;
  component: () => JSX.Element;
}

export interface Model {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  actions: Action[];
}

export interface Section {
  id: string;
  name: string;
  models: Model[];
}

export interface PointSaleConfig {
  sections: Section[];
}

// Configuración principal
export const pointSaleConfig: PointSaleConfig = {
  sections: [
    {
      id: "Ingreso",
      name: "Ingreso",
      models: [
        {
          id: "income",
          name: "Ingreso",
          icon: DollarSign,
          color: "text-green-500",
          actions: [
            {
              id: "crear-ingreso",
              name: "Crear Ingreso",
              icon: PlusCircle,
              component: IncomeCreate,
            },
            {
              id: "list-ingreso",
              name: "Lista de Ingresos",
              icon: ListOrdered,
              component: TableIncomes,
            },
            {
              id: "crear-ingreso-cancha",
              name: "Crear Ingreso Cancha",
              icon: PlusCircle,
              component: IncomeSportCourtCreate,
            },
            {
              id: "list-ingreso-cancha",
              name: "Lista de Ingresos Cancha",
              icon: ListOrdered,
              component: TableIncomesSportCourt,
            },
          ],
        },
      ],
    },
    {
      id: "Gastos",
      name: "Gastos",
      models: [
        {
          id: "expense",
          name: "Gastos",
          icon: DollarSign,
          color: "text-red-400",
          actions: [
            {
              id: "crear-gasto",
              name: "Crear Gasto",
              icon: PlusCircle,
              component: ExpenseCreate,
            },
            {
              id: "list-gastos",
              name: "Lista de Gastos",
              icon: ListOrdered,
              component: TableExpenses,
            }
          ],
        },
      ],
    },
    {
      id: "Productos",
      name: "Gestión de Productos",
      models: [
        {
          id: "productos",
          name: "Productos",
          icon: Package,
          color: "text-blue-500",
          actions: [
            {
              id: "listar",
              name: "Listar Productos",
              icon: Boxes,
              component: TableProductPointSale,
            },
          ],
        },
      ],
    },
    {
      id: "Caja",
      name: "Caja e Informes",
      models: [
        {
          id: "caja",
          name: "Caja",
          icon: Wallet,
          color: "text-purple-500",
          actions: [
            {
              id: "abrir-cerrar",
              name: "Abrir / Cerrar Caja",
              icon: DoorOpen,
              component: RegisterPointSale,
            },
            {
              id: "registro-caja",
              name: "Registro de Caja",
              icon: BarChart3,
              component: TableRegisters,
            },
          ],
        },
      ],
    },
    {
      id: "canchas",
      name: "Canchas",
      models: [
        {
          id: "canchas",
          name: "Canchas",
          icon: Volleyball,
          color: "text-orange-500",
          actions: [
            {
              id: "crear-cancha",
              name: "Crear Cancha",
              icon: PlusSquare,
              component: FormCreateSportCourt,
            },
            {
              id: "listar-cancha",
              name: "Lista de Canchas",
              icon: Grid,
              component: TableSportCourt,
            },
          ],
        },
      ],
    },
  ],
};

// Función utilitaria para obtener todas las acciones aplanadas
export const getAllActions = (config: PointSaleConfig) => {
  return config.sections.flatMap((s) =>
    s.models.flatMap((m) =>
      m.actions.map((a) => ({ ...a, modelName: m.name, sectionName: s.name }))
    )
  );
};