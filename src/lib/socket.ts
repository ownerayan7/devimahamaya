import { io } from 'socket.io-client';

// Connect to the same host/origin automatically
const isBrowser = typeof window !== 'undefined';
export const socket = isBrowser ? io() : null;

if (socket) {
  socket.on('connect', () => {
    console.log('[WebSocket] Connected to real-time server!');
  });

  socket.on('disconnect', () => {
    console.log('[WebSocket] Disconnected from real-time server!');
  });
}
