import useUserStore from '@/store/useUserStore';
import { Loader2, Package, FolderTree, Users, Box, Mail, Briefcase, Shield, Building2, Zap } from 'lucide-react';
import PointSaleCard from './Cards/PointSaleCard';
import ProductAdmin from './ProductAdmin';
import CategoryAdmin from './CategoryAdmin';
import UserAdmin from './UserAdmin';
import MovementStockAdmin from './MovementStockAdmin';

const Admin = () => {
  const isLoading = useUserStore((state) => state.isLoading);
  const user = useUserStore((state) => state.user);
  const getUserFullName = useUserStore((state) => state.getUserFullName);
  const role = useUserStore((state) => state.getUserRole());
  const isAdmin = useUserStore((state) => state.isUserAdmin());
  const userPointSales = useUserStore((state) => state.getPointSales());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const canAccessAdmin = isAdmin || role === "admin";
  const canAccessStock = isAdmin || role === "admin" || role === "repositor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* HEADER - Bienvenida con gradiente destacado */}
        <div className="relative bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-transparent backdrop-blur-md rounded-2xl shadow-2xl border-2 border-indigo-500/30 p-8 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="relative flex items-start gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 shadow-xl">
              <Users className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-2">
                ¡Hola, {getUserFullName()}!
              </h2>
              <p className="text-indigo-200 text-lg mb-6">
                Panel de gestión y control de Puntos de Venta
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-slate-400 text-xs">Email</p>
                    <p className="text-white font-medium text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-slate-400 text-xs">Rol</p>
                    <p className="text-white font-medium text-sm">{user.role?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                  <Shield className={`w-5 h-5 ${user.isAdmin ? 'text-yellow-400' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-slate-400 text-xs">Admin</p>
                    <p className="text-white font-medium text-sm">{user.isAdmin ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PUNTOS DE VENTA - Verde/Emerald */}
        <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent backdrop-blur-md rounded-2xl shadow-xl border border-emerald-500/20 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-600 rounded-xl p-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Puntos de Venta</h3>
              <p className="text-emerald-300 text-sm">
                {userPointSales.length} {userPointSales.length === 1 ? 'ubicación asignada' : 'ubicaciones asignadas'}
              </p>
            </div>
          </div>

          {userPointSales.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPointSales.map((pointSale) => (
                <PointSaleCard key={pointSale.id} pointSale={pointSale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl border-2 border-dashed border-emerald-500/30">
              <Building2 className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
              <p className="text-slate-300 text-lg font-medium mb-2">
                Sin puntos de venta asignados
              </p>
              <p className="text-slate-400 text-sm">
                Contacta al administrador para obtener acceso
              </p>
            </div>
          )}
        </div>

        {/* ACCESOS RÁPIDOS - Amarillo/Oro */}
        {canAccessStock && (
          <div className="bg-gradient-to-r from-yellow-600/10 via-amber-500/5 to-transparent backdrop-blur-md rounded-2xl shadow-xl border border-yellow-500/20 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-yellow-600 rounded-xl p-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Accesos Rápidos</h3>
                <p className="text-yellow-300 text-sm">Navega directamente a cada módulo</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {canAccessAdmin && (
                <a href="#productos" className="group bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-indigo-500 rounded-xl p-5 transition-all shadow-lg hover:shadow-indigo-500/20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-indigo-600 group-hover:scale-110 transition-transform rounded-full p-3">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">Productos</span>
                  </div>
                </a>
              )}
              {canAccessAdmin && (
                <a href="#categorias" className="group bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-indigo-500 rounded-xl p-5 transition-all shadow-lg hover:shadow-indigo-500/20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-indigo-600 group-hover:scale-110 transition-transform rounded-full p-3">
                      <FolderTree className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">Categorías</span>
                  </div>
                </a>
              )}
              {canAccessAdmin && (
                <a href="#usuarios" className="group bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-indigo-500 rounded-xl p-5 transition-all shadow-lg hover:shadow-indigo-500/20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-indigo-600 group-hover:scale-110 transition-transform rounded-full p-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">Usuarios</span>
                  </div>
                </a>
              )}
              {canAccessStock && (
                <a href="#stock" className="group bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-emerald-500 rounded-xl p-5 transition-all shadow-lg hover:shadow-emerald-500/20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-emerald-500 group-hover:scale-110 transition-transform rounded-full p-3">
                      <Box className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">Stock</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* MÓDULOS */}
        {canAccessAdmin && (
          <div id="productos" className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Productos</h3>
                <p className="text-slate-300 text-sm">Catálogo completo</p>
              </div>
            </div>
            <ProductAdmin />
          </div>
        )}

        {canAccessAdmin && (
          <div id="categorias" className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 rounded-lg p-2">
                <FolderTree className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Categorías</h3>
                <p className="text-slate-300 text-sm">Organización</p>
              </div>
            </div>
            <CategoryAdmin />
          </div>
        )}

        {canAccessAdmin && (
          <div id="usuarios" className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Usuarios</h3>
                <p className="text-slate-300 text-sm">Accesos y permisos</p>
              </div>
            </div>
            <UserAdmin />
          </div>
        )}

        {canAccessStock && (
          <div id="stock" className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 rounded-lg p-2">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Stock</h3>
                <p className="text-slate-300 text-sm">Inventario y movimientos</p>
              </div>
            </div>
            <MovementStockAdmin />
          </div>
        )}

      </main>
    </div>
  );
};

export default Admin;