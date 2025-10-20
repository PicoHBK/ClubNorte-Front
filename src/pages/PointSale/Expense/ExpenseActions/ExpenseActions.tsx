// src/components/admin/Expense/ExpenseActions.tsx
import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseCard } from "./ExpenseCard"
import useUserStore from "@/store/useUserStore"
import DeleteExpenseComponent from "./DeleteExpenseComponent"

type ExpenseActionsProps = {
  id: number
  expenseName?: string
  onDeleteSuccess?: () => void
}

const ExpenseActions: React.FC<ExpenseActionsProps> = ({
  id,
  expenseName,
  onDeleteSuccess
}) => {
  const { isUserAdmin, getUserRole } = useUserStore()

  // Solo los admins pueden acceder
  const canDelete = isUserAdmin() || getUserRole() === "admin"

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
            <ExpenseCard id={id} />
          </TabsContent>

          {canDelete && (
            <TabsContent value="eliminar">
              <DeleteExpenseComponent
                expenseId={id}
                expenseName={expenseName}
                onDeleteSuccess={onDeleteSuccess}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default ExpenseActions