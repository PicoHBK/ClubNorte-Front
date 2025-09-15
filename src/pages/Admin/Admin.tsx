import useUserStore from '@/store/useUserStore'
import { Loader2 } from 'lucide-react'
import PointSaleCard from './Cards/PointSaleCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductAdmin from './ProductAdmin'
import CategoryAdmin from './CategoryAdmin'
import UserAdmin from './UserAdmin'
import MovementStockAdmin from './MovementStockAdmin'

const Admin = () => {
  const isLoading = useUserStore((state) => state.isLoading)
  const user = useUserStore((state) => state.user)
  const getUserFullName = useUserStore((state) => state.getUserFullName)
  const userPointSales = useUserStore((state) => state.getPointSales()) // ✅ puntos de venta del usuario

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  // Si no hay usuario, mostrar pantalla vacía
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Encabezado principal */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bienvenido {getUserFullName()}
          </h2>
          <p className="text-slate-300 text-lg">
            Panel de gestión de Puntos de Venta
          </p>
          
          {/* Información del usuario */}
          <div className="bg-white/5 rounded-xl p-4 mt-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Rol:</span>
                <p className="text-white font-medium">{user.role?.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Admin:</span>
                <p className="text-white font-medium">{user.isAdmin ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Puntos de Venta del usuario */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 mb-12">
          <h3 className="text-2xl font-semibold text-white mb-6">
            Tus Puntos de Venta Asignados
          </h3>

          {userPointSales.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPointSales.map((pointSale) => (
                <PointSaleCard key={pointSale.id} pointSale={pointSale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-300 text-lg">
                No tienes puntos de venta asignados actualmente.
              </p>
            </div>
          )}
        </div>

        {/* Sección con Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <Tabs defaultValue="productos" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 rounded-xl mb-6">
              <TabsTrigger value="productos" className="text-white data-[state=active]:bg-white/20 rounded-xl">Productos</TabsTrigger>
              <TabsTrigger value="categorias" className="text-white data-[state=active]:bg-white/20 rounded-xl">Categorías</TabsTrigger>
              <TabsTrigger value="reponer" className="text-white data-[state=active]:bg-white/20 rounded-xl">Reponer</TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/20 rounded-xl">Usuarios</TabsTrigger>
            </TabsList>

            <TabsContent value="productos">
              <ProductAdmin />
            </TabsContent>

            <TabsContent value="categorias">
              <CategoryAdmin />
            </TabsContent>

            <TabsContent value="reponer">
              <MovementStockAdmin />
            </TabsContent>

            <TabsContent value="users">
              <UserAdmin />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default Admin
