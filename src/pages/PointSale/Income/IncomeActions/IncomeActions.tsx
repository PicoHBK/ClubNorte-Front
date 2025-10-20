import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomeCard } from "./IncomeCard"
import useUserStore from "@/store/useUserStore"
import FormEditIncome from "./FormEditIncome"
import DeleteIncomeComponent from "./DeleteIncomeComponent"

type IncomeActionsProps = {
  id: number
  incomeName?: string // Opcional: para mostrar en la confirmación de eliminación
  onDeleteSuccess?: () => void // Opcional: callback cuando se elimina exitosamente
}

const IncomeActions: React.FC<IncomeActionsProps> = ({
  id,
  incomeName,
  onDeleteSuccess
}) => {
  const { isUserAdmin, getUserRole } = useUserStore()
  
  // Chequeo de permisos
  const canEdit = isUserAdmin() || getUserRole() === "admin"

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <Tabs defaultValue="detalle" className="w-full">
          <TabsList
            className={`grid w-full ${
              canEdit ? "grid-cols-3" : "grid-cols-1"
            } bg-slate-800/50 rounded-xl mb-6 border border-slate-700`}
          >
            <TabsTrigger
              value="detalle"
              className="text-slate-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-colors"
            >
              Detalle
            </TabsTrigger>
            {canEdit && (
              <TabsTrigger
                value="editar"
                className="text-slate-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-xl transition-colors"
              >
                Editar
              </TabsTrigger>
            )}
            {canEdit && (
              <TabsTrigger
                value="eliminar"
                className="text-slate-300 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-xl transition-colors"
              >
                Eliminar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="detalle">
            <IncomeCard id={id} />
          </TabsContent>

          {canEdit && (
            <TabsContent value="editar">
              <FormEditIncome incomeId={id} />
            </TabsContent>
          )}

          {canEdit && (
            <TabsContent value="eliminar">
              <DeleteIncomeComponent
                incomeId={id} // Ya no necesita toString(), pasamos number directamente
                incomeName={incomeName}
                onDeleteSuccess={onDeleteSuccess}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default IncomeActions