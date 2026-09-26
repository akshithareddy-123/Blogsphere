import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to BlogSphere real-time gateway:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });
  }
  return socket;
};

export default getSocket;
