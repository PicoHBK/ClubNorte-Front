import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormCreateProduct from "./Product/FormCreateProduct"
import TableProduct from "./Product/TableProduct"

const ProductAdmin = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
      <Tabs defaultValue="listar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl mb-6">
        <TabsTrigger 
            value="listar" 
            className="text-white data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
          >
            Listar
          </TabsTrigger>
          <TabsTrigger 
            value="crear" 
            className="text-white data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
          >
            Crear
          </TabsTrigger>
          
        </TabsList>
        <TabsContent value="listar">
          <TableProduct />

        </TabsContent>

        <TabsContent value="crear">
          <FormCreateProduct />
        </TabsContent>

        
      </Tabs>
    </div>
  )
}

export default ProductAdmin
