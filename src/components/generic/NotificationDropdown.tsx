import { Bell, BellRing, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSSENotifications, type Notification } from '@/hooks/admin/Notify/useSSENotifications'

const NotificationDropdown = () => {
  // Hook de notificaciones SSE con las nuevas funcionalidades
  const {
    notifications,
    unreadCount,
    lowStockProducts,
    clearAll,
    markAsRead,
    isConnected,
    error,
    reconnect,
    reconnectAttempts
  } = useSSENotifications()

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  // Función para agrupar notificaciones por tipo
  const groupNotificationsByType = (notifications: Notification[]) => {
    const grouped = notifications.reduce((acc, notification) => {
      const type = notification.type || 'stock-alert'
      if (!acc[type]) {
        acc[type] = {
          type,
          notifications: [],
          totalUnread: 0,
          latestTimestamp: notification.timestamp
        }
      }
      acc[type].notifications.push(notification)
      if (!notification.read) {
        acc[type].totalUnread++
      }
      // Mantener el timestamp más reciente
      if (new Date(notification.timestamp) > new Date(acc[type].latestTimestamp)) {
        acc[type].latestTimestamp = notification.timestamp
      }
      return acc
    }, {} as Record<string, {
      type: string
      notifications: Notification[]
      totalUnread: number
      latestTimestamp: string
    }>)

    // Convertir a array y ordenar por timestamp más reciente
    return Object.values(grouped).sort((a, b) => 
      new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    )
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stock-alert':
        return 'Stock Bajo'
      case 'venta':
        return 'Venta'
      case 'sistema':
        return 'Sistema'
      default:
        return 'Notificación'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock-alert':
        return 'bg-red-500'
      case 'venta':
        return 'bg-green-500'
      case 'sistema':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const groupedNotifications = groupNotificationsByType(notifications)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-700 border-slate-500 hover:bg-slate-600 text-white relative"
        >
          <div className="flex items-center gap-1">
            {unreadCount > 0 ? (
              <BellRing size={18} className="text-yellow-400" />
            ) : (
              <Bell size={18} />
            )}
            
            {/* Indicador de conexión */}
            {isConnected ? (
              <Wifi size={12} className="text-green-400" />
            ) : (
              <WifiOff size={12} className="text-red-400" />
            )}
          </div>
          
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-slate-800 border-slate-600">
        <DropdownMenuLabel className="text-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Notificaciones</span>
            {/* Estado de conexión */}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Badge className="bg-green-600 text-white text-xs px-2 py-0">
                  Conectado
                </Badge>
              ) : (
                <Badge className="bg-red-600 text-white text-xs px-2 py-0">
                  Desconectado
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Botón de reconexión manual */}
            {!isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reconnect}
                className="text-xs text-slate-400 hover:text-white h-auto p-1"
                title={`Reconectar${reconnectAttempts > 0 ? ` (${reconnectAttempts}/10)` : ''}`}
              >
                <RefreshCw size={14} />
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-white h-auto p-1"
              >
                Limpiar todo
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-600" />
        
        {/* Mostrar mensaje de error si existe */}
        {error && (
          <div className="p-3 mx-2 mb-2 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            <div className="flex flex-col items-center gap-2">
              <Bell size={32} className="text-slate-500" />
              <span>No hay notificaciones</span>
              {!isConnected && (
                <span className="text-xs text-red-400">
                  Conexión desactivada
                </span>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2">
              {groupedNotifications.map((group) => (
                <div key={group.type} className="mb-4">
                  {/* Header del grupo */}
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${getTypeColor(group.type)} text-white text-xs`}
                      >
                        {getTypeLabel(group.type)}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {group.notifications.length} mensaje{group.notifications.length !== 1 ? 's' : ''}
                      </span>
                      {group.totalUnread > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                          {group.totalUnread}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTimeAgo(group.latestTimestamp)}
                    </span>
                  </div>

                  {/* Lista de notificaciones del grupo */}
                  <div className="space-y-1">
                    {group.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`
                          p-3 rounded-lg cursor-pointer transition-colors
                          ${notification.read 
                            ? 'bg-slate-700/50 hover:bg-slate-700' 
                            : 'bg-slate-700 hover:bg-slate-600 border-l-2 border-blue-500'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 leading-tight">
                              {notification.message}
                            </p>
                            {notification.products && notification.products.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {notification.products.map((product) => (
                                  <div 
                                    key={product.id} 
                                    className="text-xs text-slate-300 bg-slate-800 rounded px-2 py-1"
                                  >
                                    <span className="font-medium">{product.name}</span>
                                    <span className="text-red-400 ml-2">
                                      Stock: {product.stock}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Resumen de productos con stock bajo */}
              {lowStockProducts.length > 0 && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-200 mb-2">
                    Resumen - Productos con Stock Bajo
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium truncate">
                          {product.name}
                        </span>
                        <span className="text-red-400 ml-2 flex-shrink-0">
                          {product.stock} unidades
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown