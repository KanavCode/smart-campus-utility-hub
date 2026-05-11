import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface NotificationContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the backend WebSocket server
    const backendUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
      : 'http://localhost:5000';
      
    const socketInstance = io(backendUrl, {
      reconnection: true, // Automatically reconnects
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    // Listen for specific events
    socketInstance.on('TIMETABLE_GENERATED', (data: any) => {
      toast.success('Timetable Generated', {
        description: data?.message || 'A new full schedule is ready.',
        duration: 5000,
      });
    });

    socketInstance.on('EVENT_CREATED', (data: any) => {
      toast.info('New Campus Event', {
        description: data?.message || 'A club has pushed a new announcement.',
        duration: 5000,
      });
    });

    socketInstance.on('SLOT_UPDATED', (data: any) => {
      toast('Slot Updated', {
        description: data?.message || 'A class schedule or room has changed.',
        duration: 5000,
        style: {
          backgroundColor: '#eff6ff', // blue-50
          color: '#1d4ed8', // blue-700
          border: '1px solid #bfdbfe' // blue-200
        }
      });
    });

    socketInstance.on('SLOT_CANCELLED', (data: any) => {
      toast.error('Class Cancelled', {
        description: data?.message || 'A class has been cancelled.',
        duration: 5000,
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ socket, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
