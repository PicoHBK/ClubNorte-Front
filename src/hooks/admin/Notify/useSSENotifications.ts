import { useEffect, useRef, useState, useCallback } from 'react';

export interface StockProduct {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  min_amount: number;
}

export interface Notification {
  id: string;
  type: 'stock-alert';
  message: string;
  products: StockProduct[];
  timestamp: string;
  read: boolean;
}

export const useSSENotifications = (enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectDelayRef = useRef(1000);

  // Función para generar un hash único del contenido del mensaje
  const generateMessageHash = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const content = {
      type: notification.type,
      message: notification.message,
      products: notification.products
        ?.map(p => ({ 
          id: p.id, 
          code: p.code, 
          name: p.name, 
          stock: p.stock, 
          min_amount: p.min_amount 
        }))
        .sort((a, b) => a.id - b.id)
    };
    return JSON.stringify(content);
  }, []);

  // Función para agregar o actualizar notificación
  const addOrUpdateNotification = useCallback((newNotification: Notification) => {
    const messageHash = generateMessageHash(newNotification);
    
    setNotifications(prev => {
      const existingIndex = prev.findIndex(notification => {
        const existingHash = generateMessageHash(notification);
        return existingHash === messageHash;
      });

      if (existingIndex !== -1) {
        const updatedNotifications = [...prev];
        const existingNotification = updatedNotifications[existingIndex];
        
        const updatedNotification = {
          ...existingNotification,
          timestamp: newNotification.timestamp,
          products: newNotification.products,
          read: false
        };
        
        updatedNotifications.splice(existingIndex, 1);
        updatedNotifications.unshift(updatedNotification);
        
        return updatedNotifications;
      } else {
        return [newNotification, ...prev.slice(0, 49)];
      }
    });
  }, [generateMessageHash]);

  // Limpiar timeout de reconexión
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Función de conexión mejorada con cache busting
  const connect = useCallback(() => {
    if (!enabled) return;

    // Limpiar conexión anterior si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Limpiar timeout anterior
    clearReconnectTimeout();

    // Agregar timestamp para evitar cache y simular no-cache
    const baseUrl = `${import.meta.env.VITE_API_URL}api/v1/notification/alert`;
    const sseUrl = `${baseUrl}?t=${Date.now()}&nocache=true`;

    try {
      console.log(`Intentando conectar SSE (intento ${reconnectAttemptsRef.current + 1})...`);
      const eventSource = new EventSource(sseUrl, { 
        withCredentials: true 
      });
      eventSourceRef.current = eventSource;

      // Timeout para detectar si la conexión no se establece
      const connectionTimeout = setTimeout(() => {
        if (eventSource.readyState !== EventSource.OPEN) {
          console.log('Timeout de conexión SSE');
          eventSource.close();
        }
      }, 10000);

      eventSource.onopen = () => {
        console.log('SSE conectado exitosamente');
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setError(null);
        
        // Resetear contador de intentos y delay
        reconnectAttemptsRef.current = 0;
        reconnectDelayRef.current = 1000;
      };

      eventSource.addEventListener('stock-notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.body?.event === 'alert-stock') {
            const notification: Notification = {
              id: `${Date.now()}-${Math.random()}`,
              type: 'stock-alert',
              message: data.message || 'Alerta de stock bajo',
              products: data.body.response?.products || [],
              timestamp: data.body.response?.datetime || new Date().toISOString(),
              read: false
            };

            addOrUpdateNotification(notification);
          }
        } catch (err) {
          console.error('Error parsing notification:', err);
        }
      });

      eventSource.onerror = (error) => {
        console.log('Error en conexión SSE:', error);
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        
        // Cerrar la conexión actual
        eventSource.close();
        eventSourceRef.current = null;

        // Solo intentar reconectar si no hemos excedido el máximo de intentos
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          
          const currentDelay = Math.min(reconnectDelayRef.current, 30000);
          setError(`Conexión perdida. Reintentando en ${Math.round(currentDelay / 1000)}s... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reintentando conexión SSE (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
            connect();
          }, currentDelay);
          
          // Incrementar el delay para el próximo intento (backoff exponencial)
          reconnectDelayRef.current = Math.min(currentDelay * 1.5, 30000);
        } else {
          setError(`No se pudo restablecer la conexión después de ${maxReconnectAttempts} intentos`);
          console.error('Máximo de intentos de reconexión alcanzado');
        }
      };

    } catch (err) {
      setError('Error al inicializar conexión');
      console.error('Error al conectar:', err);
      
      // Intentar reconectar si no hemos alcanzado el máximo
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelayRef.current);
      }
    }
  }, [enabled, addOrUpdateNotification, clearReconnectTimeout]);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    reconnectDelayRef.current = 1000;
    connect();
  }, [connect]);

  // Efecto principal
  useEffect(() => {
    connect();

    // Manejar cambios de visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Verificar si la conexión está cerrada cuando la página vuelve a ser visible
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          console.log('Página visible y conexión cerrada, reconectando...');
          reconnect();
        }
      }
    };

    // Verificación periódica del estado de la conexión
    const healthCheck = setInterval(() => {
      if (enabled && (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED)) {
        console.log('Health check: conexión cerrada, intentando reconectar...');
        reconnect();
      }
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(healthCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearReconnectTimeout();
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, connect, reconnect, clearReconnectTimeout]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    isConnected,
    error,
    markAsRead,
    removeNotification,
    clearAll,
    reconnect,
    unreadCount: notifications.filter(n => !n.read).length,
    lowStockProducts: notifications.flatMap(n => n.products),
    reconnectAttempts: reconnectAttemptsRef.current
  };
};