import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormCreateUser from "./User/FromCreateUser"
import TableUsers from "./User/TableUser"

const UserAdmin = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
      <Tabs defaultValue="crear" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl mb-6">
          <TabsTrigger 
            value="crear" 
            className="text-white data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
          >
            Crear
          </TabsTrigger>
          <TabsTrigger 
            value="listar" 
            className="text-white data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
          >
            Listar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crear">
            <FormCreateUser />
        </TabsContent>

        <TabsContent value="listar">
            <TableUsers />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserAdmin