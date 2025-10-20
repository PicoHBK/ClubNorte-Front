import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import apiClubNorte from '@/api/apiClubNorte'
import { getApiError } from "@/utils/apiError"
import { useMutation } from '@tanstack/react-query'

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const postChangePassword = async (formData: ChangePasswordForm) => {
    // Mapear los campos del formulario a los nombres que espera la API
    const apiPayload = {
      old_password: formData.currentPassword,
      new_password: formData.newPassword,
      confirm_pass: formData.confirmPassword
    }
    
    const {data} = await apiClubNorte.put('/api/v1/user/update_password', apiPayload,
      { withCredentials: true }
    )
    return data
}

const ChangePassword = () => {
  const navigate = useNavigate()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { mutate, isPending, error: mutationError } = useMutation({
    mutationFn: postChangePassword,
    onSuccess: (data) => {
      alert("✅ Contraseña cambiada con éxito")
      console.log('Contraseña cambiada exitosamente:', data)
      reset()
      // navigate('/dashboard') // Descomentar cuando implementes la navegación
    },
    onError: (error) => {
      const apiError = getApiError(error)
      const errorMessage = apiError?.message || "Error desconocido al cambiar la contraseña"
      console.error('Error al cambiar la contraseña:', errorMessage)
      alert(`❌ ${errorMessage}`)
    }
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<ChangePasswordForm>()

  const newPassword = watch('newPassword')

  const onSubmit = (data: ChangePasswordForm) => {
    mutate(data)
  }

  // Procesar error de mutación para mostrar en UI
  const mutationApiError = getApiError(mutationError)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      {/* Botón volver - Posición superior izquierda */}
      <div className="max-w-7xl mx-auto mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-white/10 border-white/20 text-slate-300 hover:bg-white/20"
          disabled={isPending}
        >
          <ArrowLeft size={16} className="mr-2" />
          Volver
        </Button>
      </div>

      {/* Contenedor centrado */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-indigo-600">
              <Lock className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Cambiar Contraseña</h1>
            <p className="text-slate-300">Actualiza tu contraseña de acceso</p>
          </div>

        {/* Formulario */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Mostrar error de mutación si existe */}
          {mutationApiError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-6">
              <p className="text-red-400 text-sm text-center">
                {mutationApiError.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  {...register('currentPassword', {
                    required: 'La contraseña actual es requerida',
                    minLength: {
                      value: 6,
                      message: 'Mínimo 6 caracteres'
                    }
                  })}
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña actual"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  disabled={isPending}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('newPassword', {
                    required: 'La nueva contraseña es requerida',
                    minLength: {
                      value: 8,
                      message: 'La nueva contraseña debe tener al menos 8 caracteres'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Debe contener al menos: 1 minúscula, 1 mayúscula y 1 número'
                    }
                  })}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  disabled={isPending}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Debes confirmar la nueva contraseña',
                    validate: (value) =>
                      value === newPassword || 'Las contraseñas no coinciden'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu nueva contraseña"
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : newPassword && watch('confirmPassword') && newPassword === watch('confirmPassword')
                        ? 'border-emerald-500'
                        : 'border-slate-700'
                  }`}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  disabled={isPending}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {/* Indicador visual de coincidencia */}
                {newPassword && watch('confirmPassword') && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    {newPassword === watch('confirmPassword') ? (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
              {/* Mensaje de coincidencia positiva */}
              {!errors.confirmPassword && newPassword && watch('confirmPassword') && newPassword === watch('confirmPassword') && (
                <p className="mt-1 text-sm text-emerald-400">✓ Las contraseñas coinciden</p>
              )}
            </div>

            {/* Botón Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Cambiando Contraseña...
                </>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
          </form>
        </div>

          {/* Información de seguridad */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Tu nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword