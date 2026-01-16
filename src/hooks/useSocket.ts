import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/config/socket';
import { useAuthStore } from '@/store/authStore';

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket(options?: UseSocketOptions) {
  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect nếu không authenticated
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
      return;
    }

    try {
      // Connect socket
      const socket = connectSocket();
      socketRef.current = socket;

      // Setup event handlers
      socket.on('connect', () => {
        console.log('Socket connected in hook');
        options?.onConnect?.();
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected in hook');
        options?.onDisconnect?.();
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error in hook:', error);
        options?.onError?.(error as Error);
      });

      // Cleanup function
      return () => {
        // Không disconnect ở đây vì có thể các components khác đang dùng
        // Chỉ remove listeners
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      };
    }
    catch (error) {
      console.error('Failed to connect socket:', error);
      options?.onError?.(error as Error);
    }
  }, [isAuthenticated]);

  // Cleanup khi component unmount hoặc logout
  useEffect(() => {
    return () => {
      // Chỉ disconnect khi logout
      if (!isAuthenticated && socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
}
