import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TableMovements from "./MovementStock/TableMovements"
import TableReponerStock from "./MovementStock/MovementStockTable"
import FormCreateExpenseBuy from "./MovementStock/FormCreateExpenseBuy"

const MovementStockAdmin = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
      <Tabs defaultValue="crear" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 rounded-xl mb-6">
          <TabsTrigger
            value="crear"
            className="text-white data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
          >
            Administrar
          </TabsTrigger>
          <TabsTrigger
            value="compras"
            className="text-white data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
          >
            Registrar Compras
          </TabsTrigger>
          <TabsTrigger
            value="listar"
            className="text-white data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
          >
            Historial de movimiento
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="crear">
          <TableReponerStock />
        </TabsContent>
        
        <TabsContent value="compras">
          <FormCreateExpenseBuy />
        </TabsContent>
        
        <TabsContent value="listar">
          <TableMovements />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MovementStockAdmin