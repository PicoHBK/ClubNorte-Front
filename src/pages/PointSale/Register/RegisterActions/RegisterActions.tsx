import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useUserStore from "@/store/useUserStore"
import RegisterDetailCard from "./RegisterDetailCardProps"
import RegisterTransactions from "./RegisterTransactions"

type RegisterActionsProps = {
  id: number
}

const RegisterActions: React.FC<RegisterActionsProps> = ({ id }) => {
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
              📋 Detalle
            </TabsTrigger>
            {canEdit && (
              <TabsTrigger
                value="transacciones"
                className="text-slate-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-xl transition-colors"
              >
                💰 Transacciones
              </TabsTrigger>
            )}
            {canEdit && (
              <TabsTrigger
                value="acciones"
                className="text-slate-300 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl transition-colors"
              >
                ⚙️ Acciones
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="detalle">
            <RegisterDetailCard id={id} />
          </TabsContent>

          {canEdit && (
            <TabsContent value="transacciones">
              <RegisterTransactions id={id} />
            </TabsContent>
          )}

          {canEdit && (
            <TabsContent value="acciones">
              <div className="bg-white/5 rounded-lg p-6 text-center text-slate-400">
                Componente de acciones próximamente
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default RegisterActions