import { io, Socket } from 'socket.io-client';
import { getAuthStore } from '@/store';
import { getTokenFromStorage } from '@/utils/tokenManager';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = (): Socket => {
  // Lấy token từ store hoặc storage
  const authState = getAuthStore();
  let token = authState.accessToken;
  
  if (!token) {
    token = getTokenFromStorage();
  }

  if (!token) {
    console.warn('No token available for socket connection');
    throw new Error('No authentication token available');
  }

  // Nếu đã có socket và đang connected thì kiểm tra xem có cần reconnect không
  // (Nếu token thay đổi thì cần reconnect)
  if (socket?.connected) {
    // Kiểm tra token hiện tại của socket (nếu có)
    const currentToken = (socket.auth as any)?.token;
    if (currentToken === token) {
      return socket; // Cùng token, không cần reconnect
    }
    // Token khác, cần disconnect và reconnect
    socket.disconnect();
    socket = null;
  }

  // Disconnect socket cũ nếu có (chưa connected)
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Tạo socket connection với token trong auth
  const apiUrl = import.meta.env.VITE_SOCKET_API_URL;
  socket = io(apiUrl, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
    console.log('Socket will automatically join room "orders" on backend');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
