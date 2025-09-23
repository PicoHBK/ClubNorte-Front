import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getApiError } from '@/utils/apiError';
import { useGetAllRoles } from '@/hooks/admin/Rol/useGetAllRoles';
import { usePointSaleGetAll } from '@/hooks/pointSale/usePointSaleGetAll';
import { useGetUserById } from '@/hooks/admin/users/useGetUserById';
import { useUserMutations } from '@/hooks/admin/users/useUserMutations';
import SuccessMessage from '@/components/generic/SuccessMessage';
import type { UserUpdateData } from '@/hooks/admin/users/userType';



interface EditDeleteUserProps {
  id: number;
  onClose?: () => void;
}

const EditDeleteUser: React.FC<EditDeleteUserProps> = ({ id, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserUpdateData>();

  // Obtener roles
  const { 
    roles, 
    isLoading: isLoadingRoles, 
    isError: isErrorRoles, 
    error: rolesError 
  } = useGetAllRoles();

  // Obtener puntos de venta
  const { 
    pointSales, 
    isLoading: isLoadingPointSales, 
    isError: isErrorPointSales, 
    errorMessage: pointSalesError 
  } = usePointSaleGetAll();

  // Obtener datos del usuario
  const { 
    user, 
    isLoading: isLoadingUser, 
    isError: isErrorUser, 
    error: userError 
  } = useGetUserById(id);

  // Hook de mutaciones
  const {
    updateUser,
    deleteUser,
    isUpdating,
    isDeleting,
    isUpdated,
    isDeleted,
    updateError,
    deleteError,
    resetUpdateState,
  } = useUserMutations();

  // Cargar datos en el formulario cuando se obtenga el usuario
  useEffect(() => {
    if (user) {
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('address', user.address);
      setValue('cellphone', user.cellphone);
      setValue('email', user.email);
      setValue('username', user.username);
      setValue('role_id', user.role.id);
      setValue('point_sales_ids', user.point_sales.map(ps => ps.id));
      setValue('is_active', user.is_active);
    }
  }, [user, setValue]);

  // Observar los point_sales_ids seleccionados
  const watchedPointSalesIds = watch('point_sales_ids', []);

  const onSubmit = (data: UserUpdateData) => {
    updateUser({ id, data });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (confirmDelete) {
      deleteUser(id);
    }
  };

  // Toggle para seleccionar/deseleccionar puntos de venta
  const handlePointSaleToggle = (pointSaleId: number) => {
    const currentIds = watchedPointSalesIds || [];
    const newIds = currentIds.includes(pointSaleId)
      ? currentIds.filter(id => id !== pointSaleId)
      : [...currentIds, pointSaleId];
    setValue('point_sales_ids', newIds);
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Procesar errores para mostrar en UI
  const mutationUpdateError = getApiError(updateError);
  const mutationDeleteError = getApiError(deleteError);

  // Pantalla de éxito para actualización
  if (isUpdated) {
    return (
      <SuccessMessage
        title="¡Usuario Actualizado!"
        description="El usuario ha sido actualizado exitosamente"
        primaryButton={{
          text: "Editar de nuevo",
          onClick: () => resetUpdateState(),
          variant: "slate"
        }}
        secondaryButton={onClose ? {
          text: "Volver",
          onClick: onClose,
          variant: "indigo"
        } : undefined}
      />
    );
  }

  // Si el usuario fue eliminado exitosamente
  if (isDeleted) {
    return (
      <SuccessMessage
        title="¡Usuario Eliminado!"
        description="El usuario ha sido eliminado exitosamente"
        primaryButton={onClose ? {
          text: "Volver",
          onClick: onClose,
          variant: "indigo"
        } : undefined}
      />
    );
  }

  if (isLoadingUser || isLoadingRoles || isLoadingPointSales) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            Cargando datos...
          </div>
        </div>
      </div>
    );
  }

  if (isErrorUser) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
            <p className="text-red-400 text-center">
              Error al cargar el usuario: {userError?.message || 'Error desconocido'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 rounded-md text-sm transition"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isErrorRoles) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
            <p className="text-red-400 text-center">
              Error al cargar roles: {rolesError?.message || 'Error desconocido'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 rounded-md text-sm transition"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isErrorPointSales) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
            <p className="text-red-400 text-center">
              Error al cargar puntos de venta: {pointSalesError || 'Error desconocido'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 rounded-md text-sm transition"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Editar Usuario</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mostrar errores de mutación */}
        {mutationUpdateError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              {mutationUpdateError.message}
            </p>
          </div>
        )}

        {mutationDeleteError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              Error al eliminar: {mutationDeleteError.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs text-slate-200 mb-1">Nombre</label>
              <input
                type="text"
                {...register('first_name', {
                  required: 'Nombre obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  },
                  maxLength: {
                    value: 50,
                    message: 'El nombre no puede exceder los 50 caracteres'
                  }
                })}
                className={inputClass}
                placeholder="Nombre"
                disabled={isUpdating || isDeleting}
              />
              {errors.first_name && (
                <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-xs text-slate-200 mb-1">Apellido</label>
              <input
                type="text"
                {...register('last_name', {
                  required: 'Apellido obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El apellido debe tener al menos 2 caracteres'
                  },
                  maxLength: {
                    value: 50,
                    message: 'El apellido no puede exceder los 50 caracteres'
                  }
                })}
                className={inputClass}
                placeholder="Apellido"
                disabled={isUpdating || isDeleting}
              />
              {errors.last_name && (
                <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Nombre de usuario</label>
            <input
              type="text"
              {...register('username', {
                required: 'Nombre de usuario obligatorio',
                minLength: {
                  value: 3,
                  message: 'El nombre de usuario debe tener al menos 3 caracteres'
                },
                maxLength: {
                  value: 30,
                  message: 'El nombre de usuario no puede exceder los 30 caracteres'
                }
              })}
              className={inputClass}
              placeholder="Nombre de usuario"
              disabled={isUpdating || isDeleting}
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido'
                }
              })}
              className={inputClass}
              placeholder="email@ejemplo.com"
              disabled={isUpdating || isDeleting}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Teléfono */}
            <div>
              <label className="block text-xs text-slate-200 mb-1">Teléfono</label>
              <input
                type="tel"
                {...register('cellphone', {
                  required: 'Teléfono obligatorio',
                  minLength: {
                    value: 8,
                    message: 'El teléfono debe tener al menos 8 dígitos'
                  },
                  maxLength: {
                    value: 20,
                    message: 'El teléfono no puede exceder los 20 caracteres'
                  }
                })}
                className={inputClass}
                placeholder="Teléfono"
                disabled={isUpdating || isDeleting}
              />
              {errors.cellphone && (
                <p className="text-red-400 text-xs mt-1">{errors.cellphone.message}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-xs text-slate-200 mb-1">Rol</label>
              <select
                {...register('role_id', {
                  required: 'Rol obligatorio',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: 'Debe seleccionar un rol válido'
                  }
                })}
                className={inputClass}
                disabled={isUpdating || isDeleting}
              >
                <option value="">Seleccionar rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="text-red-400 text-xs mt-1">{errors.role_id.message}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Dirección</label>
            <textarea
              {...register('address', {
                required: 'Dirección obligatoria',
                minLength: {
                  value: 10,
                  message: 'La dirección debe tener al menos 10 caracteres'
                },
                maxLength: {
                  value: 200,
                  message: 'La dirección no puede exceder los 200 caracteres'
                }
              })}
              className={`${inputClass} min-h-[60px] resize-none`}
              placeholder="Dirección completa"
              disabled={isUpdating || isDeleting}
              rows={2}
            />
            {errors.address && (
              <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Estado activo */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_active')}
                className="rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                disabled={isUpdating || isDeleting}
              />
              <span className="text-sm text-slate-200">Usuario activo</span>
            </label>
            <p className="text-xs text-slate-400 mt-1">
              Los usuarios inactivos no podrán acceder al sistema
            </p>
          </div>

          {/* Puntos de venta */}
          <div>
            <label className="block text-xs text-slate-200 mb-2">Puntos de venta</label>
            <div className="bg-slate-800 border border-slate-700 rounded-md p-3 max-h-32 overflow-y-auto">
              {pointSales.length === 0 ? (
                <p className="text-slate-400 text-sm">No hay puntos de venta disponibles</p>
              ) : (
                <div className="space-y-2">
                  {pointSales.map((pointSale) => (
                    <label key={pointSale.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watchedPointSalesIds?.includes(pointSale.id) || false}
                        onChange={() => handlePointSaleToggle(pointSale.id)}
                        className="rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                        disabled={isUpdating || isDeleting}
                      />
                      <span className="text-sm text-slate-300">{pointSale.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Seleccionados: {watchedPointSalesIds?.length || 0}
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
              disabled={isUpdating || isDeleting}
            >
              {isUpdating ? "Actualizando..." : "Actualizar"}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
              disabled={isUpdating || isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <p>ID: {user?.id}</p>
            <p>Rol: {user?.role.name}</p>
            <p>Admin: {user?.is_admin ? 'Sí' : 'No'}</p>
            <p>Estado: {user?.is_active ? 'Activo' : 'Inactivo'}</p>
            <p>Puntos de venta: {user?.point_sales.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDeleteUser;