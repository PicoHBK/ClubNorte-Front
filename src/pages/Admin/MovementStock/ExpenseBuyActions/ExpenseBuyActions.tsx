// src/components/admin/ExpenseBuy/ExpenseBuyActions.tsx
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseBuyCard } from "./ExpenseBuyCard";
import useUserStore from "@/store/useUserStore";
import DeleteExpenseBuyComponent from "./DeleteExpenseBuyComponent";

type ExpenseBuyActionsProps = {
  id: number;
  expenseBuyName?: string;
  onDeleteSuccess?: () => void;
};

const ExpenseBuyActions: React.FC<ExpenseBuyActionsProps> = ({
  id,
  expenseBuyName,
  onDeleteSuccess,
}) => {
  const { isUserAdmin, getUserRole } = useUserStore();

  // Solo los admins pueden acceder
  const canDelete = isUserAdmin() || getUserRole() === "admin";

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <Tabs defaultValue="detalle" className="w-full">
          <TabsList
            className={`grid w-full ${
              canDelete ? "grid-cols-2" : "grid-cols-1"
            } bg-slate-800/50 rounded-xl mb-6 border border-slate-700`}
          >
            <TabsTrigger
              value="detalle"
              className="text-slate-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-colors"
            >
              Detalle
            </TabsTrigger>
            {canDelete && (
              <TabsTrigger
                value="eliminar"
                className="text-slate-300 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-xl transition-colors"
              >
                Eliminar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="detalle">
            <ExpenseBuyCard id={id} />
          </TabsContent>

          {canDelete && (
            <TabsContent value="eliminar">
              <DeleteExpenseBuyComponent
                expenseBuyId={id}
                expenseBuyName={expenseBuyName}
                onDeleteSuccess={onDeleteSuccess}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ExpenseBuyActions;