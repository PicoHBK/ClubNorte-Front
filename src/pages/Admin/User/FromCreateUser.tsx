import apiClubNorte from "@/api/apiClubNorte";
import { useGetAllRoles } from "@/hooks/admin/Rol/useGetAllRoles";
import type { UserCreateData } from "@/hooks/admin/users/userType";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";


const postUser = async (formData: UserCreateData) => {
  const { data } = await apiClubNorte.post(
    "/api/v1/user/create",
    formData,
    { withCredentials: true }
  );
  return data;
};

const FormCreateUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UserCreateData>();

  const invalidateQueries = useInvalidateQueries();

  // � Hooks reales para roles y puntos de venta
  const { roles, isLoading: loadingRoles } = useGetAllRoles();
  const { pointSales, isLoading: loadingPointSales } = usePointSaleGetAll();

  const { mutate, isPending, error: mutationError } = useMutation({
    mutationFn: postUser,
    onSuccess: async (data) => {
      alert("✅ Usuario creado con éxito");
      console.log("Usuario creado:", data);
      reset();
      await invalidateQueries(["getAllUsers","userGetById"])
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear usuario:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  const onSubmit = (data: UserCreateData) => {
  // Adaptamos point_sales_ids a number[]
  const payload: UserCreateData = {
    ...data,
    point_sales_ids: data.point_sales_ids.map(Number),
  };

  mutate(payload);
};


  const inputClass =
    "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";
  const checkboxClass =
    "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-700 rounded bg-slate-800";

  // Procesar error de mutación
  const mutationApiError = getApiError(mutationError);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 min-h-screen">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          Crear Usuario
        </h2>

        {/* Mostrar error de mutación si existe */}
        {mutationApiError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              {mutationApiError.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-200 mb-1">Nombre</label>
              <input
                type="text"
                {...register("first_name", { required: "Nombre obligatorio" })}
                className={inputClass}
                placeholder="Nombre"
                disabled={isPending}
              />
              {errors.first_name && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-200 mb-1">Apellido</label>
              <input
                type="text"
                {...register("last_name", { required: "Apellido obligatorio" })}
                className={inputClass}
                placeholder="Apellido"
                disabled={isPending}
              />
              {errors.last_name && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-200 mb-1">Email</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email obligatorio",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email no válido",
                  },
                })}
                className={inputClass}
                placeholder="usuario@ejemplo.com"
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-200 mb-1">Teléfono</label>
              <input
                type="tel"
                {...register("cellphone", { required: "Teléfono obligatorio" })}
                className={inputClass}
                placeholder="+1234567890"
                disabled={isPending}
              />
              {errors.cellphone && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.cellphone.message}
                </p>
              )}
            </div>
          </div>

          {/* Usuario y Contraseña */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-200 mb-1">Usuario</label>
              <input
                type="text"
                {...register("username", { required: "Usuario obligatorio" })}
                className={inputClass}
                placeholder="Nombre de usuario"
                disabled={isPending}
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-200 mb-1">Contraseña</label>
              <input
                type="password"
                {...register("password", {
                  required: "Contraseña obligatoria",
                  minLength: {
                    value: 6,
                    message: "Mínimo 6 caracteres",
                  },
                })}
                className={inputClass}
                placeholder="******"
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Dirección</label>
            <textarea
              {...register("address", { required: "Dirección obligatoria" })}
              rows={2}
              className={inputClass}
              placeholder="Dirección completa"
              disabled={isPending}
            />
            {errors.address && (
              <p className="text-red-400 text-xs mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Rol</label>
            <select
              {...register("role_id", {
                required: "El rol es obligatorio",
                valueAsNumber: true,
              })}
              className={inputClass}
              disabled={isPending || loadingRoles}
            >
              <option value="">Selecciona un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="text-red-400 text-xs mt-1">
                {errors.role_id.message}
              </p>
            )}
          </div>

          {/* Puntos de Venta */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">
              Puntos de Venta
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1 max-h-32 overflow-y-auto p-1 bg-slate-800/50 rounded">
              {pointSales.map((ps) => (
                <div key={ps.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={ps.id}
                    {...register("point_sales_ids", {
                      required: "Selecciona al menos un punto de venta",
                    })}
                    className={checkboxClass}
                    id={`point-sale-${ps.id}`}
                    disabled={isPending || loadingPointSales}
                  />
                  <label
                    htmlFor={`point-sale-${ps.id}`}
                    className="ml-2 text-xs text-slate-300"
                  >
                    {ps.name}
                  </label>
                </div>
              ))}
            </div>
            {errors.point_sales_ids && (
              <p className="text-red-400 text-xs mt-1">
                {errors.point_sales_ids.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded-md text-sm transition mt-4 disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Creando..." : "Crear Usuario"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormCreateUser;
