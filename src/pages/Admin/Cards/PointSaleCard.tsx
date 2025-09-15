// src/components/PointSaleCard.tsx
import React from "react"
import { useNavigate } from "react-router-dom"
import { Store } from "lucide-react"

type PointSale = {
  id: string | number
  name: string
  description: string
}

type Props = {
  pointSale: PointSale
}

const PointSaleCard: React.FC<Props> = ({ pointSale }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/point-sale/${pointSale.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-xl bg-white/5 border border-white/10 shadow-md 
                 p-5 hover:border-white/20 hover:shadow-lg 
                 transition-all duration-200 flex flex-col gap-3"
    >
      {/* Header con ícono */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
          <Store className="w-5 h-5" />
        </div>
        <h2 className="text-white font-medium text-base">
          {pointSale.name}
        </h2>
      </div>

      {/* Descripción */}
      <p className="text-slate-300 text-sm line-clamp-2">
        {pointSale.description}
      </p>

      {/* Footer */}
      <span className="text-sm text-emerald-500 font-medium mt-1">
        Ver detalle →
      </span>
    </div>
  )
}

export default PointSaleCard
